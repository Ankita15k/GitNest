import { Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ui/ErrorBoundary.jsx';
import ProtectedRoute from './components/ProtectedRoute';
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
import RepositorySettingsPage from './pages/RepositorySettingsPage.jsx';
import OAuthSuccess from './pages/OAuthSuccess.jsx';
import ContactPage from './pages/ContactPage';
import Dashboard from './pages/Dashboard';


function App() {
const { isDarkMode } = useThemeStore();

useEffect(() => {
if (isDarkMode) {
document.documentElement.classList.add("dark");
} else {
document.documentElement.classList.remove("dark");
}
}, [isDarkMode]);
  
useEffect(() => {
    const loader = document.getElementById('loader-wrapper');
    if (loader) {
      loader.style.opacity = '0';
      loader.style.visibility = 'hidden';
      const timeoutId = setTimeout(() => {
        loader.remove();
      }, 900);
      return () => clearTimeout(timeoutId);
    }
}, []);

return ( <div className="min-h-screen">
  <ToastContainer />

  <ErrorBoundary>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<GitNestHomepage />} />
      <Route path="/docs" element={<DocumentationPage />} />
      <Route path="/pull-requests" element={<PullRequestsPage />} />
      <Route
        path="/pull-requests/:id"
        element={<PullRequestDetailPage />}
      />
      <Route path="/activities" element={<ActivityFeedPage />} />
      <Route
        path="/:owner/:repo/architecture"
        element={<RepositoryArchitecturePage />}
      />
      <Route
        path="/:username/:reponame/settings/branch-protection"
        element={<RepositorySettingsPage />}
      />
      <Route path="/user/:username" element={<UserProfile />} />
      <Route path="/:username" element={<UserProfile />} />
      <Route path="/showcase" element={<ComponentShowcase />} />
      <Route path="/privacy" element={<GitNestPrivacy />} />
      <Route path="/terms" element={<GitNestTerms />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/oauth-success" element={<OAuthSuccess />} />
      <Route path="/404" element={<NotFound />} />

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
