## Description

The file browser service (`fileBrowser.service.js`) has three fundamental security and stability flaws:

1. **No recursion depth limit** in `buildTree` — a deeply nested directory or a symlink cycle causes a **stack overflow**, crashing the server process
2. **Follows symlinks** via `fs.statSync` instead of `fs.lstatSync` — a symlink pointing outside the repository directory enables **arbitrary filesystem reads**
3. **`Repository.name` has no path-traversal character validation** — only `trim: true` in the Mongoose schema, which does **NOT** reject `../`, `/`, `\`, or null bytes

---

## Root Causes

### 1. `backend/src/services/fileBrowser.service.js` lines 4–27 — No depth limit, symlink following

```js
const buildTree = (directoryPath) => {
  const items = fs.readdirSync(directoryPath);
  return items
    .filter((item) => item !== ".git") // only .git is filtered
    .map((item) => {
      const fullPath = path.join(directoryPath, item);
      const stats = fs.statSync(fullPath); // follows symlinks!
      if (stats.isDirectory()) {
        return {
          name: item,
          type: "directory",
          children: buildTree(fullPath), // no depth limit, no cycle detection
        };
      }
      return { name: item, type: "file" };
    });
};
```

- `fs.statSync` follows symlinks, so a symlink to a directory is treated as a real directory and **recursed into**
- No `maxDepth` parameter — Node.js default call stack (~12,000 frames) can be exhausted
- A symlink cycle (a → b → a) causes **infinite recursion** → stack overflow → process crash

### 2. `backend/src/models/Repository.model.js` lines 21–27 — No path-traversal validation on `name`

```js
name: {
  type: String,
  required: true,
  trim: true,           // only trims whitespace — does NOT reject "../" or "/"
  unique: true,         // (compound with owner)
},
```

A malicious user can create a repository named `../../../etc`:

```bash
# POST /api/v1/repositories
{ "name": "../../../etc/passwd-store" }
```

The name passes Mongoose validation and is stored in the database. When `GET /:username/:reponame/tree` is called:

```js
const repoPath = path.resolve(
  process.cwd(),
  "repositories",
  owner._id.toString(),
  repository.name,
);
// Resolves to: /absolute/path/repositories/userId/../../../etc/passwd-store
// Which is:   /absolute/path/etc/passwd-store
```

### 3. `backend/src/services/commitHistory.service.js` lines 9–15 — Same path construction, unguarded

```js
const repoPath = path.resolve(
  process.cwd(), 'repositories', userId, repoName
);
const git = simpleGit(repoPath);        // git operates outside intended directory
const log = await git.log({ ... });
```

### 4. `backend/src/controllers/fileBrowser.controller.js` lines 37–39 — TOCTOU race condition

```js
if (!fs.existsSync(repoPath)) {
  throw new Error("Repository directory not found!!");
}
return buildTree(repoPath); // repo could be deleted between check and use
```

The separate existence check followed by use creates a time-of-check/time-of-use window.

---

## Files Requiring Changes

| File                                                | Changes Needed                                                                                                                                                                                                                                          |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `backend/src/models/Repository.model.js`            | Add regex validation to `name` field: `/^[a-zA-Z0-9._-]+$/` — reject `../`, `/`, `\`, null bytes, and Windows reserved names (CON, NUL, COM1, etc.)                                                                                                     |
| `backend/src/services/fileBrowser.service.js`       | Add `maxDepth` parameter (e.g., 100) to `buildTree`; switch to `fs.lstatSync` to detect symlinks and skip them; check `stats.isSymbolicLink()` and do not recurse; optionally follow symlinks only if they resolve within the base repository directory |
| `backend/src/services/commitHistory.service.js`     | Normalize resolved path and verify it starts with the intended base directory (`repositories/`); reject traversal attempts                                                                                                                              |
| `backend/src/controllers/fileBrowser.controller.js` | Remove the separate `existsSync` check; wrap `buildTree` call in try-catch handling `ENOENT` gracefully; normalize resolved path and verify against base directory                                                                                      |

---

## Expected Behavior

- Repository names containing `../`, `/`, `\`, or potentially path-traversal sequences should be **rejected at creation time**
- The file tree should be **depth-limited** (e.g., maximum 100 levels) and reject symlinks or follow them only when they resolve inside the repo
- Path resolution should **normalize and validate** that the resulting path starts with the expected base directory
- A stack overflow or symlink cycle should **never** crash the server
