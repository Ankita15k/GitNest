import { describe, test } from '@jest/globals';
import { expectErrorContract, expectSuccessContract } from './contractTestUtils.js';
import { sharedSchemas } from '../../src/contracts/index.js';

describe('standard response contracts', () => {
  test('validates success and error envelopes', () => {
    expectSuccessContract({
      success: true,
      status: 'success',
      message: 'ok',
      data: { username: 'tester' },
      requestId: 'request-id',
    }, sharedSchemas.user);

    expectErrorContract({
      success: false,
      status: 'fail',
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      errors: [{ field: 'body.email', message: 'must be valid' }],
      requestId: 'request-id',
      timestamp: new Date().toISOString(),
    });
  });
});
