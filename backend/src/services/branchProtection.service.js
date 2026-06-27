import BranchProtectionRule from '../models/BranchProtectionRule.model.js';

const assertStatusChecksSupported = (data = {}) => {
  if (data.requireStatusChecks === true) {
    throw new Error('Status checks are not yet supported.');
  }
};

const buildUpdatePayload = (data = {}) => {
  const payload = {};

  for (const field of [
    'branchPattern',
    'requirePullRequest',
    'requiredApprovalsCount',
    'requireStatusChecks',
  ]) {
    if (data[field] !== undefined) {
      payload[field] = data[field];
    }
  }

  return payload;
};

export const listRules = async (repositoryId) => {
  return BranchProtectionRule.find({ repositoryId }).sort({ createdAt: 1 });
};

export const createRule = async (repositoryId, data) => {
  assertStatusChecksSupported(data);

  const branchPattern = data.branchPattern?.trim();

  const existingRule = await BranchProtectionRule.findOne({
    repositoryId,
    branchPattern,
  });

  if (existingRule) {
    throw new Error('A rule for this branch pattern already exists.');
  }

  return BranchProtectionRule.create({
    repositoryId,
    branchPattern,
    requirePullRequest: data.requirePullRequest,
    requiredApprovalsCount: data.requiredApprovalsCount,
    requireStatusChecks: data.requireStatusChecks,
  });
};

export const updateRule = async (ruleId, repositoryId, data) => {
  assertStatusChecksSupported(data);

  const rule = await BranchProtectionRule.findOne({
    _id: ruleId,
    repositoryId,
  });

  if (!rule) {
    throw new Error('Rule not found.');
  }

  const payload = buildUpdatePayload(data);

  if (payload.branchPattern !== undefined) {
    const duplicateRule = await BranchProtectionRule.findOne({
      _id: { $ne: ruleId },
      repositoryId,
      branchPattern: payload.branchPattern.trim(),
    });

    if (duplicateRule) {
      throw new Error('A rule for this branch pattern already exists.');
    }

    payload.branchPattern = payload.branchPattern.trim();
  }

  Object.assign(rule, payload);
  await rule.save();
  return rule;
};

export const deleteRule = async (ruleId, repositoryId) => {
  const rule = await BranchProtectionRule.findOneAndDelete({
    _id: ruleId,
    repositoryId,
  });

  if (!rule) {
    throw new Error('Rule not found.');
  }

  return { deleted: true };
};
