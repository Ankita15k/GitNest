import Repository from '../models/Repository.model.js';
import User from '../models/User.model.js';
import {
  createRule as createBranchProtectionRule,
  deleteRule as deleteBranchProtectionRule,
  listRules as listBranchProtectionRules,
  updateRule as updateBranchProtectionRule,
} from '../services/branchProtection.service.js';
import eventEmitter from '../events/eventEmitter.js';
import AppError from '../utils/AppError.js';

const forbiddenMessage =
  'Forbidden: only the repository owner can manage branch protection rules.';

const resolveRepository = async (username, reponame) => {
  const owner = await User.findOne({
    username: username.toLowerCase(),
  });

  if (!owner) {
    throw new AppError('Repository not found.', 404);
  }

  const repository = await Repository.findOne({
    name: reponame,
    owner: owner._id,
  });

  if (!repository) {
    throw new AppError('Repository not found.', 404);
  }

  return repository;
};

const assertRepositoryOwner = (repository, userId) => {
  if (repository.owner.toString() !== userId.toString()) {
    throw new AppError(forbiddenMessage, 403);
  }
};

export const listRules = async (req, res, next) => {
  try {
    const { username, reponame } = req.params;

    const repository = await resolveRepository(username, reponame);
    assertRepositoryOwner(repository, req.user.id);

    const rules = await listBranchProtectionRules(repository._id);

    return res.status(200).json(rules);
  } catch (error) {
    return next(error);
  }
};

export const createRule = async (req, res, next) => {
  try {
    const { username, reponame } = req.params;

    const repository = await resolveRepository(username, reponame);
    assertRepositoryOwner(repository, req.user.id);

    let rule;

    try {
      rule = await createBranchProtectionRule(repository._id, req.body);
    } catch (error) {
      throw new AppError(error.message, 422);
    }

    eventEmitter.emit('BRANCH_PROTECTION_CREATED', {
      actorId: req.user._id,
      repositoryId: rule.repositoryId,
      repoName: reponame,
      branch: rule.branchPattern,
      rules: rule.toObject(),
      ipAddress: req.ip,
    });

    return res.status(201).json(rule);
  } catch (error) {
    return next(error);
  }
};

export const updateRule = async (req, res, next) => {
  try {
    const { username, reponame, ruleId } = req.params;

    const repository = await resolveRepository(username, reponame);
    assertRepositoryOwner(repository, req.user.id);

    let rule;

    try {
      rule = await updateBranchProtectionRule(
        ruleId,
        repository._id,
        req.body,
      );
    } catch (error) {
      throw new AppError(error.message, 422);
    }

    eventEmitter.emit('BRANCH_PROTECTION_UPDATED', {
      actorId: req.user._id,
      repositoryId: rule.repositoryId,
      repoName: reponame,
      branch: rule.branchPattern,
      ruleId: rule._id,
      changes: req.body,
      ipAddress: req.ip,
    });

    return res.status(200).json(rule);
  } catch (error) {
    return next(error);
  }
};

export const deleteRule = async (req, res, next) => {
  try {
    const { username, reponame, ruleId } = req.params;

    const repository = await resolveRepository(username, reponame);
    assertRepositoryOwner(repository, req.user.id);

    let result;

    try {
      result = await deleteBranchProtectionRule(
        ruleId,
        repository._id,
      );
    } catch (error) {
      throw new AppError(error.message, 422);
    }

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};