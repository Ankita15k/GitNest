
<div align="center">

<img src="frontend/public/logo.png" width="140" alt="GitNest Logo"/>

# GitNest - Lightweight Collaborative Code Hosting Platform



<p align="center">
  <strong>A modern GitHub-inspired collaborative coding platform built with the MERN Stack.</strong>
</p>

<p align="center">
Create repositories, browse code, manage issues, review pull requests, and collaborate seamlessly — all in one open-source platform.
</p>

<p align="center">
  
[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Visit_Project-blue?style=for-the-badge)](https://gitnest-eld1.onrender.com)
[![Documentation](https://img.shields.io/badge/📖_Documentation-Read_Guide-success?style=for-the-badge)](./CONTRIBUTING.md)
[![Report Bug](https://img.shields.io/badge/🐛_Report_Bug-red?style=for-the-badge)](../../issues/new?template=bug_report.md)
[![Request Feature](https://img.shields.io/badge/✨_Request_Feature-purple?style=for-the-badge)](../../issues/new?template=feature_request.md)

<img src="https://img.shields.io/badge/version-0.1.0-blue?style=for-the-badge" alt="version"/>
<img src="https://img.shields.io/badge/PRs-welcome-teal?style=for-the-badge" alt="PRs Welcome"/>
<img src="https://img.shields.io/github/repo-size/Ankita15k/GitNest?style=for-the-badge" alt="Repo_Size"/>
<img src="https://img.shields.io/badge/license-MIT-red?style=for-the-badge" alt="MIT License"/>
<img src="https://img.shields.io/badge/stack-MERN-pink?style=for-the-badge" alt="MERN Stack"/>

</p>


<!-- Status Badges -->



  <img src="https://api.visitorbadge.io/api/visitors?path=Ankita15k%2FGitNest%20&countColor=%23263759&style=flat" alt="Visitors"/>
  <br/> <br/>

<!-- Social & GitHub Stats -->
<p align="center">
  <a href="https://github.com/ellerbrock/open-source-badges/"><img src="https://badges.frapsoft.com/os/v1/open-source.svg?v=103" alt="Open Source Love svg1"/></a>
  <img src="https://img.shields.io/github/forks/Ankita15k/GitNest" alt="GitHub forks"/> 
  <img src="https://img.shields.io/github/stars/Ankita15k/GitNest" alt="GitHub Repo stars"/>
  <img src="https://img.shields.io/github/contributors/Ankita15k/GitNest" alt="GitHub contributors"/>
  <img src="https://img.shields.io/github/last-commit/Ankita15k/GitNest" alt="GitHub last commit"/>
  <a href="https://discord.gg/QHSNsRuA"><img src="https://img.shields.io/discord/1505228467086823504?color=5865F2&label=Join%20Discord&logo=discord&logoColor=white" alt="Join Discord"/></a>
</p>

</div>

---

## ⚡ Features

- 🔐 **Authentication** — Register, login, JWT sessions, GitHub OAuth
- 📁 **Repository Management** — Create, delete, fork, and star repos
- 🌲 **File Browser** — Navigate repo tree, view files with syntax highlighting (Monaco Editor)
- 📝 **Issues & Pull Requests** — Full issue tracker with labels, milestones, and comments
- 👥 **User Profiles** — Follow users, view activity feed, manage settings
- 🔍 **Search** — Search repos, users, and code
- 🔔 **Real-time Notifications** — Live updates via Socket.io
- 🌙 **Dark Mode** — Full dark/light theme support

## 🛠 Engineering Stack

| Layer | Component |
| :--- | :--- |
| **Frontend** | `React 18`, `Vite`, `TailwindCSS`, `Zustand`, `React Query` |
| **Backend** | `Node.js`, `Express.js` |
| **Database** | `MongoDB` + `Mongoose` |
| **Cache** | `Redis` |
| **Real-time** | `Socket.io` |
| **Auth** | `JWT`, `bcrypt` |
| **Storage** | `Cloudinary`, `Supabase` |
| **DevOps** | `GitHub Actions` |


# Current Project Structure

```bash
GitNest/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── validations/
│   │   └── server.js
│   │
│   ├── package.json
│   ├── Dockerfile
│   └── .gitignore
│
├── frontend/
│   ├── public/
│   │
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── layout/
│   │   │   └── ui/
│   │   │
│   │   ├── pages/
│   │   │   ├── Auth/
│   │   │   ├── Dashboard/
│   │   │   ├── Profile/
│   │   │   └── NotFound/
│   │   │
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   ├── vite.config.js
│   ├── Dockerfile
│   └── .gitignore
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── docker-compose.yml
├── README.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── LICENSE
└── .gitignore
```

## Structure Overview

| Folder/File          | Purpose                            |
| -------------------- | ---------------------------------- |
| `backend/`           | Express + Node.js backend services |
| `frontend/`          | React + Vite frontend application  |
| `controllers/`       | Handles request/response logic     |
| `models/`            | Database schemas/models            |
| `routes/`            | API route definitions              |
| `middlewares/`       | Authentication & custom middleware |
| `services/`          | Business logic layer               |
| `components/`        | Reusable frontend UI components    |
| `pages/`             | Route-based frontend pages         |
| `context/`           | Global state/auth management       |
| `.github/workflows/` | GitHub Actions CI/CD workflows     |
| `docker-compose.yml` | Multi-container Docker setup       |

*** For complete component documentation and examples, see [`frontend/src/components/COMPONENTS_DOCUMENTATION.md`](frontend/src/components/COMPONENTS_DOCUMENTATION.md).

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v20+
- [VS Code](https://code.visualstudio.com/download)
- [Git](https://git-scm.com/)

### Installation

⭐ Star The Repo

**1. Fork and clone the repository**

  Fork this repo first using the Fork button above, then:
  
  ```bash
  
  # FIX: Corrected repository URL casing to match the destination folder and prevent case-sensitive terminal errors on macOS/Linux
  git clone https://github.com/<your-username>/GitNest.git
  cd GitNest
  ```

**2. Set up environment variables**
 
  Backend env variables
  ```bash
  cp backend/.env.example backend/.env
  ```
  Open backend/.env and fill in your values
  
   Frontend env variables
  ```
  cp frontend/.env.example frontend/.env
  ```
  Open frontend/.env and fill in your values

**3. Install dependencies and run**
 
  Backend
  ```bash
  cd backend && npm install && npm start
  ```
  
  Frontend (in a new terminal)
  ```
  cd frontend && npm install && npm run dev
  ```

**4. Open the app**

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api/v1
- Health check: http://localhost:5000/health

### Docker Setup (Recommended)

You can easily run the entire application (Frontend, Backend, MongoDB, Redis) using Docker.

1. Ensure Docker Desktop is running.
2. Run the following command in the root of the project:
   ```bash
   docker-compose up --build
   ```
3. The application will be available at:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api/v1


---

<!-- ## Project Admin 👩🏻‍💻 -->


## ✨ Contributors - The People Behind GitNest ✨ 



A heartfelt Thanks to all the stellar developers who make **GitNest** better every day 🩵💫


<p align="center">
  <a href="https://github.com/Ankita15k/GitNest/graphs/contributors">
    <img src="https://contrib.rocks/image?repo=Ankita15k/GitNest" alt="Contributors"/>
  </a>
</p>

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
   

 <p align="center">
  🌟 Create • Collaborate • Contribute 🌟
   <br/>
   Made with 💖 for the Open Source Community
</p>
 
