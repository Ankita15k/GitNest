import Repository from '../models/Repository.model.js';
import User from '../models/User.model.js';
import {
  createRule as createBranchProtectionRule,
  deleteRule as deleteBranchProtectionRule,
  listRules as listBranchProtectionRules,
  updateRule as updateBranchProtectionRule,
} from '../services/branchProtection.service.js';
import eventEmitter from '../events/eventEmitter.js';

const forbiddenMessage =
  'Forbidden: only the repository owner can manage branch protection rules.';

const resolveRepository = async (username, reponame) => {
  const owner = await User.findOne({ username: username.toLowerCase() });

  if (!owner) {
    return null;
  }

  const repository = await Repository.findOne({
    name: reponame,
    owner: owner._id,
  });

  return repository || null;
};

const assertOwner = (res, repository, userId) => {
  if (repository.owner.toString() !== userId.toString()) {
    res.status(403).json({ message: forbiddenMessage });
    return false;
  }

  return true;
};

const handleRepositoryLookup = async (res, username, reponame) => {
  const repository = await resolveRepository(username, reponame);

  if (!repository) {
    res.status(404).json({ message: 'Repository not found.' });
    return null;
  }

  return repository;
};

export const listRules = async (req, res) => {
  try {
    const { username, reponame } = req.params;
    const repository = await handleRepositoryLookup(res, username, reponame);

    if (!repository) return;
    if (!assertOwner(res, repository, req.user.id)) return;

    const rules = await listBranchProtectionRules(repository._id);
    return res.status(200).json(rules);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const createRule = async (req, res) => {
  try {
    const { username, reponame } = req.params;
    const repository = await handleRepositoryLookup(res, username, reponame);

    if (!repository) return;
    if (!assertOwner(res, repository, req.user.id)) return;

    try {
      const rule = await createBranchProtectionRule(repository._id, req.body);
      eventEmitter.emit('BRANCH_PROTECTION_CREATED', {
        actorId: req.user._id,
        repositoryId: rule.repositoryId,
        repoName: req.params.reponame,
        branch: rule.branchPattern,
        rules: rule.toObject(),
        ipAddress: req.ip,
      });
      return res.status(201).json(rule);
    } catch (error) {
      return res.status(422).json({ message: error.message });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const updateRule = async (req, res) => {
  try {
    const { username, reponame, ruleId } = req.params;
    const repository = await handleRepositoryLookup(res, username, reponame);

    if (!repository) return;
    if (!assertOwner(res, repository, req.user.id)) return;

    try {
      const rule = await updateBranchProtectionRule(ruleId, repository._id, req.body);
      eventEmitter.emit('BRANCH_PROTECTION_UPDATED', {
        actorId: req.user._id,
        repositoryId: rule.repositoryId,
        repoName: req.params.reponame,
        branch: rule.branchPattern,
        ruleId: rule._id,
        changes: req.body,
        ipAddress: req.ip,
      });
      return res.status(200).json(rule);
    } catch (error) {
      return res.status(422).json({ message: error.message });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const deleteRule = async (req, res) => {
  try {
    const { username, reponame, ruleId } = req.params;
    const repository = await handleRepositoryLookup(res, username, reponame);

    if (!repository) return;
    if (!assertOwner(res, repository, req.user.id)) return;

    try {
      const result = await deleteBranchProtectionRule(ruleId, repository._id);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(422).json({ message: error.message });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
