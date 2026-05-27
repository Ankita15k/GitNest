const templates = {
  javascript: `node_modules/
.env
dist/
build/
coverage/
`,

  typescript: `node_modules/
.env
dist/
build/
coverage/
*.tsbuildinfo
`,

  python: `__pycache__/
*.pyc
venv/
.env
.pytest_cache/
`,

  java: `target/
*.class
*.jar
.idea/
.gradle/
`,

  cpp: `*.o
*.out
build/
bin/
`,

  c: `*.o
*.out
build/
bin/
`,

  go: `bin/
pkg/
*.exe
*.test
vendor/
`,

  rust: `target/
Cargo.lock
`,

  php: `vendor/
.env
composer.lock
`,

  ruby: `.bundle/
vendor/bundle/
log/
tmp/
`,

  default: `.env
node_modules/
`,
};

export const generateGitignore = (language = '') => {
  const normalized = language.trim().toLowerCase();

  return templates[normalized] || templates.default;
};
