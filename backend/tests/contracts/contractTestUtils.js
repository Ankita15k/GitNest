import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { sharedSchemas } from '../../src/contracts/index.js';

export const createContractAjv = () => {
  const ajv = new Ajv({
    allErrors: true,
    strict: false,
  });
  addFormats(ajv);
  return ajv;
};

export const expectSuccessContract = (payload, dataSchema = {}) => {
  const ajv = createContractAjv();
  const validate = ajv.compile(sharedSchemas.successEnvelope(dataSchema));
  expect(validate(payload)).toBe(true);
};

export const expectErrorContract = (payload) => {
  const ajv = createContractAjv();
  const validate = ajv.compile(sharedSchemas.errorEnvelope);
  expect(validate(payload)).toBe(true);
};

export const expectPaginationContract = (pagination) => {
  const ajv = createContractAjv();
  const validate = ajv.compile(sharedSchemas.pagination);
  expect(validate(pagination)).toBe(true);
};
