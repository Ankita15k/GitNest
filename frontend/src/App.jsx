import { Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ui/ErrorBoundary.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/useThemeStore';
import { useEffect } from 'react';
import ToastContainer from './components/ui/ToastContainer';
import './App.css';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import GitNestHomepage from './pages/GitNestHomepage';
import DocumentationPage from './pages/DocumentationPage';
import NotFound from './pages/NotFound';
import PullRequestsPage from './pages/PullRequestsPage';
import PullRequestDetailPage from './pages/PullRequestDetailPage';
import UserProfile from './pages/UserProfile';
import ActivityFeedPage from './pages/ActivityFeed.jsx';
import ComponentShowcase from './pages/ComponentShowcase.jsx';
import GitNestPrivacy from './pages/GitNestPrivacy.jsx';
import BackToTop from './components/BackToTop/BackToTop';
import GitNestTerms from './pages/GitNestTerms.jsx';
import RepositoryArchitecturePage from './pages/repositories/RepositoryArchitecturePage.jsx';

const Dashboard = () => {
  const { user, logout } = useAuthStore();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Welcome, {user?.username}!</p>
      <button
        onClick={logout}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Logout
      </button>
    </div>
  );
};

function App() {
  const { isDarkMode } = useThemeStore();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className="min-h-screen">
      <ToastContainer />
      <ErrorBoundary>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<GitNestHomepage />} />
          <Route path="/docs" element={<DocumentationPage />} />
          <Route path="/pull-requests" element={<PullRequestsPage />} />
          <Route path="/pull-requests/:id" element={<PullRequestDetailPage />} />
          <Route path="/activities" element={<ActivityFeedPage />} />
          <Route path="/:owner/:repo/architecture" element={<RepositoryArchitecturePage />} />
          <Route path="/user/:username" element={<UserProfile />} />
          <Route path="/showcase" element={<ComponentShowcase />} />
          <Route path="/privacy" element={<GitNestPrivacy />} />
          <Route path="/terms" element={<GitNestTerms />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </ErrorBoundary>
      <BackToTop />
    </div>
  );
}

export default App;
