import Repository from '../models/Repository.model.js';
import User from '../models/User.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { sendSuccess } from '../utils/responseHandlers.js';
import { logActivity } from '../services/activity.service.js';
import ACTIVITY_TYPES from '../constants/activityTypes.js';

// Resolves a username URL param to the owner's _id; returns null when not found.
const resolveOwner = (username) =>
    User.findOne({ username: username.toLowerCase() }).select('_id');

export const createRepository = asyncHandler(async (req, res, next)=> {
    const { name, description, visibility, language, topics } = req.body;

    if(!name) {
        return next(new AppError('Repository name is required', 400));
    }

    const existingRepo = await Repository.findOne({
        owner: req.user.id,
        name,
    });

    if (existingRepo) {
        return next(
            new AppError('You already have a repository with this name', 400)
        );
    }

    const repository = await Repository.create({
        name,
        owner: req.user.id,
        description,
        visibility,
        language,
        topics,
    });

    try {
        await logActivity({
            actor: req.user.id,
            type: ACTIVITY_TYPES.REPOSITORY_CREATED,
            repository: repository._id,
            metadata: {
                repoName: repository.name,
                visibility: repository.visibility,
            },
        });
    } catch {
        // Prevent activity logging failures from blocking repository creation
    }

    sendSuccess(res, 201, repository, 'Repository created successfully');
});

export const getRepository = asyncHandler(async (req, res, next) => {
    const { username, reponame } = req.params;

    const owner = await resolveOwner(username);
    if (!owner) {
        return next(new AppError('Repository not found', 404));
    }

    const repository = await Repository.findOne({ name: reponame, owner: owner._id })
        .populate('owner', 'username avatarUrl bio');

    if (!repository) {
        return next(new AppError('Repository not found', 404));
    }

    if (
        repository.visibility === 'private' &&
        repository.owner._id.toString() !== req.user?.id
    ) {
        return next(new AppError('Repository not found', 404));
    }

    sendSuccess(res, 200, repository);
});

export const getUserRepositories = asyncHandler(async (req, res, next) => {
    const { username } = req.params;

    const owner = await resolveOwner(username);
    if (!owner) {
        return next(new AppError('User not found', 404));
    }

    // Only expose private repos to the authenticated owner; everyone else sees public only.
    const visibilityFilter =
        req.user && req.user.id === owner._id.toString()
            ? {}
            : { visibility: 'public' };

    const repositories = await Repository.find({
        owner: owner._id,
        ...visibilityFilter,
    }).populate('owner', 'username avatarUrl');

    sendSuccess(res, 200, repositories);
});

export const updateRepository = asyncHandler(async(req, res, next) => {
    const { username, reponame } = req.params;

    const repository = await Repository.findOne({
        name: reponame,
        owner: req.user.id,
    });

    if(!repository) {
        return next(new AppError('Repository not found', 404));
    }

    const { description, visibility, language, topics, defaultBranch } =
    req.body;

    repository.description = description ?? repository.description;
    repository.visibility = visibility ?? repository.visibility;
    repository.language = language ?? repository.language;
    repository.topics = topics ?? repository.topics;
    repository.defaultBranch = defaultBranch ?? repository.defaultBranch;

    await repository.save();

    sendSuccess(res, 200, repository, 'Repository updated successfully');
});

export const deleteRepository = asyncHandler(async (req, res, next) => {
    const { reponame } = req.params;

    const repository = await Repository.findOne({
        name: reponame,
        owner: req.user.id,
    });

    if(!repository) {
        return next(new AppError('Repository not found', 404));
    }

    await repository.deleteOne();

    sendSuccess(res, 200, null, 'Repository deleted successfully');
});

export const starRepository = asyncHandler(async(req, res, next) => {
    const { username, reponame } = req.params;

    const owner = await resolveOwner(username);
    if (!owner) {
        return next(new AppError('Repository not found', 404));
    }

    const repository = await Repository.findOne({ name: reponame, owner: owner._id });

    if(!repository) {
        return next(new AppError('Repository not found', 404));
    }

    const alreadyStarred = repository.stars.includes(req.user.id);

    if (alreadyStarred) {
        repository.stars = repository.stars.filter(
            (id) => id.toString() !== req.user.id
        );
    } else {
        repository.stars.push(req.user.id);
    }

    await repository.save();

    if (!alreadyStarred) {
        try {
            await logActivity({
                actor: req.user.id,
                type: ACTIVITY_TYPES.REPOSITORY_STARRED,
                repository: repository._id,
                metadata: {
                    repoName: repository.name,
                },
            });
        } catch {
            // Prevent activity logging failures from blocking star actions
        }
    }

    const message = alreadyStarred
    ? 'Repository unstarred successfully'
    : 'Repository starred successfully';

    sendSuccess(res, 200, { stars: repository.stars.length }, message);
});

export const forkRepository = asyncHandler(async (req, res, next) => {
    const { username, reponame } = req.params;

    const owner = await resolveOwner(username);
    if (!owner) {
        return next(new AppError('Repository not found', 404));
    }

    const original = await Repository.findOne({ name: reponame, owner: owner._id });

    if(!original) {
        return next(new AppError('Repository not found', 404));
    }

    if (original.owner.toString() === req.user.id) {
        return next(new AppError('You cannot fork your own repository', 404));
    }

    const alreadyForked = await Repository.findOne({
        name: reponame,
        owner: req.user.id,
        forkedFrom: original._id,
    });

    if(alreadyForked) {
        return next(new AppError('You have already forked this repository', 400));
    }

    const forked = await Repository.create({
    name: original.name,
    owner: req.user.id,
    description: original.description,
    visibility: 'public',
    language: original.language,
    topics: original.topics,
    defaultBranch: original.defaultBranch,
    forkedFrom: original._id,
    });

    original.forks.push(forked._id);
    await original.save();

    sendSuccess(res, 201, forked, 'Repository forked successfully');
});
