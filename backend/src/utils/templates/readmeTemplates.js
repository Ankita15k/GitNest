export const generateReadme = (repository, ownerUsername) => {
  return `# ${repository.name}

${repository.description?.trim() || 'Repository created with GitNest'}

## About

This repository was initialized using GitNest.

## Repository Information

- Owner: ${ownerUsername}
- Visibility: ${repository.visibility}
- Default Branch: ${repository.defaultBranch || 'main'}

## Getting Started

Clone the repository:

\`\`\`bash
git clone <repository-url>
\`\`\`

Navigate into the project directory:

\`\`\`bash
cd ${repository.name}
\`\`\`

Start building 🚀
`;
};
