import MinimalPageNav from './MinimalPageNav.jsx';

/**
 * Page layout shell: navigation and chrome survive sectional failures below.
 */
const PageShell = ({ children, showNav = true, className = '' }) => (
  <div className={`min-h-screen bg-white text-zinc-900 transition-colors dark:bg-[#06070a] dark:text-white ${className}`}>
    {showNav ? <MinimalPageNav /> : null}
    {children}
  </div>
);

export default PageShell;
