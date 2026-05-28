import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { sharedSchemas } from '../../src/contracts/index.js';

export const createContractAjv = () => {
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  return ajv;
};

export const expectSuccessContract = (payload, dataSchema = {}) => {
  const validate = createContractAjv().compile(sharedSchemas.successEnvelope(dataSchema));
  expect(validate(payload)).toBe(true);
};

export const expectErrorContract = (payload) => {
  const validate = createContractAjv().compile(sharedSchemas.errorEnvelope);
  expect(validate(payload)).toBe(true);
};
