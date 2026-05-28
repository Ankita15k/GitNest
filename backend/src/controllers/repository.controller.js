import fs from 'fs';
import path from 'path';
import simpleGit from 'simple-git';
import mongoose from 'mongoose';
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

        let result;
        if (alreadyStarred) {
            result = await Repository.updateOne(
                { _id: repository._id, stars: req.user.id },
                { $pull: { stars: req.user.id } }
            );
        } else {
            result = await Repository.updateOne(
                { _id: repository._id, stars: { $ne: req.user.id } },
                { $addToSet: { stars: req.user.id } }
            );
        }

        if (result.modifiedCount > 0 && !alreadyStarred) {
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

        const updated = await Repository.findById(
            repository._id
        );

        const message = alreadyStarred
            ? 'Repository unstarred successfully'
            : 'Repository starred successfully';

        sendSuccess(
            res,
            200,
            { stars: updated.stars.length },
            message
        );
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

        const session = await mongoose.startSession();
        let forked;

        try {
            session.startTransaction();

            const existingQuery = Repository.findOne({
                name: reponame,
                owner: req.user.id,
                forkedFrom: original._id,
            });
            const existing = typeof existingQuery?.session === 'function'
                ? await existingQuery.session(session)
                : await existingQuery;

            if (existing) {
                await session.abortTransaction();
                return next(
                    new AppError(
                        'You have already forked this repository',
                        400
                    )
                );
            }

            [forked] = await Repository.create(
                [
                    {
                        name: original.name,
                        owner: req.user.id,
                        description: original.description,
                        visibility: original.visibility,
                        language: original.language,
                        topics: original.topics,
                        defaultBranch: original.defaultBranch,
                        forkedFrom: original._id,
                    },
                ],
                { session }
            );

        // Resolve a safe fork name — auto-suffix if original name is taken
        // by a non-fork repo already in the user's account
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
            }
        }

        const forked = await Repository.create({
            name: forkName,
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

        sendSuccess(
            res,
            201,
            forked,
            'Repository forked successfully'
        );
    }
);