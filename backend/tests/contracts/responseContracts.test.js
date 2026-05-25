import { describe, expect, test } from '@jest/globals';
import { expectErrorContract, expectPaginationContract, expectSuccessContract } from './contractTestUtils.js';
import { sharedSchemas } from '../../src/contracts/index.js';

describe('standard response contracts', () => {
  test('validates success envelopes', () => {
    expectSuccessContract({
      success: true,
      status: 'success',
      message: 'ok',
      data: { username: 'tester' },
      requestId: 'request-id',
    }, sharedSchemas.user);
  });

  test('validates error envelopes', () => {
    expectErrorContract({
      success: false,
      status: 'fail',
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      errors: [{ field: 'body.email', message: 'must match format "email"' }],
      requestId: 'request-id',
      timestamp: new Date().toISOString(),
    });
  });

  test('validates pagination metadata variants', () => {
    expectPaginationContract({
      page: 1,
      limit: 20,
      totalCount: 0,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    });

    expectPaginationContract({
      page: 1,
      limit: 20,
      totalItems: 0,
      totalPages: 1,
    });
  });
});
