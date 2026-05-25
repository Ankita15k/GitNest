import { components, sharedSchemas } from './components.js';
import { authContracts } from './auth.contracts.js';
import { repositoryContracts } from './repository.contracts.js';
import { userContracts } from './user.contracts.js';
import { activityContracts } from './activity.contracts.js';
import { pullRequestContracts } from './pullRequest.contracts.js';

export const contracts = {
  auth: authContracts,
  repositories: repositoryContracts,
  users: userContracts,
  activities: activityContracts,
  pullRequests: pullRequestContracts,
};

export { components, sharedSchemas };
