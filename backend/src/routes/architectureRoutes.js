import express from 'express';
import { analyze } from '../controllers/architectureController.js';

const router = express.Router();

router.get('/:owner/:repo', analyze);

export default router;