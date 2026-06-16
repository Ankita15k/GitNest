import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';
import GlobalSearch from '../search/GlobalSearch.jsx';
import NotificationBell from '../ui/NotificationBell.jsx';
import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const MinimalPageNav = () => {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur-xl dark:border-zinc-800 dark:bg-[#06070a]/90">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-700 dark:bg-white">
            <img src={logo} alt="GitNest" className="h-full w-full object-contain" />
          </div>
          <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white">
            Git<span className="text-emerald-500">Nest</span>
          </span>
        </Link>

        <div className="hidden sm:block flex-1 max-w-xs">
          <GlobalSearch />
        </div>
        <div className="sm:hidden">
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Search"
          >
            {mobileSearchOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </button>
        </div>

        <nav className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
          <Link to="/activities" className="transition hover:text-zinc-900 dark:hover:text-white">
            Activity
          </Link>
          <Link to="/docs" className="transition hover:text-zinc-900 dark:hover:text-white">
            Docs
          </Link>
          <Link to="/contact" className="transition hover:text-zinc-900 dark:hover:text-white">
            Contact
          </Link>
          {isAuthenticated ? (
            <>
              <NotificationBell />
              <Link
                to="/dashboard"
                className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium transition hover:border-zinc-400 dark:border-zinc-700"
              >
                Dashboard
              </Link>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium transition hover:border-zinc-400 dark:border-zinc-700"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
      {mobileSearchOpen && (
        <div className="sm:hidden border-t border-zinc-200 dark:border-zinc-800 p-3">
          <GlobalSearch />
        </div>
      )}
    </header>
  );
};

export default MinimalPageNav;
