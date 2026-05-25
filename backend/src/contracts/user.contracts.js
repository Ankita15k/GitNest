import { sharedSchemas } from './components.js';

const profileBody = {
  type: 'object',
  additionalProperties: false,
  properties: {
    bio: { type: 'string', maxLength: 280 },
    location: { type: 'string', maxLength: 100 },
    website: { type: 'string', maxLength: 200 },
    avatarUrl: { type: 'string', maxLength: 500 },
    displayName: { type: 'string', maxLength: 100 },
    company: { type: 'string', maxLength: 100 },
    twitterHandle: { type: 'string', maxLength: 50 },
  },
};

const userListData = (key) => ({
  type: 'object',
  additionalProperties: false,
  properties: {
    [key]: { type: 'array', items: sharedSchemas.user },
    pagination: sharedSchemas.pagination,
  },
  required: [key, 'pagination'],
});

export const userContracts = {
  profile: {
    tags: ['Users'],
    summary: 'Fetch a user profile',
    request: { params: sharedSchemas.usernameParam },
    responses: {
      200: sharedSchemas.successEnvelope(sharedSchemas.user),
    },
  },
  updateProfile: {
    tags: ['Users'],
    summary: 'Update current user profile',
    security: [{ bearerAuth: [] }],
    request: { body: profileBody },
    responses: {
      200: sharedSchemas.successEnvelope(sharedSchemas.user),
    },
  },
  follow: {
    tags: ['Users'],
    summary: 'Follow a user',
    security: [{ bearerAuth: [] }],
    request: { params: sharedSchemas.usernameParam },
    responses: {
      200: sharedSchemas.successEnvelope({ type: 'null' }),
    },
  },
  unfollow: {
    tags: ['Users'],
    summary: 'Unfollow a user',
    security: [{ bearerAuth: [] }],
    request: { params: sharedSchemas.usernameParam },
    responses: {
      200: sharedSchemas.successEnvelope({ type: 'null' }),
    },
  },
  followers: {
    tags: ['Users'],
    summary: 'List user followers',
    request: {
      params: sharedSchemas.usernameParam,
      query: sharedSchemas.paginationQuery,
    },
    responses: {
      200: sharedSchemas.successEnvelope(userListData('followers')),
    },
  },
  following: {
    tags: ['Users'],
    summary: 'List followed users',
    request: {
      params: sharedSchemas.usernameParam,
      query: sharedSchemas.paginationQuery,
    },
    responses: {
      200: sharedSchemas.successEnvelope(userListData('following')),
    },
  },
};
