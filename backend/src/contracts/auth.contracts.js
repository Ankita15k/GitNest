import { sharedSchemas } from './components.js';

const registerBody = {
  type: 'object',
  additionalProperties: false,
  properties: {
    username: { type: 'string', minLength: 3, maxLength: 30 },
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 6 },
  },
  required: ['username', 'email', 'password'],
};

const loginBody = {
  type: 'object',
  additionalProperties: false,
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 6 },
  },
  required: ['email', 'password'],
};

export const authContracts = {
  register: {
    tags: ['Auth'],
    summary: 'Register a user',
    request: { body: registerBody },
    responses: {
      201: sharedSchemas.successEnvelope(sharedSchemas.authUser),
    },
  },
  login: {
    tags: ['Auth'],
    summary: 'Log in a user',
    request: { body: loginBody },
    responses: {
      200: sharedSchemas.successEnvelope(sharedSchemas.authUser),
    },
  },
  me: {
    tags: ['Auth'],
    summary: 'Fetch the current user',
    security: [{ bearerAuth: [] }],
    responses: {
      200: sharedSchemas.successEnvelope(sharedSchemas.user),
    },
  },
};
