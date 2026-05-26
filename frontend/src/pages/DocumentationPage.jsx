import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sun, ArrowRight, Moon, Menu, X } from 'lucide-react';
import logo from '../assets/logo.png';
import { useThemeStore } from '../store/useThemeStore';
import { motion, AnimatePresence } from "framer-motion";

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'start', label: 'Quick Start' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'conventions', label: 'Conventions' },
  { id: 'contributors', label: 'Contributing' },
  { id: 'checklist', label: 'PR Checklist' },
];

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Features", href: "/#features" },
  { name: "Contributors", href: "/#contributors" },
];

const techCards = [
  {
    title: 'Backend',
    text: 'Node.js, Express, MongoDB, JWT auth, validation middleware, and centralized API responses.',
  },
  {
    title: 'Frontend',
    text: 'React + Vite, route-based pages, reusable components, and focused feature modules.',
  },
  {
    title: 'Open Source Focus',
    text: 'Contributor-friendly structure with clear docs, predictable patterns, and review-ready changes.',
  },
];

const DocumentationPage = () => {
  const { isDarkMode, toggleTheme } = useThemeStore();
  const [activeSection, setActiveSection] = useState('overview');
  const [docsMenuOpen, setDocsMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      return window.location.hash;
    }

    return "#home";
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        threshold: 0.3,
      }
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });



    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#f6f8f7] dark:bg-[#07090d] text-zinc-900 dark:text-white transition-colors">

      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-60 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] rounded-full bg-[radial-gradient(circle,rgba(0,220,130,0.12),transparent_60%)] blur-3xl" />
        <div className="absolute top-[20%] right-[-10%] w-[30rem] h-[30rem] rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-[-5%] w-[25rem] h-[25rem] rounded-full bg-emerald-400/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.035] dark:opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      <header className="fixed top-4 inset-x-0 z-50 px-3 md:px-6">
        <div className="max-w-7xl mx-auto h-16 md:h-20 rounded-[24px] md:rounded-[28px] border border-white/50 dark:border-white/10 bg-white/80 dark:bg-[#0c0f14]/80 backdrop-blur-2xl shadow-[0_8px_40px_rgba(15,23,42,0.08)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.45)] flex items-center justify-between px-4 md:px-8 transition-all">

          <div className="flex items-center gap-3 sm:gap-4 cursor-pointer">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white dark:bg-[#10141b] border border-zinc-200 dark:border-white/10 flex items-center justify-center shadow-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00dc82]/20 to-cyan-400/20 blur-xl" />
              <img
                src={logo}
                alt="GitNest"
                className="relative w-6 h-6 sm:w-8 sm:h-8 object-contain dark:bg-white rounded-xl"
              />
            </div>

            <div className="hidden sm:block">
              <h1 className="text-[20px] leading-none font-black tracking-tight pb-1">
                Git<span className="text-[#00dc82]">Nest</span>
              </h1>
              <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-800 dark:text-zinc-400">
                Collaborative
              </p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setActiveLink(item.href)}
                className={`relative text-[15px] font-medium transition-all duration-300 ${activeLink === item.href
                  ? "text-zinc-950 dark:text-white"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                  }`}
              >
                {item.name}
                {activeLink === item.href && (
                  <span className="absolute left-1/2 -translate-x-1/2 top-8 w-1.5 h-1.5 rounded-full bg-[#00dc82]" />
                )}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              className="relative w-[72px] sm:w-[90px] h-10 sm:h-12 rounded-full bg-white dark:bg-[#11151c] border border-zinc-200 dark:border-white/10 shadow-inner flex items-center px-1"
            >
              <div
                className={`absolute top-1 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#00dc82] to-cyan-400 transition-all duration-500 shadow-lg ${isDarkMode ? "translate-x-[32px] sm:translate-x-[45px]" : "translate-x-0"
                  }`}
              />
              <div className="relative flex w-full justify-between px-1 sm:px-1.5 z-10">
                <Sun className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-700" />
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-700" />
              </div>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 sm:p-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-md"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <Link
              to="/docs"
              className="hidden md:flex px-6 py-3 rounded-2xl border border-zinc-200 dark:border-white/20 bg-white/70 dark:bg-white/[0.03] backdrop-blur-xl text-zinc-700 dark:text-zinc-200 hover:shadow-lg transition-all"
            >
              Documentation
            </Link>

            <Link
              to="/register"
              className="hidden lg:flex group px-5 py-3 rounded-2xl bg-gradient-to-r from-[#00dc82] via-[#2be4da] to-[#4fd1ff] text-black font-bold shadow-[0_10px_40px_rgba(0,220,130,0.35)] hover:-translate-x-1 transition-all duration-300 items-center gap-2"
            >
              Start Contributing
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden fixed top-[88px] left-3 right-3 rounded-3xl border border-zinc-200 dark:border-white/10 bg-white/95 dark:bg-[#0c0f14]/95 backdrop-blur-3xl shadow-2xl p-6 z-[60]"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-medium text-zinc-800 dark:text-white hover:text-[#00dc82] transition-colors p-2"
                >
                  {item.name}
                </a>
              ))}
              <div className="h-px w-full bg-zinc-200 dark:bg-white/10 my-2" />
              <Link
                to="/docs"
                className="w-full text-center rounded-2xl border border-zinc-300 dark:border-white/20 px-4 py-3 font-medium"
              >
                Documentation
              </Link>
              <Link
                to="/register"
                className="w-full text-center rounded-2xl bg-gradient-to-r from-[#00dc82] via-[#2be4da] to-[#4fd1ff] px-4 py-3 font-bold text-black"
              >
                Start Contributing
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="lg:hidden fixed top-[90px] sm:top-[100px] left-3 right-3 z-40 flex items-center justify-between rounded-2xl border border-zinc-200 dark:border-white/10 bg-white/85 dark:bg-[#0c0f14]/85 backdrop-blur-xl p-3 shadow-lg">
        <span className="font-semibold text-sm sm:text-base text-zinc-800 dark:text-zinc-200 ml-2">
          Documentation Menu
        </span>
        <button
          onClick={() => setDocsMenuOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00dc82]/10 text-[#00c97b] border border-[#00dc82]/20 text-sm font-semibold hover:bg-[#00dc82]/20 transition-colors"
        >
          <Menu size={16} />
          Contents
        </button>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-[160px] pb-12 lg:pt-[140px] lg:pb-16 w-full">
        <section className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-8 w-full">

          {docsMenuOpen && (
            <div
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
              onClick={() => setDocsMenuOpen(false)}
            />
          )}

          <aside className={`
        fixed inset-y-0 left-0 z-[70] w-[280px] h-[100dvh] transform transition-transform duration-300 ease-out
        lg:static lg:block lg:translate-x-0 lg:w-auto lg:h-fit lg:sticky lg:top-28
        ${docsMenuOpen ? "translate-x-0" : "-translate-x-full"}
        overflow-y-auto lg:overflow-visible
        rounded-r-3xl lg:rounded-4xl
        border-r lg:border border-zinc-200 dark:border-white/5
        bg-white dark:bg-[#0a0d13] lg:bg-white/70 lg:dark:bg-white/3
        lg:backdrop-blur-2xl p-6 shadow-2xl lg:shadow-[0_15px_50px_rgba(15,23,42,0.06)]
      `}>
            <div className="flex items-center justify-between mb-6 lg:mb-4 pt-4 lg:pt-0">
              <div className="text-xs font-bold tracking-[0.3em] uppercase text-emerald-500 dark:text-emerald-400">
                Contents
              </div>
              <button
                className="lg:hidden p-2 rounded-xl bg-zinc-100 dark:bg-white/5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                onClick={() => setDocsMenuOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <nav className="space-y-2">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={() => {
                    setActiveSection(section.id);
                    setDocsMenuOpen(false);
                  }}
                  className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300 ${activeSection === section.id
                    ? 'bg-gradient-to-r from-[#e9fff5] to-[#f4fffb] dark:from-[#102019] dark:to-[#0f1714] text-[#00c97b] border border-[#00dc82]/10 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-[#00c97b]'
                    }`}
                >
                  {section.label}
                </a>
              ))}
            </nav>

            <div className="mt-8 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
              Start here if you are a new contributor. The page is optimized for clarity, not just appearance.
            </div>
          </aside>

          <section className="space-y-6 lg:space-y-8 w-full max-w-full overflow-hidden">

            <div className="relative overflow-hidden w-full rounded-[2rem] sm:rounded-[2.5rem] border border-zinc-200 dark:border-white/5 bg-gradient-to-br from-white via-[#f8fffc] to-white dark:from-[#11161d] dark:via-[#0c1015] dark:to-[#0d1218] p-6 sm:p-8 md:p-10 shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
              <div className="absolute top-0 right-0 w-[20rem] h-[20rem] bg-[#00dc82]/10 blur-3xl rounded-full pointer-events-none" />

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-400/20 bg-gradient-to-r from-[#ebfff6] to-[#f4fffb] dark:from-[#112018] dark:to-[#101a17] text-[#00c97b] text-xs sm:text-sm font-semibold mb-6">
                Open Source Contributor Guide
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight mb-5 text-zinc-900 dark:text-white break-words">
                GitNest Documentation
              </h1>

              <p className="text-sm sm:text-base md:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-3xl">
                A professional starting point for contributors and maintainers. Use this page to understand the project structure, run the app locally, and keep changes consistent with the repository standards.
              </p>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
                {techCards.map((card) => (
                  <div key={card.title} className="relative overflow-hidden w-full rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#121820] p-5 shadow-sm hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-[#00dc82] to-cyan-400 rounded-full" />
                    <h3 className="font-bold text-base sm:text-lg mb-2 text-zinc-900 dark:text-white">{card.title}</h3>
                    <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{card.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <section id="overview" className="w-full rounded-3xl border border-zinc-200 dark:border-white/5 bg-white/70 dark:bg-white/3 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
              <p className="bg-gradient-to-r from-[#00c97b] to-cyan-400 bg-clip-text text-transparent text-xs sm:text-sm font-bold tracking-widest uppercase mb-3">1. Overview</p>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-4 text-zinc-900 dark:text-white">What GitNest is</h2>
              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-4xl">
                GitNest is a GitHub-inspired collaborative development platform built with the MERN stack. It supports repository workflows, authentication, profile management, and a contributor-friendly open source experience.
              </p>
            </section>

            <section id="start" className="w-full rounded-3xl border border-zinc-200 dark:border-white/5 bg-white/70 dark:bg-white/3 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
              <p className="bg-gradient-to-r from-[#00c97b] to-cyan-400 bg-clip-text text-transparent text-xs sm:text-sm font-bold tracking-widest uppercase mb-3">2. Quick Start</p>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-4 text-zinc-900 dark:text-white">Run the project locally</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div className="w-full rounded-2xl border border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-[#0e141b] p-5">
                  <h3 className="font-bold mb-3 text-zinc-900 dark:text-white">Backend</h3>
                  <pre className="w-full overflow-x-auto text-xs sm:text-sm leading-7 text-emerald-600 dark:text-emerald-300 bg-zinc-100 dark:bg-[#09111d] rounded-xl p-4 m-0"><code>cd backend
                    npm install
                    npm run dev</code></pre>
                </div>
                <div className="w-full rounded-2xl border border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-[#0e141b] p-5">
                  <h3 className="font-bold mb-3 text-zinc-900 dark:text-white">Frontend</h3>
                  <pre className="w-full overflow-x-auto text-xs sm:text-sm leading-7 text-emerald-600 dark:text-emerald-300 bg-zinc-100 dark:bg-[#09111d] rounded-xl p-4 m-0"><code>cd frontend
                    npm install
                    npm run dev</code></pre>
                </div>
              </div>
              <p className="mt-5 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
                If you prefer containerized development, use <span className="font-medium px-2 py-1 rounded bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white">docker-compose.yml</span>.
              </p>
            </section>

            <section id="architecture" className="w-full rounded-3xl border border-zinc-200 dark:border-white/5 bg-white/70 dark:bg-white/3 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
              <p className="bg-gradient-to-r from-[#00c97b] to-cyan-400 bg-clip-text text-transparent text-xs sm:text-sm font-bold tracking-widest uppercase mb-3">3. Architecture</p>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-4 text-zinc-900 dark:text-white">How the codebase is organized</h2>
              <div className="w-full rounded-2xl border border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-[#0e141b] p-5">
                <pre className="w-full overflow-x-auto m-0 text-xs sm:text-sm leading-relaxed text-zinc-700 dark:text-zinc-300"><code>GitNest/
                  backend/
                  src/
                  controllers/
                  routes/
                  middleware/
                  models/
                  validators/
                  utils/
                  frontend/
                  src/
                  pages/
                  components/
                  api/
                  store/
                  utils/</code></pre>
              </div>
            </section>

            <section id="conventions" className="w-full rounded-3xl border border-zinc-200 dark:border-white/5 bg-white/70 dark:bg-white/3 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
              <p className="bg-gradient-to-r from-[#00c97b] to-cyan-400 bg-clip-text text-transparent text-xs sm:text-sm font-bold tracking-widest uppercase mb-3">4. Conventions</p>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-4 text-zinc-900 dark:text-white">How to keep changes consistent</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
                <div className="w-full rounded-2xl border border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-white/3 p-5">
                  <h3 className="font-bold text-lg mb-3 text-zinc-900 dark:text-white">Backend</h3>
                  <ul className="space-y-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 list-disc pl-4">
                    <li>Keep request logic inside controllers, not routes.</li>
                    <li>Place validation in the validators and middleware layer.</li>
                    <li>Use centralized response helpers and shared error handling.</li>
                    <li>Avoid mixing business logic into transport code.</li>
                  </ul>
                </div>
                <div className="w-full rounded-2xl border border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-white/3 p-5">
                  <h3 className="font-bold text-lg mb-3 text-zinc-900 dark:text-white">Frontend</h3>
                  <ul className="space-y-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 list-disc pl-4">
                    <li>Keep pages route-focused and components reusable.</li>
                    <li>Centralize HTTP calls in API modules.</li>
                    <li>Use stores only for shared state, not everything.</li>
                    <li>Design loading, success, and error states explicitly.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section id="contributors" className="w-full rounded-3xl border border-zinc-200 dark:border-white/5 bg-white/70 dark:bg-white/3 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
              <p className="bg-gradient-to-r from-[#00c97b] to-cyan-400 bg-clip-text text-transparent text-xs sm:text-sm font-bold tracking-widest uppercase mb-3">5. Contributing</p>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-4 text-zinc-900 dark:text-white">Contributor workflow</h2>
              <ol className="space-y-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 list-decimal pl-5">
                <li>Create a focused branch from <span className="font-medium text-zinc-900 dark:text-white">main</span>.</li>
                <li>Make small, reviewable commits with clear messages.</li>
                <li>Run linting and test the touched flow locally.</li>
                <li>Open a pull request with the problem, solution, and impact.</li>
                <li>Attach screenshots or short clips for UI work.</li>
              </ol>
            </section>

            <section id="checklist" className="w-full rounded-3xl border border-zinc-200 dark:border-white/5 bg-white/70 dark:bg-white/3 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
              <p className="bg-gradient-to-r from-[#00c97b] to-cyan-400 bg-clip-text text-transparent text-xs sm:text-sm font-bold tracking-widest uppercase mb-3">6. PR Checklist</p>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-4 text-zinc-900 dark:text-white">Before you submit</h2>
              <ul className="space-y-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 list-disc pl-5">
                <li>The change matches the existing structure and naming patterns.</li>
                <li>No secrets, keys, or private values are committed to source files.</li>
                <li>New endpoints include validation and error-path handling.</li>
                <li>UI changes include loading and failure states where needed.</li>
                <li>The pull request description explains the value of the change clearly.</li>
              </ul>

              <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
                <Link to="/register" className="w-full sm:w-auto text-center px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#00dc82] via-[#2be4da] to-[#4fd1ff] text-black font-bold shadow-[0_10px_40px_rgba(0,220,130,0.25)] hover:-translate-y-1 transition-all">
                  Start Contributing
                </Link>
                <Link to="/" className="w-full sm:w-auto text-center px-6 py-3.5 rounded-2xl border border-zinc-300 dark:border-white/10 bg-white/70 dark:bg-white/3 backdrop-blur-xl hover:shadow-lg transition-all font-medium text-zinc-800 dark:text-white">
                  Back to Home
                </Link>
              </div>
            </section>
          </section>
        </section>
      </main>
    </div>
  );
};

export default DocumentationPage;