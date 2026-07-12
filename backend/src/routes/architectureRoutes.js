import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';
import schemaValidator from '../middleware/schemaValidator.js';
import { contracts } from '../contracts/index.js';
import { architectureModuleValidator, architectureRepoValidator } from '../validators/architecture.validators.js';
import { analyze, getHotspots, getLegacyArchitecture, getModule, getRisk } from '../controllers/architectureController.js';

const router = express.Router();

router.get(
  '/:username/:reponame/architecture',
  protect,
  ...schemaValidator(contracts.architecture.get),
  validate(architectureRepoValidator),
  analyze
);

router.get(
  '/:username/:reponame/architecture/hotspots',
  protect,
  ...schemaValidator(contracts.architecture.hotspots),
  validate(architectureRepoValidator),
  getHotspots
);

router.get(
  '/:username/:reponame/architecture/risk',
  protect,
  ...schemaValidator(contracts.architecture.risk),
  validate(architectureRepoValidator),
  getRisk
);

router.get(
  '/:username/:reponame/architecture/module/:moduleName',
  protect,
  ...schemaValidator(contracts.architecture.module),
  validate(architectureModuleValidator),
  getModule
);

router.get('/:owner/:repo', protect, getLegacyArchitecture);

export default router;
