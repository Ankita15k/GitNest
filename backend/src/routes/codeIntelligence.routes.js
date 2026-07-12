import express from 'express';
import { optionalAuth, protect } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';
import schemaValidator from '../middleware/schemaValidator.js';
import { contracts } from '../contracts/index.js';
import { repoParamValidator } from '../validators/repository.validators.js';
import {
  dependencyImpactValidator,
  dependencyListValidator,
  indexIdValidator,
  symbolNameValidator,
  symbolDetailValidator,
  symbolSearchValidator,
} from '../validators/codeIntelligence.validators.js';
import {
  getDependencyImpact,
  getIndexingStatus,
  getSymbolDependencies,
  getSymbolDetails,
  listDependencies,
  rebuildDependencies,
  searchSymbols,
  triggerIndexing,
} from '../controllers/codeIntelligence.controller.js';

const router = express.Router();

router.post(
  '/:username/:reponame/index',
  protect,
  ...schemaValidator(contracts.codeIntelligence.triggerIndex),
  validate(repoParamValidator),
  triggerIndexing
);

router.get(
  '/:username/:reponame/index/status/:indexId',
  protect,
  ...schemaValidator(contracts.codeIntelligence.indexStatus),
  validate(indexIdValidator),
  getIndexingStatus
);

router.get(
  '/:username/:reponame/symbols/search',
  optionalAuth,
  ...schemaValidator(contracts.codeIntelligence.searchSymbols),
  validate(symbolSearchValidator),
  searchSymbols
);

router.get(
  '/:username/:reponame/symbols/:symbolId',
  optionalAuth,
  ...schemaValidator(contracts.codeIntelligence.symbolDetails),
  validate(symbolDetailValidator),
  getSymbolDetails
);

router.post(
  '/:username/:reponame/dependencies/rebuild',
  protect,
  ...schemaValidator(contracts.codeIntelligence.rebuildDependencies),
  validate(repoParamValidator),
  rebuildDependencies
);

router.get(
  '/:username/:reponame/dependencies',
  protect,
  ...schemaValidator(contracts.codeIntelligence.listDependencies),
  validate(dependencyListValidator),
  listDependencies
);

router.get(
  '/:username/:reponame/dependencies/impact',
  protect,
  ...schemaValidator(contracts.codeIntelligence.dependencyImpact),
  validate(dependencyImpactValidator),
  getDependencyImpact
);

router.get(
  '/:username/:reponame/dependencies/symbol/:symbolName',
  protect,
  ...schemaValidator(contracts.codeIntelligence.symbolDependencies),
  validate(symbolNameValidator),
  getSymbolDependencies
);

export default router;
