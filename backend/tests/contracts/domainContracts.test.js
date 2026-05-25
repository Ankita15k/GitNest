import { describe, expect, test } from '@jest/globals';
import { contracts } from '../../src/contracts/index.js';

describe('domain API contracts', () => {
  test('defines auth contracts', () => {
    expect(contracts.auth.register.request.body.required).toEqual(['username', 'email', 'password']);
    expect(contracts.auth.login.responses[200]).toBeDefined();
    expect(contracts.auth.me.security).toEqual([{ bearerAuth: [] }]);
  });

  test('defines repository contracts', () => {
    expect(contracts.repositories.create.request.body.required).toEqual(['name']);
    expect(contracts.repositories.listByUser.request.query.properties.page).toBeDefined();
    expect(contracts.repositories.fork.responses[201]).toBeDefined();
  });

  test('defines activity contracts', () => {
    expect(contracts.activities.global.responses[200]).toBeDefined();
    expect(contracts.activities.user.request.params.required).toEqual(['username']);
    expect(contracts.activities.repository.request.params.required).toEqual(['repo']);
  });

  test('defines pull request contracts', () => {
    expect(contracts.pullRequests.create.request.body.required).toEqual([
      'title',
      'repository',
      'sourceBranch',
      'targetBranch',
    ]);
    expect(contracts.pullRequests.comment.request.body.required).toEqual(['body']);
    expect(contracts.pullRequests.review.request.body.properties.action.enum).toContain('approve');
  });

  test('defines user contracts', () => {
    expect(contracts.users.profile.request.params.required).toEqual(['username']);
    expect(contracts.users.follow.security).toEqual([{ bearerAuth: [] }]);
    expect(contracts.users.followers.request.query.properties.limit.maximum).toBe(50);
  });
});
