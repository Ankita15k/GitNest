import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

/**
 * Lightweight navigation shell that survives sectional content failures.
 */
const MinimalPageNav = () => (
  <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur-xl dark:border-zinc-800 dark:bg-[#06070a]/90">
    <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <Link to="/" className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-700 dark:bg-white">
          <img src={logo} alt="GitNest" className="h-full w-full object-contain" />
        </div>
        <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white">
          Git<span className="text-emerald-500">Nest</span>
        </span>
      </Link>

      <nav className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
        <Link to="/activities" className="transition hover:text-zinc-900 dark:hover:text-white">
          Activity
        </Link>
        <Link to="/docs" className="transition hover:text-zinc-900 dark:hover:text-white">
          Docs
        </Link>
        <Link
          to="/login"
          className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium transition hover:border-zinc-400 dark:border-zinc-700"
        >
          Sign in
        </Link>
      </nav>
    </div>
  </header>
);

export default MinimalPageNav;
