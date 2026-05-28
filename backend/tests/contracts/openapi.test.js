import { describe, expect, test } from '@jest/globals';
import swaggerSpec from '../../src/config/swagger.js';

describe('OpenAPI contract', () => {
  test('publishes reusable OpenAPI components and security', () => {
    expect(swaggerSpec.openapi).toMatch(/^3\./);
    expect(swaggerSpec.components.schemas.SuccessEnvelope).toBeDefined();
    expect(swaggerSpec.components.schemas.ErrorEnvelope).toBeDefined();
    expect(swaggerSpec.components.securitySchemes.bearerAuth).toMatchObject({ type: 'http', scheme: 'bearer' });
  });

  test('documents critical route groups', () => {
    expect(swaggerSpec.paths['/api/v1/auth/login'].post).toBeDefined();
    expect(swaggerSpec.paths['/api/v1/repositories/{username}/{reponame}'].get).toBeDefined();
    expect(swaggerSpec.paths['/api/v1/activities/global'].get).toBeDefined();
    expect(swaggerSpec.paths['/api/v1/pull-requests'].get).toBeDefined();
    expect(swaggerSpec.paths['/api/v1/pull-requests/{id}/comments'].post).toBeDefined();
  });
});
