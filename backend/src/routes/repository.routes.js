import express from 'express';
import {
    createRepository,
    getRepository,
    getUserRepositories,
    updateRepository,
    deleteRepository,
    starRepository,
    forkRepository,
} from '../controllers/repository.controller.js';
import { protect } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';
import { repoParamValidator, createRepositoryValidator } from '../validators/repository.validators.js';

const router = express.Router();

router.get('/:username', getUserRepositories);
router.get('/:username/:reponame', validate(repoParamValidator), getRepository);
router.post('/', protect, validate(createRepositoryValidator), createRepository);
router.put('/:username/:reponame', protect, validate(repoParamValidator), updateRepository);
router.delete('/:username/:reponame', protect, validate(repoParamValidator), deleteRepository);
router.post('/:username/:reponame/star', protect, validate(repoParamValidator), starRepository);
router.post('/:username/:reponame/fork', protect, validate(repoParamValidator), forkRepository);

export default router;
