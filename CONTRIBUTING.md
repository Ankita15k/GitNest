# Contributing to GitNest ✨

First off — **thank you** for considering contributing to GitNest! This project is part of **GSSoC 2026** and we welcome contributors of all skill levels.

Please read this guide fully before making your first contribution. It will save you time and avoid your PR being rejected.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Find Issues](#how-to-find-issues)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Commit Message Format](#commit-message-format)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Coding Standards](#coding-standards)
- [GSSoC Points System](#gssoc-points-system)
- [Getting Help](#getting-help)

---

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](./CODE_OF_CONDUCT.md). Please read it before contributing.

---

## How to Find Issues

1. Go to the [Issues tab](../../issues)
2. Filter by label:
   - `good first issue` — perfect for first-time contributors
   - `help wanted` — open for anyone to pick up
   - `level: easy` / `level: medium` / `level: hard` — difficulty levels
   - `gssoc26` — issues that count for GSSoC points
3. **Comment on the issue** saying you'd like to work on it
4. **Wait to be assigned** — do not start working until you are assigned
5. If you don't hear back within 48 hours, ping the admin in the issue comment

> ⚠️ PRs for unassigned issues will not be reviewed and may be closed without merging.

---

## Getting Started

### 1. Fork the repository

Click the **Fork** button at the top right of this page to create your own copy.

### 2. Clone your fork

```bash
git clone https://github.com/<your-username>/GitNest.git
cd GitNest
```

### 3. Add the upstream remote

```bash
git remote add upstream https://github.com/Ankita15k/GitNest.git
```

Verify with:
```bash
git remote -v
# origin    https://github.com/<your-username>/GitNest.git (fetch)
# upstream  https://github.com/Ankita15k/GitNest.git (fetch)
```

### 4. Set up the project

```bash
# Copy environment variables
cp server/.env.example server/.env

# Install server dependencies
cd backend && npm install

# Install Frontend dependencies
cd ../frontend && npm install
```

### 5. Run the development servers

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

---

## Development Workflow

### Always work on a new branch

**Never commit directly to `main` or `dev`.** Always create a new branch from the latest `dev`:

```bash
# Sync your fork with upstream first
git checkout dev
git pull upstream dev

# Create your feature branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-description
# or
git checkout -b docs/what-you-documented
```

### Branch naming conventions

| Type | Format | Example |
|---|---|---|
| New feature | `feature/short-description` | `feature/user-profile-page` |
| Bug fix | `fix/short-description` | `fix/login-redirect-loop` |
| Documentation | `docs/short-description` | `docs/setup-instructions` |
| Refactor | `refactor/short-description` | `refactor/auth-middleware` |
| Test | `test/short-description` | `test/repo-controller` |

### Before pushing

```bash
# Run linter
npm run lint

# Run tests
npm test

# Make sure the app still works
npm run dev
```

### Push your branch

```bash
git push origin feature/your-feature-name
```

Then open a Pull Request from your fork to the **`dev` branch** of the upstream repo.

---

## Commit Message Format

We follow the **Conventional Commits** specification. Each commit message must be structured as:

```
<type>(<scope>): <short summary>
```

**Types:**

| Type | When to use |
|---|---|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes only |
| `style` | Formatting, missing semicolons — no logic change |
| `refactor` | Code restructuring without feature/fix |
| `test` | Adding or updating tests |
| `chore` | Build process, dependency updates |

**Examples:**

```bash
feat(auth): add GitHub OAuth login
fix(repo): resolve file tree not loading on private repos
docs(contributing): add branch naming conventions
test(auth): add unit tests for JWT refresh logic
refactor(middleware): simplify error handler class detection
```

> ❌ Bad: `git commit -m "fixed stuff"` or `git commit -m "changes"`  
> ✅ Good: `git commit -m "fix(auth): handle expired refresh token gracefully"`

---

## Pull Request Guidelines

### Before opening a PR

- [ ] Your branch is based on the latest `dev` (not `main`)
- [ ] You have run `npm run lint` with no errors
- [ ] You have run `npm test` and all tests pass
- [ ] You have self-reviewed your own code
- [ ] You have added/updated tests if you changed logic
- [ ] You have updated documentation if needed

### PR title format

Use the same Conventional Commits format:

```
feat(profile): add avatar upload with Minio storage
fix(issues): prevent duplicate label assignment
```

### PR description

Fill out the PR template completely. Incomplete PR descriptions will be sent back for revision.

### After opening a PR

- Be responsive to review comments — PRs idle for more than 7 days may be closed
- Don't push unrelated changes to an open PR
- Don't resolve reviewer comments yourself — let the reviewer resolve them after checking

---

## Coding Standards

### General

- Use **ES Modules** (`import`/`export`) — no CommonJS `require()`
- Prefer `async/await` over `.then()` chains
- No `console.log` in production code — use the `logger` utility
- Keep functions small and single-purpose

### Backend (Express)

- All route handlers must use the `asyncHandler` wrapper — no bare `try/catch` in routes
- Use `AppError` for all operational errors with appropriate status codes
- Validate all inputs using `express-validator` before hitting the controller
- Use the `sendSuccess` / `sendPaginated` response helpers for consistent API responses

### Frontend (React)

- Use functional components with hooks only — no class components
- All server state goes through **React Query** — don't store server data in Zustand
- Global UI state (modals, sidebar open/close) goes in **Zustand**
- Component files: PascalCase (`UserProfile.jsx`)
- Hook files: camelCase prefixed with `use` (`useRepoTree.js`)
- No inline styles — use TailwindCSS classes only

### File naming

| Type | Convention | Example |
|---|---|---|
| React components | PascalCase | `RepoCard.jsx` |
| Hooks | camelCase | `useAuth.js` |
| Utilities | camelCase | `formatDate.js` |
| Routes | kebab-case suffix | `auth.routes.js` |
| Models | PascalCase suffix | `User.model.js` |
| Controllers | camelCase suffix | `auth.controller.js` |

---

## GSSoC Points System

Issues are tagged by difficulty. Points are awarded based on the label on the merged PR's linked issue:

| Label | Points |
|---|---|
|   |   |

> Points are only awarded for PRs merged into the `dev` or `main` branch. Closed PRs or PRs fixing issues not tagged `gssoc26` do not count.

---

## Getting Help

- **Stuck on setup?** Open a [Discussion](../../discussions) — don't open an issue for questions
- **Found a bug?** Open an issue using the [Bug Report template](../../issues/new?template=bug_report.md)
- **Have a feature idea?** Open an issue using the [Feature Request template](../../issues/new?template=feature_request.md)
- **Quick questions?** Join our community Discord (link in repo description)

---

Thank you for contributing to GitNest! Every PR, no matter how small, makes the project better. 🙌
