
<div align="center">

<img src="frontend/public/logo.png" width="140" alt="GitNest Logo"/>

# GitNest

### 🚀 Lightweight Collaborative Code Hosting Platform

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

</p>


<!-- Status Badges -->
<img src="https://img.shields.io/badge/version-0.1.0-blue?style=for-the-badge" alt="version"/>
<img src="https://img.shields.io/badge/PRs-welcome-teal?style=for-the-badge" alt="PRs Welcome"/>
<img src="https://img.shields.io/github/repo-size/Ankita15k/GitNest?style=for-the-badge" alt="Repo_Size"/>
<img src="https://img.shields.io/badge/license-MIT-red?style=for-the-badge" alt="MIT License"/>
<img src="https://img.shields.io/badge/stack-MERN-pink?style=for-the-badge" alt="MERN Stack"/>

<!-- Social & GitHub Stats -->
<p align="center">
  <img src="https://api.visitorbadge.io/api/visitors?path=Ankita15k%2FGitNest%20&countColor=%23263759&style=flat" alt="Visitors"/>
  <a href="https://github.com/ellerbrock/open-source-badges/"><img src="https://badges.frapsoft.com/os/v1/open-source.svg?v=103" alt="Open Source Love svg1"/></a>
  <img src="https://img.shields.io/github/forks/Ankita15k/GitNest" alt="GitHub forks"/>
  <img src="https://img.shields.io/github/stars/Ankita15k/GitNest" alt="GitHub Repo stars"/>
  <img src="https://img.shields.io/github/contributors/Ankita15k/GitNest" alt="GitHub contributors"/>
  <img src="https://img.shields.io/github/last-commit/Ankita15k/GitNest" alt="GitHub last commit"/>
  <a href="https://discord.gg/QHSNsRuA"><img src="https://img.shields.io/discord/1505228467086823504?color=5865F2&label=Join%20Discord&logo=discord&logoColor=white" alt="Join Discord"/></a>
</p>


</div>

---

## 📸 Screenshots

| **Home Page** | **Platform Features** | **Contribution** |
|------------|------------|------------|
|<img height="1000" alt="image" src="https://github.com/user-attachments/assets/be8f7a4a-df2b-4d98-8df7-456de9b5b2d5" /> | <img height="1000" alt="image" src="https://github.com/user-attachments/assets/1fa87b65-23ba-4896-9594-36643af2cf01" />|<img width="1919" height="1078" alt="image" src="https://github.com/user-attachments/assets/5d0afdfe-69a5-4ca1-8a18-c1574d4f82f5" />|

### Component Showcase

GitNest features a comprehensive set of reusable UI components with **full dark mode support**. All components are built with TailwindCSS and leverage React hooks for optimal performance.

#### Empty States
The platform includes elegant empty state components that guide users when no data is available:

| Empty Repository | Empty Issues | Empty Pull Requests |
|---|---|---|
| Shown when user has no repositories | Shown when repository has no issues | Shown when repository has no PRs |
| Encourages users to create their first repo | Prompts users to create an issue | Prompts users to create a PR |

#### Stat Cards
Repository statistics are displayed using responsive stat card components:

```
Stars    │ Forks    │ Watchers │ Language
1,234    │   456    │   789    │ TypeScript
```

Each stat card is fully customizable with different variants (primary, success, warning, danger) and includes icons from Lucide React.

#### User Cards
User profile cards display:
- User avatar and profile information
- Bio and location details
- Account age
- Follower/following counts
- Follow/Unfollow functionality
- Quick action menu

#### Loading States
While data loads, skeleton components provide visual feedback:
- **StatCardSkeleton** — Animated loader for stat cards
- **UserCardSkeleton** — Full user card placeholder with shimmer effect

### Dark Mode

All components support **seamless light and dark themes**:

```
Light Theme          │  Dark Theme
White backgrounds    │  Dark slate backgrounds
Dark text           │  Light text
Light borders       │  Dark borders
```

The dark mode is implemented using TailwindCSS `dark:` variants, ensuring perfect consistency across the entire platform.

**View Component Showcase:** Navigate to `/showcase` to see all components in action with a live theme toggle!

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


## 📁 Current Project Structure

```
gitnest/
|── .github/ 
|   ├── ISSUE_TEMPLATE
|   └── workflows
├── backend/               
│   ├── scripts/    
│   └── src      
│       ├── config
│       ├── constants
│       ├── controllers
│       ├── middleware
│       ├── models
│       ├── routes
│       ├── services
│       ├── utils
│       └── validators
└── frontend/
    |── public/
    └── src/
        ├── components/ 
        ├── pages/        
        ├── store/       
        ├── hooks/         
        ├── api/         
        └── utils
```

## 🎨 UI Components

GitNest includes a comprehensive component library with full dark mode support:

### Empty States
- **EmptyRepository** — Shows when no repositories exist
- **EmptyIssues** — Shows when no issues exist  
- **EmptyPullRequests** — Shows when no PRs exist

### Cards & Stats
- **StatCard** — Generic stat display with customizable icon and variant
- **RepoStars, RepoForks, RepoWatchers, RepoLanguage** — Pre-configured stat cards
- **UserCard** — User profile card with bio, stats, and follow functionality

### Loading & Skeletons
- **StatCardSkeleton** — Animated loader for stat cards
- **UserCardSkeleton** — User card placeholder with shimmer effect
- **RepoSkeleton** — Repository list loader

**All components support full dark/light mode switching via TailwindCSS.**

For complete component documentation and examples, see [`frontend/src/components/COMPONENTS_DOCUMENTATION.md`](frontend/src/components/COMPONENTS_DOCUMENTATION.md).



## 📁 Project Structure


```
gitnest/
├── frontend/               # React + Vite frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── cards/           # Stat cards, user cards
│   │   │   ├── empty-states/    # Empty state components
│   │   │   ├── loading/         # Skeleton loaders
│   │   │   ├── ui/              # Base UI components
│   │   │   └── COMPONENTS_DOCUMENTATION.md
│   │   ├── pages/          # Route-level page components
│   │   ├── store/          # Zustand global state
│   │   ├── hooks/          # Custom React hooks
│   │   ├── api/            # Axios API layer
│   │   └── utils/          # Helper functions
├── backend/                # Express.js backend
│   ├── config/             # DB, Redis connections
│   ├── controllers/        # Route controllers
│   ├── middleware/          # Auth, error handling, rate limiting
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express routers
│   ├── services/           # Business logic, Socket.io
│   ├── utils/              # Logger, response helpers
│   └── .env.example        # Environment variable template
└── .github/               # Issue templates, workflows, PR template
```


## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v20+
- [VS Code](https://code.visualstudio.com/download)
- [Git](https://git-scm.com/)

### Installation

⭐ Star The Repo

**1. Fork and clone the repository**

```bash
# Fork this repo first using the Fork button above, then:
git clone https://github.com/<your-username>/gitnest.git
cd gitnest
```

**2. Set up environment variables**

```bash
# Backend env variables
cp backend/.env.example backend/.env
# Open backend/.env and fill in your values

# Frontend env variables
cp frontend/.env.example frontend/.env
# Open frontend/.env and fill in your values
```

**3. Install dependencies and run**

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend (in a new terminal)
cd frontend && npm install && npm run dev
```

**Environment variables**

- `backend/.env` should include `MONGO_URI`, `JWT_SECRET`, and `JWT_EXPIRE`.
- Optional production settings: `TRUST_PROXY=1` (behind reverse proxy) and `CORS_ORIGIN` (comma-separated origins).
- Optional security settings: `REQUEST_BODY_LIMIT` (e.g., `10kb`), `API_RATE_LIMIT_MAX`, `API_RATE_LIMIT_WINDOW_MS`, `AUTH_RATE_LIMIT_MAX`, `AUTH_RATE_LIMIT_WINDOW_MS`, `LOG_REQUESTS=1`.
- `frontend/.env` should include `VITE_API_BASE_URL` (for example: `http://localhost:5000`).

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


## 🏗️ Planned Frontend Architecture (Future Scope)
> ⚠️ This is a proposed structure for future development and may not reflect the current repository implementation.
```
frontend/
├── src/
│   ├── app/
│   │   ├── router/
│   │   │   ├── AppRouter.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── GuestRoute.jsx
│   │   │
│   │   ├── layouts/
│   │   │   ├── RootLayout.jsx
│   │   │   ├── DashboardLayout.jsx
│   │   │   ├── RepositoryLayout.jsx
│   │   │   ├── AuthLayout.jsx
│   │   │   └── SettingsLayout.jsx
│   │   │
│   │   └── providers/
│   │       ├── ThemeProvider.jsx
│   │       ├── QueryProvider.jsx
│   │       ├── AuthProvider.jsx
│   │       └── SocketProvider.jsx
│   │
│   ├── pages/
│   │   ├── home/
│   │   │   ├── HomePage.jsx
│   │   │   ├── sections/
│   │   │   │   ├── HeroSection.jsx
│   │   │   │   ├── FeaturesSection.jsx
│   │   │   │   ├── ExploreRepositories.jsx
│   │   │   │   ├── OpenSourceBanner.jsx
│   │   │   │   ├── CollaborationSection.jsx
│   │   │   │   ├── GitnestWorkflow.jsx
│   │   │   │   ├── TestimonialsSection.jsx
│   │   │   │   ├── CTASection.jsx
│   │   │   │   └── FooterSection.jsx
│   │   │   │
│   │   │   └── components/
│   │   │       ├── RepoPreviewCard.jsx
│   │   │       ├── FeatureCard.jsx
│   │   │       ├── WorkflowCard.jsx
│   │   │       └── StatCard.jsx
│   │   │
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ForgotPasswordPage.jsx
│   │   │   ├── ResetPasswordPage.jsx
│   │   │   └── VerifyEmailPage.jsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── FeedPage.jsx
│   │   │   ├── NotificationsPage.jsx
│   │   │   ├── StarsPage.jsx
│   │   │   └── FollowingPage.jsx
│   │   │
│   │   ├── profile/
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── EditProfilePage.jsx
│   │   │   ├── FollowersPage.jsx
│   │   │   ├── FollowingPage.jsx
│   │   │   ├── UserRepositoriesPage.jsx
│   │   │   └── UserActivityPage.jsx
│   │   │
│   │   ├── repositories/
│   │   │   ├── ExploreRepositoriesPage.jsx
│   │   │   ├── CreateRepositoryPage.jsx
│   │   │   ├── RepositoryPage.jsx
│   │   │   ├── RepositorySettingsPage.jsx
│   │   │   ├── RepositoryInsightsPage.jsx
│   │   │   ├── ForksPage.jsx
│   │   │   └── StarsPage.jsx
│   │   │
│   │   ├── code/
│   │   │   ├── FileExplorerPage.jsx
│   │   │   ├── BlobViewPage.jsx
│   │   │   ├── CommitHistoryPage.jsx
│   │   │   ├── BranchesPage.jsx
│   │   │   ├── ReleasesPage.jsx
│   │   │   └── CompareChangesPage.jsx
│   │   │
│   │   ├── issues/
│   │   │   ├── IssuesPage.jsx
│   │   │   ├── IssueDetailsPage.jsx
│   │   │   ├── CreateIssuePage.jsx
│   │   │   ├── LabelsPage.jsx
│   │   │   └── MilestonesPage.jsx
│   │   │
│   │   ├── pull-requests/
│   │   │   ├── PullRequestsPage.jsx
│   │   │   ├── PullRequestDetailsPage.jsx
│   │   │   ├── CreatePullRequestPage.jsx
│   │   │   ├── ReviewChangesPage.jsx
│   │   │   └── MergePreviewPage.jsx
│   │   │
│   │   ├── organizations/
│   │   │   ├── OrganizationsPage.jsx
│   │   │   ├── OrganizationProfilePage.jsx
│   │   │   ├── OrganizationMembersPage.jsx
│   │   │   └── OrganizationRepositoriesPage.jsx
│   │   │
│   │   ├── search/
│   │   │   ├── SearchPage.jsx
│   │   │   ├── SearchRepositories.jsx
│   │   │   ├── SearchUsers.jsx
│   │   │   └── SearchIssues.jsx
│   │   │
│   │   ├── settings/
│   │   │   ├── AccountSettingsPage.jsx
│   │   │   ├── AppearanceSettingsPage.jsx
│   │   │   ├── SecuritySettingsPage.jsx
│   │   │   ├── NotificationsSettingsPage.jsx
│   │   │   └── SSHKeysPage.jsx
│   │   │
│   │   └── errors/
│   │       ├── NotFoundPage.jsx
│   │       ├── UnauthorizedPage.jsx
│   │       └── ServerErrorPage.jsx
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Textarea.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Dropdown.jsx
│   │   │   ├── Avatar.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Tooltip.jsx
│   │   │   ├── Tabs.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── Loader.jsx
│   │   │   ├── Pagination.jsx
│   │   │   └── MarkdownRenderer.jsx
│   │   │
│   │   ├── navbar/
│   │   │   ├── Navbar.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── MobileMenu.jsx
│   │   │   ├── UserMenu.jsx
│   │   │   └── NotificationDropdown.jsx
│   │   │
│   │   ├── sidebar/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── RepositorySidebar.jsx
│   │   │   └── SettingsSidebar.jsx
│   │   │
│   │   ├── repository/
│   │   │   ├── RepositoryHeader.jsx
│   │   │   ├── RepositoryTabs.jsx
│   │   │   ├── RepositoryStats.jsx
│   │   │   ├── RepositoryCard.jsx
│   │   │   ├── FileTree.jsx
│   │   │   ├── CodeEditor.jsx
│   │   │   ├── CommitCard.jsx
│   │   │   └── BranchSelector.jsx
│   │   │
│   │   ├── issues/
│   │   │   ├── IssueCard.jsx
│   │   │   ├── IssueFilters.jsx
│   │   │   ├── CommentBox.jsx
│   │   │   └── LabelBadge.jsx
│   │   │
│   │   ├── pull-requests/
│   │   │   ├── PullRequestCard.jsx
│   │   │   ├── ReviewComment.jsx
│   │   │   ├── ChangedFiles.jsx
│   │   │   └── MergeBox.jsx
│   │   │
│   │   ├── profile/
│   │   │   ├── ProfileHeader.jsx
│   │   │   ├── ContributionGraph.jsx
│   │   │   ├── ActivityTimeline.jsx
│   │   │   └── PinnedRepositories.jsx
│   │   │
│   │   └── skeletons/
│   │       ├── RepositorySkeleton.jsx
│   │       ├── ProfileSkeleton.jsx
│   │       └── IssueSkeleton.jsx
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useTheme.js
│   │   ├── useDebounce.js
│   │   ├── useRepositories.js
│   │   ├── useIssues.js
│   │   ├── usePullRequests.js
│   │   └── useSocket.js
│   │
│   ├── services/
│   │   ├── api/
│   │   │   ├── axios.js
│   │   │   ├── auth.api.js
│   │   │   ├── repository.api.js
│   │   │   ├── issue.api.js
│   │   │   ├── pullRequest.api.js
│   │   │   ├── profile.api.js
│   │   │   └── notification.api.js
│   │   │
│   │   └── socket/
│   │       └── socket.js
│   │
│   ├── store/
│   │   ├── authStore.js
│   │   ├── repositoryStore.js
│   │   ├── issueStore.js
│   │   ├── pullRequestStore.js
│   │   └── uiStore.js
│   │
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── ThemeContext.jsx
│   │   └── NotificationContext.jsx
│   │
│   ├── utils/
│   │   ├── formatDate.js
│   │   ├── formatNumber.js
│   │   ├── generateSlug.js
│   │   ├── parseMarkdown.js
│   │   ├── constants.js
│   │   └── validators.js
│   │
│   ├── styles/
│   │   ├── globals.css
│   │   ├── markdown.css
│   │   └── animations.css
│   │
│   ├── data/
│   │   ├── mockRepositories.js
│   │   ├── mockUsers.js
│   │   └── mockIssues.js
│   │
│   ├── config/
│   │   ├── env.js
│   │   ├── routes.js
│   │   └── navigation.js
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css


```

## 🤝 Contributing

We love contributions! GitNest is a **GSSoC 2026** project and welcomes developers of all experience levels.

**Before you start:**
1. Read [CONTRIBUTING.md](./CONTRIBUTING.md) carefully
2. Check [open issues](../../issues) — look for `good first issue` if you're new
3. Comment on the issue you want to work on and wait for it to be assigned to you
4. Don't submit PRs for unassigned issues — they may be closed

See [CONTRIBUTING.md](./CONTRIBUTING.md) for full details on the workflow, coding standards, and commit message format.

## 💖 Contributors

Thanks to all the amazing people who contribute to **GitNest** 🚀

<p align="center">
  <a href="https://github.com/Ankita15k/GitNest/graphs/contributors">
    <img src="https://contrib.rocks/image?repo=Ankita15k/GitNest" alt="Contributors"/>
  </a>
</p>

## 🗺️ Roadmap

- [ ] Project scaffolding & Express server setup
- [ ] MongoDB schemas & Mongoose models
- [ ] Auth service (JWT + GitHub OAuth)
- [ ] Repository CRUD & file browser
- [ ] Issues & Pull Requests
- [ ] User profiles & social features
- [ ] Search
- [ ] Real-time notifications
- [ ] Tests (unit + integration)
- [x] Docker setup (docker-compose for full stack)
- [ ] Deployment & CI/CD
   
## 📜 License

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](./LICENSE)

This project is released under the **MIT License**.  
Feel free to **use, modify, and distribute** it.
   
## 🌟 Support the Project

**If you find this project helpful, please consider giving it a star!**  
*It helps more developers discover this work.*

<a href="../../stargazers">
  <img src="https://img.shields.io/github/stars/Ankita15k/GitNest?style=for-the-badge&color=gold&logo=github" alt="Stars"/>
</a>

<br />

**Built with ❤️ by the Open Source Community**  
🚀 *Collaborate • Contribute • Create*
