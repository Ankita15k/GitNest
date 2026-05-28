# Contributing to GitNest ✨

First of all — **Thank you** for considering contributing to GitNest! This project is part of **GSSoC 2026** and we welcome contributors of all skill levels.

<h3 align="center">
  We appreciate your interest in contributing. 😊
</h3>
<h4 align="center">
  This guide will help you get started with the project and make your first contribution.  
  We're excited to welcome developers, designers, and testers of all levels.
</h4>

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Find Issues](#how-to-find-issues)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Commit Message Format](#commit-message-format)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Coding Standards](#coding-standards)
- [Backend Security Conventions](#backend-security-conventions)
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

> ⚠️ CRITICAL: Do NOT open a Pull Request without an open, assigned issue. Unsolicited PRs will be closed automatically.
> ⚠️ PRs for unassigned issues will not be reviewed and may be closed without merging.

---

## Getting Started

1. ⭐ **Star** this repository.

2. 🍴 **Fork** this repository.

3. 📥 **Clone** your fork:
   ```bash
   git clone https://github.com/<your-github-username>/GitNest.git
   cd GitNest
   ```

4. 🔗 **Add the upstream remote** so you can stay in sync:
   ```bash
   git remote add upstream https://github.com/Ankita15k/GitNest.git
   ```

5. ⚙️ **Set up the project locally:**

   **Environment variables:**
   ```bash
   # Backend env variables
   cp backend/.env.example backend/.env
   # Open backend/.env and fill in your values

   # Frontend env variables
   cp frontend/.env.example frontend/.env
   # Open frontend/.env and fill in your values
   ```

   **Install dependencies and start dev servers:**
   ```bash
   # Backend (in one terminal)
   cd backend && npm install && npm run dev

   # Frontend (in a new terminal)
   cd frontend && npm install && npm run dev
   ```

   The app will be available at:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api/v1

   > ⚠️ Docker support is planned but not yet available. Make sure MongoDB and Redis are running locally before starting the servers.

6. 🌿 **Sync with upstream and create a new branch:**
   ```bash
   git checkout dev
   git pull upstream dev
   git checkout -b <your_branch_name>
   ```

   Name your branch following these conventions:
   - `feat/add-user-profile`
   - `fix/image-upload-bug`
   - `docs/update-readme`
   - `test/add-unit-tests-for-api`
   - `chore/improve-ci-workflow`

7. ✏️ **Make your changes.**

8. 📝 **Stage and commit** using the [Conventional Commits](#commit-message-format) format:
   ```bash
   git add <changed_files>
   git commit -m "type(scope): short summary"
   ```

9. 🚀 **Keep your branch up to date, then push:**
   ```bash
   # Before pushing, make sure your branch is current
   git checkout dev
   git pull upstream dev
   git checkout <your_branch_name>
   git merge dev

   git push origin <your_branch_name>
   ```

10. 🔄 **Open a Pull Request** on GitHub targeting the `dev` branch of the upstream repo.

11. 🎉 Congratulations — you've made your contribution!

---

## 💬 Support

Feel free to raise your doubts in [Discussions](../../discussions).

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

### Backend Security Conventions

These rules exist to prevent a class of bugs that look harmless in isolation but create serious attack surface when combined with predictable identifier formats.

**Public routes must never accept internal database IDs as route parameters.**

- Use only human-readable identifiers — `:username`, `:repoName` — on any route that is accessible without authentication or whose response exposes user data.
- MongoDB ObjectIds encode the server's startup timestamp in their first four bytes, making sequential enumeration of all registered users or repositories feasible with a modest number of requests. Accepting an ObjectId on a public route therefore leaks the full user table to an unauthenticated caller.
- If an internal service, background job, or admin tool needs to look up a document by `_id`, it must call the Mongoose model directly — `User.findById(id)` — rather than routing that call through a public HTTP endpoint.

**All route parameters must pass through a validator before the controller uses them.**

- The existing `express-validator` chain documented above applies to body fields. The same requirement holds for `:param` values: every public route must declare a `param()` validator that rejects unexpected shapes (ObjectId-like hex strings, oversized values, characters outside the allowed set) before the request reaches the controller.
- Placing validation only in the controller, or checking `mongoose.Types.ObjectId.isValid()` inside the controller, is not sufficient — it mixes input sanitisation with business logic and makes the sanitisation easy to bypass by future edits.

**Example — correct pattern for a username lookup route:**

```js
// router
router.get('/:username', validate(usernameParamValidator), getUserProfile);

// controller — queries only by the human-readable field
export const getUserProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ username: req.params.username.toLowerCase() });
  if (!user) return next(new AppError('User not found', 404));
  sendSuccess(res, 200, user, 'User profile fetched successfully');
});
```

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
| beginner | 20 |
| intermediate | 35 |
| advanced | 55 |
| critical | 80 |

> Points are only awarded for PRs merged into the `dev` or `main` branch. Closed PRs or PRs fixing issues not tagged `gssoc26` do not count.

---

## Getting Help

- **Stuck on setup?** Open a [Discussion](../../discussions) — don't open an issue for questions
- **Found a bug?** Open an issue using the [Bug Report template](../../issues/new?template=bug_report.md)
- **Have a feature idea?** Open an issue using the [Feature Request template](../../issues/new?template=feature_request.md)
- **Quick questions?** Join our community Discord (link in repo description)

---

Thank you for contributing to GitNest! Every PR, no matter how small, makes the project better. 🙌
