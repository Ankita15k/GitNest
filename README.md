<div align="center">

<img src="https://img.shields.io/badge/version-0.1.0-blue?style=for-the-badge" alt="version"/>
<img src="https://img.shields.io/badge/PRs-welcome-teal?style=for-the-badge" alt="PRs Welcome"/>
<img src="https://img.shields.io/github/repo-size/Ankita15k/GitNest?style=for-the-badge" alt="Repo_Size"/>
<img src="https://img.shields.io/badge/license-MIT-red?style=for-the-badge" alt="MIT License"/>
<img src="https://img.shields.io/badge/stack-MERN-pink?style=for-the-badge" alt="MERN Stack"/>

![Visitors](https://api.visitorbadge.io/api/visitors?path=Ankita15k%2FGitNest%20&countColor=%23263759&style=flat)

[![Open Source Love svg1](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badges/)
![GitHub forks](https://img.shields.io/github/forks/Ankita15k/GitNest)
![GitHub Repo stars](https://img.shields.io/github/stars/Ankita15k/GitNest)
![GitHub contributors](https://img.shields.io/github/contributors/Ankita15k/GitNest)
![GitHub last commit](https://img.shields.io/github/last-commit/Ankita15k/GitNest)

## <img width="150" height="150" alt="Logo" src="https://github.com/user-attachments/assets/b4cf9a44-aa69-4256-bae9-7f67b5246278" />

#  GitNest - Lightweight Collaborative Code Hosting Platform

**A full-featured GitHub-inspired platform built with the MERN stack.**  
Create repositories, browse code, manage issues, review pull requests, and collaborate — all in one open-source app.

[🚀 Live Demo](#) · [📖 Docs](#) · [🐛 Report Bug](../../issues/new?template=bug_report.md) · [✨ Request Feature](../../issues/new?template=feature_request.md)

</div>

---

## 📸 Screenshots

> _Screenshots / GIF demo will be added soon. Contributors are welcome to help build the UI!_

---

## ✨ Features

- 🔐 **Authentication** — Register, login, JWT sessions, GitHub OAuth
- 📁 **Repository Management** — Create, delete, fork, and star repos
- 🌲 **File Browser** — Navigate repo tree, view files with syntax highlighting (Monaco Editor)
- 📝 **Issues & Pull Requests** — Full issue tracker with labels, milestones, and comments
- 👥 **User Profiles** — Follow users, view activity feed, manage settings
- 🔍 **Search** — Search repos, users, and code
- 🔔 **Real-time Notifications** — Live updates via Socket.io
- 🌙 **Dark Mode** — Full dark/light theme support

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, TailwindCSS, Zustand, React Query|
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB + Mongoose |
| **Cache** | Redis |
| **Real-time** | Socket.io |
| **Auth** | JWT, bcrypt |
| **Storage** | AWS S3 |
| **DevOps** | GitHub Actions |

---

## 📁 Project Structure

```
gitnest/
├── frontend/               # React + Vite frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route-level page components
│   │   ├── store/        # Zustand global state
│   │   ├── hooks/        # Custom React hooks
│   │   ├── api/          # Axios API layer
│   │   └── utils/        # Helper functions
├── backend/               # Express.js backend
│   ├── config/           # DB, Redis connections
│   ├── controllers/      # Route controllers
│   ├── middleware/        # Auth, error handling, rate limiting
│   ├── models/           # Mongoose schemas
│   ├── routes/           # Express routers
│   ├── services/         # Business logic, Socket.io
│   └── utils/            # Logger, response helpers
├── docker-compose.yml
└── .github/              # Issue templates, workflows, PR template
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v20+
- [VS Code](https://code.visualstudio.com/download)
- [Git](https://git-scm.com/)

### Installation

**1. Fork and clone the repository**

```bash
# Fork this repo first using the Fork button above, then:
git clone https://github.com/<your-username>/gitnest.git
cd gitnest
```

**2. Set up environment variables**

```bash
cp server/.env.example server/.env
# Open server/.env and fill in your values
```

**3. Start the full dev stack with Docker**

```bash
docker compose up
# This starts MongoDB, Redis, and Minio automatically
```

**4. Install dependencies and run**

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend (in a new terminal)
cd frontend && npm install && npm run dev
```

**5. Open the app**

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api/v1
- Health check: http://localhost:5000/health

---

## 🤝 Contributing

We love contributions! GitNest is a **GSSoC 2026** project and welcomes developers of all experience levels.

**Before you start:**
1. Read [CONTRIBUTING.md](./CONTRIBUTING.md) carefully
2. Check [open issues](../../issues) — look for `good first issue` if you're new
3. Comment on the issue you want to work on and wait for it to be assigned to you
4. Don't submit PRs for unassigned issues — they may be closed

See [CONTRIBUTING.md](./CONTRIBUTING.md) for full details on the workflow, coding standards, and commit message format.

---

## 🗺️ Roadmap

- [x] Project scaffolding & Express server setup
- [ ] MongoDB schemas & Mongoose models
- [ ] Auth service (JWT + GitHub OAuth)
- [ ] Repository CRUD & file browser
- [ ] Issues & Pull Requests
- [ ] User profiles & social features
- [ ] Search
- [ ] Real-time notifications
- [ ] Tests (unit + integration)
- [ ] Deployment & CI/CD

---

## 👩🏻‍💻 Project Admin

| Name | GitHub |
|---|---|
| Ankita Kumari | [@Ankita15k](https://github.com/Ankita15k) |

## 🎓 Mentors

| Name | GitHub |
|---|---|
| Mentor Name | [@mentorgithub](https://github.com/mentorgithub) |

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

<div align="center">

⭐ **Star this repo** if you find it helpful — it helps the project get more visibility!

Made with ❤️ for Open Source Community

</div>
