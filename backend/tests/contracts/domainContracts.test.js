import { describe, expect, test } from '@jest/globals';
import { contracts } from '../../src/contracts/index.js';

describe('domain API contracts', () => {
  test('defines core domain contracts', () => {
    expect(contracts.auth.register.request.body.required).toEqual(['username', 'email', 'password']);
    expect(contracts.repositories.create.request.body.required).toEqual(['name']);
    expect(contracts.activities.user.request.params.required).toEqual(['username']);
    expect(contracts.pullRequests.create.request.body.required).toEqual(['title', 'repository', 'sourceBranch', 'targetBranch']);
    expect(contracts.users.follow.security).toEqual([{ bearerAuth: [] }]);
  });
});
