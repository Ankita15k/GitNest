import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/useThemeStore';
import { useEffect } from 'react';
import ThemeToggle from './components/ThemeToggle';
import './App.css';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import GitNestHomepage from './pages/GitNestHomepage';
import NotFound from './pages/NotFound';


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
      <header className="p-4 flex justify-end border-b border-zinc-200 dark:border-zinc-800 transition-colors">
        <ThemeToggle />
      </header>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<GitNestHomepage />}/>

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
