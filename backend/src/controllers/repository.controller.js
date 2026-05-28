import fs from 'fs';
import path from 'path';
import simpleGit from 'simple-git';
import Repository from '../models/Repository.model.js';
import User from '../models/User.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { sendSuccess } from '../utils/responseHandlers.js';
import { logActivity } from '../services/activity.service.js';
import ACTIVITY_TYPES from '../constants/activityTypes.js';
import paginate, { buildPaginationMeta } from '../utils/paginate.js';
import { generateReadme } from '../utils/templates/readmeTemplates.js';
import { generateGitignore } from '../utils/templates/gitignoreTemplates.js';
import { v4 as uuidv4 } from 'uuid';
import SagaOrchestrator from '../services/saga/sagaOrchestrator.js';
import eventEmitter from '../events/eventEmitter.js';

// DRY helper — resolves a :username param to the owner document's _id.
// Returns null when the username does not exist so callers can 404 cleanly.
const resolveOwner = async (username) => {
    const owner = await User.findOne({ username: username.toLowerCase() });
    return owner ? { _id: owner._id } : null;
};

export const createRepository = asyncHandler(async (req, res, next) => {
  const { name, description, visibility, language, topics } = req.body;

  if (!name) {
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
    const repoPath = path.resolve(
      process.cwd(),
      'repositories',
      req.user.id,
      repository.name
    );

    fs.mkdirSync(repoPath, { recursive: true });

    const git = simpleGit(repoPath);

    await git.init();
	  
	const readmePath = path.join(repoPath, 'README.md');
	  fs.writeFileSync(
		  readmePath,
		  generateReadme(repository, req.user.username)
	  );

	const gitignorePath = path.join(repoPath, '.gitignore');
	  fs.writeFileSync(
		  gitignorePath,
		  generateGitignore(repository.language)
	  );
	  
  } catch (error) {
    await repository.deleteOne();

    return next(
      new AppError(
        'Failed to initialize repository storage',
        500
      )
    );
  }

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

  sendSuccess(
    res,
    201,
    repository,
    'Repository created successfully'
  );
});

export const getRepository = asyncHandler(async (req, res, next) => {
    const { username, reponame } = req.params;

    const owner = await resolveOwner(username);
    if (!owner) return next(new AppError('Repository not found', 404));

    const repository = await Repository.findOne({
        name: reponame,
        owner: owner._id,
    }).populate('owner', 'username avatarUrl bio');

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

export const getUserRepositories = asyncHandler(
    async (req, res, next) => {
        const { username } = req.params;

        const { page, limit, skip } = paginate(
            req.query.page,
            req.query.limit
        );

        const user = await resolveOwner(username);
        if (!user) return next(new AppError('User not found', 404));

        // Owners can view all repositories
        // Others can only view public repositories
        const filter = {
            owner: user._id,
            ...(req.user?.id !== user._id.toString() && {
                visibility: 'public',
            }),
        };

        const [repositories, totalCount] = await Promise.all([
            Repository.find(filter)
                .populate('owner', 'username avatarUrl')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),

            Repository.countDocuments(filter),
        ]);

        const pagination = buildPaginationMeta(
            page,
            limit,
            totalCount
        );

        sendSuccess(res, 200, {
            repositories,
            pagination,
        });
    }
);

export const updateRepository = asyncHandler(
    async (req, res, next) => {
        const { username, reponame } = req.params;

        const owner = await resolveOwner(username);
        if (!owner || owner._id.toString() !== req.user.id) {
            return next(new AppError('Repository not found or unauthorized', 404));
        }

        const repository = await Repository.findOne({
            name: reponame,
            owner: req.user.id,
        });

        if (!repository) {
            return next(new AppError('Repository not found', 404));
        }

        const {
            description,
            visibility,
            language,
            topics,
            defaultBranch,
        } = req.body;

        repository.description =
            description ?? repository.description;

        repository.visibility =
            visibility ?? repository.visibility;

        repository.language =
            language ?? repository.language;

        repository.topics =
            topics ?? repository.topics;

        repository.defaultBranch =
            defaultBranch ?? repository.defaultBranch;

        await repository.save();

        sendSuccess(
            res,
            200,
            repository,
            'Repository updated successfully'
        );
    }
);

export const deleteRepository = asyncHandler(
    async (req, res, next) => {
        const { username, reponame } = req.params;

        const owner = await resolveOwner(username);
        if (!owner || owner._id.toString() !== req.user.id) {
            return next(new AppError('Repository not found or unauthorized', 404));
        }

        const repository = await Repository.findOne({
            name: reponame,
            owner: req.user.id,
        });

        if (!repository) {
            return next(new AppError('Repository not found', 404));
        }

        await repository.deleteOne();

        sendSuccess(
            res,
            200,
            null,
            'Repository deleted successfully'
        );
    }
);

export const starRepository = asyncHandler(
    async (req, res, next) => {
        const { username, reponame } = req.params;

        const owner = await resolveOwner(username);
        if (!owner) return next(new AppError('Repository not found', 404));

        const repository = await Repository.findOne({
            name: reponame,
            owner: owner._id,
        });

        if (!repository) {
            return next(new AppError('Repository not found', 404));
        }

        if (
            repository.visibility === 'private' &&
            repository.owner.toString() !== req.user.id
        ) {
            return next(new AppError('Repository not found', 404));
        }

        const alreadyStarred = repository.stars.includes(
            req.user.id
        );

        const sagaId = req.headers['idempotency-key'] || uuidv4();
        const actorId = req.user.id;
        const repoId = repository._id.toString();

        if (alreadyStarred) {
            const unstarSteps = [
                {
                    name: 'updateRepositoryStars',
                    execute: async (context) => {
                        const result = await Repository.updateOne(
                            { _id: context.repoId, stars: context.actorId },
                            { $pull: { stars: context.actorId } }
                        );
                        if (result.matchedCount === 0) {
                            throw new AppError('Repository not found', 404);
                        }
                        context.wasStarred = result.modifiedCount > 0;
                    },
                    compensate: async (context) => {
                        if (context.wasStarred) {
                            await Repository.updateOne(
                                { _id: context.repoId, stars: { $ne: context.actorId } },
                                { $addToSet: { stars: context.actorId } }
                            );
                        }
                    }
                }
            ];

            try {
                await SagaOrchestrator.executeSaga(
                    sagaId,
                    'UNSTAR_REPOSITORY',
                    unstarSteps,
                    { actorId, repoId, repoName: repository.name }
                );

                eventEmitter.emit('REPOSITORY_UNSTARRED', {
                    actorId,
                    repoId,
                    repoName: repository.name,
                });

                const updated = await Repository.findById(repository._id);
                return sendSuccess(
                    res,
                    200,
                    { stars: updated.stars.length },
                    'Repository unstarred successfully'
                );
            } catch (error) {
                if (error instanceof AppError) return next(error);
                return next(new AppError(error.message || 'Unstar operation failed', 500));
            }
        } else {
            const starSteps = [
                {
                    name: 'updateRepositoryStars',
                    execute: async (context) => {
                        const result = await Repository.updateOne(
                            { _id: context.repoId, stars: { $ne: context.actorId } },
                            { $addToSet: { stars: context.actorId } }
                        );
                        if (result.matchedCount === 0) {
                            throw new AppError('Repository not found', 404);
                        }
                    },
                    compensate: async (context) => {
                        await Repository.updateOne(
                            { _id: context.repoId },
                            { $pull: { stars: context.actorId } }
                        );
                    }
                }
            ];

            try {
                await SagaOrchestrator.executeSaga(
                    sagaId,
                    'STAR_REPOSITORY',
                    starSteps,
                    { actorId, repoId, repoName: repository.name }
                );

                eventEmitter.emit('REPOSITORY_STARRED', {
                    actorId,
                    repoId,
                    repoName: repository.name,
                });

                const updated = await Repository.findById(repository._id);
                return sendSuccess(
                    res,
                    200,
                    { stars: updated.stars.length },
                    'Repository starred successfully'
                );
            } catch (error) {
                if (error instanceof AppError) return next(error);
                return next(new AppError(error.message || 'Star operation failed', 500));
            }
        }
    }
);

export const forkRepository = asyncHandler(
    async (req, res, next) => {
        const { username, reponame } = req.params;

        const owner = await resolveOwner(username);
        if (!owner) return next(new AppError('Repository not found', 404));

        const original = await Repository.findOne({
            name: reponame,
            owner: owner._id,
        });

        if (!original) {
            return next(new AppError('Repository not found', 404));
        }

        if (
            original.visibility === 'private' &&
            original.owner.toString() !== req.user.id
        ) {
            return next(new AppError('Repository not found', 404));
        }

        if (original.owner.toString() === req.user.id) {
            return next(
                new AppError(
                    'You cannot fork your own repository',
                    400
                )
            );
        }

        const existing = await Repository.findOne({
            forkedFrom: original._id,
            owner: req.user.id,
        });

        if (existing) {
            return next(
                new AppError(
                    'You have already forked this repository',
                    400
                )
            );
        }

        // Resolve a safe fork name — auto-suffix if original name is taken
        let forkName = original.name;
        const nameConflict = await Repository.findOne({
            owner: req.user.id,
            name: forkName,
        });

        if (nameConflict) {
            forkName = `${original.name}-fork`;
            const suffixConflict = await Repository.findOne({
                owner: req.user.id,
                name: forkName,
            });
            if (suffixConflict) {
                return next(
                    new AppError(
                        `A repository named "${forkName}" already exists in your account. Please rename it first.`,
                        409
                    )
                );
        const sagaId = req.headers['idempotency-key'] || uuidv4();
        const actorId = req.user.id;

        const forkSteps = [
            {
                name: 'resolveAndValidate',
                execute: async (context) => {
                    const existing = await Repository.findOne({
                        name: original.name,
                        owner: context.actorId,
                        forkedFrom: original._id,
                    });
                    if (existing) {
                        throw new AppError('You have already forked this repository', 400);
                    }
                },
                compensate: null
            },
            {
                name: 'resolveForkName',
                execute: async (context) => {
                    let forkName = original.name;
                    const nameConflict = await Repository.findOne({
                        owner: context.actorId,
                        name: forkName,
                    });

                    if (nameConflict) {
                        forkName = `${original.name}-fork`;
                        const suffixConflict = await Repository.findOne({
                            owner: context.actorId,
                            name: forkName,
                        });
                        if (suffixConflict) {
                            throw new AppError(
                                `A repository named "${forkName}" already exists in your account. Please rename it first.`,
                                409
                            );
                        }
                    }
                    context.forkName = forkName;
                },
                compensate: null
            },
            {
                name: 'createForkedDoc',
                execute: async (context) => {
                    const [forked] = await Repository.create([
                        {
                            name: context.forkName,
                            owner: context.actorId,
                            description: original.description,
                            visibility: original.visibility || 'public',
                            language: original.language,
                            topics: original.topics,
                            defaultBranch: original.defaultBranch,
                            forkedFrom: original._id,
                        }
                    ]);
                    context.forkedId = forked._id.toString();
                    context.forkedRepo = forked;
                },
                compensate: async (context) => {
                    if (context.forkedId) {
                        await Repository.deleteOne({ _id: context.forkedId });
                    }
                }
            },
            {
                name: 'updateOriginalForks',
                execute: async (context) => {
                    await Repository.findByIdAndUpdate(original._id, {
                        $addToSet: { forks: context.forkedId }
                    });
                },
                compensate: async (context) => {
                    if (context.forkedId) {
                        await Repository.findByIdAndUpdate(original._id, {
                            $pull: { forks: context.forkedId }
                        });
                    }
                }
            }
        ];

        try {
            const context = await SagaOrchestrator.executeSaga(
                sagaId,
                'FORK_REPOSITORY',
                forkSteps,
                { actorId }
            );

            eventEmitter.emit('REPOSITORY_FORKED', {
                actorId,
                repoId: context.forkedId,
                repoName: context.forkName,
            });

            sendSuccess(
                res,
                201,
                context.forkedRepo,
                'Repository forked successfully'
            );
        } catch (error) {
            if (error instanceof AppError) return next(error);
            return next(new AppError(error.message || 'Fork operation failed', error.statusCode || 500));
        }
    }
);