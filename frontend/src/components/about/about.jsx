import { useState, useEffect } from "react";
import { useThemeStore } from "../store/useThemeStore";
import {
  ArrowRight,
  Sun,
  Moon,
  Menu,
  X,
  Target,
  Eye,
  BookOpen,
  Heart,
  Users,
  Code2,
  GitBranch,
  GitPullRequest,
  Star,
  GitFork,
  MessageCircle,
  Github,
  ExternalLink,
  Sparkles,
  Shield,
  Lightbulb,
  Handshake,
  Globe,
  Rocket,
  CheckCircle2,
  ChevronDown,
  UserCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import { motion, AnimatePresence } from "framer-motion";

function Counter({ target, duration = 1600, suffix = "" }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return (
    <>
      {count.toLocaleString()}
      {suffix}
    </>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: "easeOut" },
  },
};

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const coreValues = [
  {
    icon: Globe,
    title: "Open Source First",
    description:
      "Every line of code, every decision, and every feature is built in the open. Transparency is not optional — it is our foundation.",
  },
  {
    icon: Users,
    title: "Community Driven",
    description:
      "GitNest grows through the collective effort of contributors. Ideas, feedback, and PRs from the community shape the product.",
  },
  {
    icon: Shield,
    title: "Transparency",
    description:
      "Roadmaps, issues, and discussions stay public. Contributors always know where the project is headed and how they can help.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description:
      "We explore AI-assisted workflows, modern tooling, and developer experience improvements that make collaboration feel effortless.",
  },
  {
    icon: Code2,
    title: "Developer Experience",
    description:
      "Clean UI, fast feedback loops, and thoughtful defaults. We obsess over the small details that make coding and contributing enjoyable.",
  },
  {
    icon: Handshake,
    title: "Collaboration",
    description:
      "From issues and pull requests to real-time notifications, GitNest is designed so teams and open-source communities can ship together.",
  },
];

const stats = [
  { label: "Contributors", value: 80, icon: Users, suffix: "+" },
  { label: "Repositories", value: 120, icon: Code2, suffix: "+" },
  { label: "Pull Requests", value: 450, icon: GitPullRequest, suffix: "+" },
  { label: "Commits", value: 1000, icon: GitBranch, suffix: "+" },
  { label: "Stars", value: 21, icon: Star, suffix: "" },
  { label: "Forks", value: 97, icon: GitFork, suffix: "" },
];

const timeline = [
  {
    year: "2025",
    title: "The Idea",
    description:
      "GitNest began as a vision for a lightweight, developer-friendly code hosting platform inspired by GitHub — focused on simplicity, collaboration, and open source.",
  },
  {
    year: "Early 2026",
    title: "Foundation Built",
    description:
      "Core MERN stack architecture landed: authentication, repositories, issues, pull requests, and a modern React + Tailwind frontend.",
  },
  {
    year: "GSSoC 2026",
    title: "Community Ignition",
    description:
      "GitNest joined GirlScript Summer of Code 2026. Contributors from around the world started shipping features, fixing bugs, and improving docs.",
  },
  {
    year: "Growing",
    title: "Platform Maturing",
    description:
      "Real-time notifications, search, profiles, dark mode, AI-assisted workflows, and continuous community-driven improvements.",
  },
];

const openSourcePoints = [
  "Community-first development — features are prioritized based on real contributor and user needs.",
  "Transparent decision making — issues, discussions, and roadmaps remain public and open for input.",
  "Contributor-friendly ecosystem — clear docs, good-first-issues, and supportive maintainers.",
  "Public collaboration principles — code reviews, RFCs, and feedback loops that welcome every skill level.",
];

const teamMembers = [
  {
    name: "Ankita Kumari",
    role: "Project Admin / Maintainer",
    github: "https://github.com/Ankita15k",
    handle: "Ankita15k",
  },
  {
    name: "Core Maintainers",
    role: "Project Leads & Reviewers",
    github: "https://github.com/Ankita15k/GitNest/graphs/contributors",
    handle: "GitNest Team",
  },
  {
    name: "GSSoC Contributors",
    role: "Community Contributors",
    github: "https://github.com/Ankita15k/GitNest/graphs/contributors",
    handle: "Open Source",
  },
];

// Preview FAQs on About — full set lives in components/FAQ/FAQ.jsx
const aboutFaqs = [
  {
    q: "What is GitNest?",
    a: "GitNest is a lightweight, open-source collaborative code hosting platform. It lets developers create repositories, manage commits and branches, track issues, review pull requests, and collaborate — all built with the MERN stack and designed for a great developer experience.",
  },
  {
    q: "Is GitNest free to use?",
    a: "Yes, GitNest is completely free! It's an open-source project built by the community. There are no subscription fees or hidden costs. Everyone can use all features without paying.",
  },
  {
    q: "How can I contribute?",
    a: "Start by reading the documentation and CONTRIBUTING guide, then browse open issues (look for good-first-issue labels). Comment on an issue to get it assigned, then open a pull request. We welcome code, docs, design, and ideas of all sizes.",
  },
];

export default function About() {
  const { isDarkMode, toggleTheme } = useThemeStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Features", href: "/#features" },
    { name: "Documentation", href: "/docs" },
    { name: "About", href: "/about" },
    { name: "Contributors", href: "/#contributors" },
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress =
        totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
      setScrollProgress(Math.min(Math.max(progress, 0), 100));
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f8f7] dark:bg-[#07090d] text-zinc-900 dark:text-white transition-colors">
      {/* BACKGROUND */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-[radial-gradient(circle,rgba(0,220,130,0.12),transparent_60%)] blur-3xl" />
        <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-[#00dc82]/5 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      {/* NAVBAR */}
      <header className="fixed top-4 inset-x-0 z-50 px-3 md:px-6">
        <div className="max-w-7xl mx-auto h-16 md:h-20 rounded-[24px] md:rounded-[28px] border border-white/50 dark:border-white/10 bg-white/75 dark:bg-[#0c0f14]/70 backdrop-blur-2xl shadow-[0_8px_40px_rgba(15,23,42,0.08)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.45)] flex items-center justify-between px-4 md:px-8 transition-all">
          <Link to="/" className="flex items-center gap-4 cursor-pointer">
            <div className="relative w-10 h-10 rounded-2xl bg-white dark:bg-[#10141b] border border-zinc-200 dark:border-white/10 flex items-center justify-center shadow-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00dc82]/20 to-cyan-400/20 blur-xl" />
              <img
                src={logo}
                alt="GitNest"
                className="relative w-8 h-8 object-contain dark:bg-white rounded-2xl"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-[20px] leading-none font-black tracking-tight pb-2">
                Git<span className="text-[#00dc82]">Nest</span>
              </h1>
              <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-800 dark:text-white">
                Collaborative Development
              </p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`relative text-[15px] font-medium transition-all duration-300 ${
                  item.href === "/about"
                    ? "text-zinc-950 dark:text-white"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                {item.name}
                {item.href === "/about" && (
                  <span className="absolute left-1/2 -translate-x-1/2 top-8 w-1.5 h-1.5 rounded-full bg-[#00dc82]" />
                )}
              </Link>
            ))}
          </nav>

          <div className="flex gap-2">
            <button
              onClick={toggleTheme}
              aria-label={
                isDarkMode ? "Switch to light mode" : "Switch to dark mode"
              }
              aria-pressed={isDarkMode}
              className="relative w-[90px] h-12 rounded-full bg-white dark:bg-[#11151c] border border-zinc-200 dark:border-white/10 shadow-inner flex items-center px-1"
            >
              <div
                className={`absolute top-1 w-10 h-10 rounded-full bg-gradient-to-br from-[#00dc82] to-cyan-400 transition-all duration-500 shadow-lg ${
                  isDarkMode ? "translate-x-[45px]" : "translate-x-0"
                }`}
              />
              <div className="relative flex w-full justify-between px-1 z-10">
                <Sun className="w-7 h-5 text-zinc-700" />
                <Moon className="w-5 h-5 text-zinc-700" />
              </div>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-3 rounded-xl border border-zinc-200 dark:border-white/10"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <Link
              to="/docs"
              className="hidden md:flex px-6 py-3 rounded-2xl border border-zinc-200 dark:border-white/20 bg-white/70 dark:bg-white/[0.03] backdrop-blur-xl text-zinc-700 dark:text-zinc-200 hover:shadow-lg transition-all"
            >
              Documentation
            </Link>

            <Link
              to="/register"
              className="hidden lg:flex group px-5 rounded-2xl bg-gradient-to-r from-[#00dc82] via-[#2be4da] to-[#4fd1ff] text-black font-bold shadow-[0_10px_40px_rgba(0,220,130,0.35)] hover:shadow-[0_10px_60px_rgba(0,220,130,0.4)] transition-all duration-300 items-center gap-2"
            >
              Start Contributing
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-3 md:px-6 -mt-1">
          <div className="h-1 w-full bg-zinc-200/80 dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#00dc82] via-[#22e4b8] to-[#4fd1ff] shadow-[0_0_10px_#00dc82] transition-all duration-200"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
              className="lg:hidden fixed top-[88px] left-3 right-3 rounded-3xl border border-white/10 bg-white/95 dark:bg-[#0c0f14]/95 backdrop-blur-2xl shadow-2xl p-6 z-50"
            >
              <div className="flex flex-col gap-5">
                {navLinks.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium text-zinc-800 dark:text-white"
                  >
                    {item.name}
                  </Link>
                ))}
                <Link
                  to="/docs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center rounded-2xl border px-4 py-3"
                >
                  Documentation
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center rounded-2xl bg-gradient-to-r from-[#00dc82] via-[#2be4da] to-[#4fd1ff] px-4 py-3 font-bold text-black"
                >
                  Start Contributing
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main>
        {/* 1. HERO */}
        <section className="relative pt-36 md:pt-44 pb-20 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <span className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-[#00dc82]/20 bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl text-[#00dc82] font-medium text-sm">
                <Sparkles className="w-4 h-4" />
                About GitNest
              </span>

              <h1 className="mt-8 text-4xl sm:text-5xl md:text-7xl font-black leading-[1.1] tracking-tight">
                Building the future of
                <span className="block bg-gradient-to-r from-[#00dc82] via-[#36e4da] to-[#4fd1ff] bg-clip-text text-transparent">
                  open collaboration
                </span>
              </h1>

              <p className="max-w-2xl mx-auto mt-6 text-lg md:text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed">
                GitNest is a lightweight, developer-friendly code hosting
                platform. We exist to empower developers through collaboration,
                transparency, and open source — one commit at a time.
              </p>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Link
                  to="/register"
                  className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#00dc82] via-[#2be4da] to-[#4fd1ff] text-black font-bold shadow-[0_10px_40px_rgba(0,220,130,0.3)] hover:shadow-[0_10px_60px_rgba(0,220,130,0.4)] transition-all"
                >
                  Join the Mission
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="https://github.com/Ankita15k/GitNest"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl border border-zinc-200 dark:border-white/20 bg-white/70 dark:bg-white/[0.03] backdrop-blur-xl font-medium hover:shadow-lg transition-all"
                >
                  <Github className="w-5 h-5" />
                  View on GitHub
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 2 & 3. MISSION + VISION */}
        <section className="relative py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="grid md:grid-cols-2 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={stagger}
            >
              <motion.div
                variants={fadeUp}
                className="rounded-[32px] border border-zinc-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-xl p-8 md:p-10"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00dc82]/20 to-cyan-400/20 flex items-center justify-center mb-6">
                  <Target className="w-7 h-7 text-[#00dc82]" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black mb-4">
                  Our Mission
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg">
                  To empower developers of every skill level by providing a
                  modern, accessible code hosting platform that makes
                  collaboration simple, transparent, and joyful. We believe
                  great software is built together — and that open source is the
                  best path to innovation and inclusion.
                </p>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="rounded-[32px] border border-zinc-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-xl p-8 md:p-10"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00dc82]/20 to-cyan-400/20 flex items-center justify-center mb-6">
                  <Eye className="w-7 h-7 text-[#00dc82]" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black mb-4">
                  Our Vision
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg">
                  A world where every developer has the tools to create, share,
                  and improve software without barriers. We aim to become a
                  trusted home for collaborative projects — blending powerful
                  Git workflows with AI assistance, real-time feedback, and a
                  thriving contributor community.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* 4. OUR STORY + TIMELINE */}
        <section className="relative py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00dc82]/20 bg-white/60 dark:bg-white/[0.03] text-[#00dc82] text-sm font-medium">
                <BookOpen className="w-4 h-4" />
                Our Story
              </span>
              <h2 className="mt-6 text-3xl md:text-5xl font-black">
                From idea to{" "}
                <span className="bg-gradient-to-r from-[#00dc82] to-[#4fd1ff] bg-clip-text text-transparent">
                  community
                </span>
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-zinc-600 dark:text-zinc-400 text-lg">
                GitNest started with a simple belief: collaboration tools should
                be open, approachable, and built by the people who use them.
              </p>
            </motion.div>

            <div className="relative max-w-3xl mx-auto">
              <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#00dc82]/40 via-cyan-400/30 to-transparent md:-translate-x-px" />

              <motion.div
                className="space-y-12"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={stagger}
              >
                {timeline.map((item, i) => (
                  <motion.div
                    key={item.year}
                    variants={fadeUp}
                    className={`relative flex flex-col md:flex-row gap-6 ${
                      i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                    }`}
                  >
                    <div className="absolute left-6 md:left-1/2 w-3 h-3 rounded-full bg-[#00dc82] shadow-[0_0_12px_#00dc82] -translate-x-1.5 md:-translate-x-1.5 mt-2" />
                    <div
                      className={`ml-14 md:ml-0 md:w-1/2 ${
                        i % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"
                      }`}
                    >
                      <span className="text-sm font-bold text-[#00dc82] tracking-wide">
                        {item.year}
                      </span>
                      <h3 className="text-xl font-bold mt-1">{item.title}</h3>
                      <p className="mt-2 text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                    <div className="hidden md:block md:w-1/2" />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* 5. CORE VALUES */}
        <section className="relative py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00dc82]/20 bg-white/60 dark:bg-white/[0.03] text-[#00dc82] text-sm font-medium">
                <Heart className="w-4 h-4" />
                Core Values
              </span>
              <h2 className="mt-6 text-3xl md:text-5xl font-black">
                What we stand for
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-zinc-600 dark:text-zinc-400 text-lg">
                These principles guide every feature we ship and every
                conversation we have with the community.
              </p>
            </motion.div>

            <motion.div
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={stagger}
            >
              {coreValues.map((value) => (
                <motion.div
                  key={value.title}
                  variants={fadeUp}
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="rounded-[28px] border border-zinc-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-xl p-7 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00dc82]/15 to-cyan-400/15 flex items-center justify-center mb-5 group-hover:from-[#00dc82]/25 group-hover:to-cyan-400/25 transition-colors">
                    <value.icon className="w-6 h-6 text-[#00dc82]" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{value.title}</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* 6. IMPACT & STATISTICS */}
        <section className="relative py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-14"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00dc82]/20 bg-white/60 dark:bg-white/[0.03] text-[#00dc82] text-sm font-medium">
                <Rocket className="w-4 h-4" />
                Impact
              </span>
              <h2 className="mt-6 text-3xl md:text-5xl font-black">
                Growing with the community
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-zinc-600 dark:text-zinc-400 text-lg">
                Every star, fork, and pull request represents someone who
                believes in building better tools together.
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={stagger}
            >
              {stats.map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={fadeUp}
                  className="rounded-[24px] border border-zinc-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-xl p-5 text-center"
                >
                  <stat.icon className="w-6 h-6 text-[#00dc82] mx-auto mb-3" />
                  <div className="text-2xl md:text-3xl font-black tracking-tight">
                    <Counter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="mt-1 text-xs md:text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* 7. OPEN SOURCE COMMITMENT */}
        <section className="relative py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="rounded-[36px] border border-zinc-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-xl p-8 md:p-14 overflow-hidden relative"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[radial-gradient(circle,rgba(0,220,130,0.08),transparent_70%)] blur-2xl pointer-events-none" />

              <div className="relative grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00dc82]/20 bg-[#00dc82]/5 text-[#00dc82] text-sm font-medium">
                    <Globe className="w-4 h-4" />
                    Open Source Commitment
                  </span>
                  <h2 className="mt-6 text-3xl md:text-4xl font-black leading-tight">
                    Built in the open,{" "}
                    <span className="bg-gradient-to-r from-[#00dc82] to-[#4fd1ff] bg-clip-text text-transparent">
                      for everyone
                    </span>
                  </h2>
                  <p className="mt-4 text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed">
                    GitNest is more than a codebase — it is a public commitment
                    to community-first development. We ship in the open, listen
                    to contributors, and keep decision-making transparent so
                    anyone can participate.
                  </p>
                  <a
                    href="https://github.com/Ankita15k/GitNest"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#00dc82] via-[#2be4da] to-[#4fd1ff] text-black font-bold shadow-[0_8px_30px_rgba(0,220,130,0.25)] hover:shadow-[0_8px_40px_rgba(0,220,130,0.35)] transition-all"
                  >
                    Explore the Repository
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <ul className="space-y-4">
                  {openSourcePoints.map((point, i) => (
                    <li
                      key={i}
                      className="flex gap-3 items-start rounded-2xl border border-zinc-200/80 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] p-4"
                    >
                      <CheckCircle2 className="w-5 h-5 text-[#00dc82] shrink-0 mt-0.5" />
                      <span className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed">
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 8. MEET THE TEAM / MAINTAINERS */}
        <section className="relative py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-14"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00dc82]/20 bg-white/60 dark:bg-white/[0.03] text-[#00dc82] text-sm font-medium">
                <UserCircle2 className="w-4 h-4" />
                Meet the Team
              </span>
              <h2 className="mt-6 text-3xl md:text-5xl font-black">
                Maintainers & contributors
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-zinc-600 dark:text-zinc-400 text-lg">
                GitNest is led by dedicated maintainers and powered by an
                amazing open-source community.
              </p>
            </motion.div>

            <motion.div
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              {teamMembers.map((member) => (
                <motion.a
                  key={member.name}
                  href={member.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  variants={fadeUp}
                  whileHover={{ y: -6 }}
                  className="rounded-[28px] border border-zinc-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-xl p-8 text-center hover:border-[#00dc82]/30 hover:shadow-lg transition-all"
                >
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#00dc82]/20 to-cyan-400/20 flex items-center justify-center mb-5">
                    <Github className="w-8 h-8 text-[#00dc82]" />
                  </div>
                  <h3 className="text-lg font-bold">{member.name}</h3>
                  <p className="mt-1 text-sm text-[#00dc82] font-medium">
                    {member.role}
                  </p>
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                    @{member.handle}
                  </p>
                </motion.a>
              ))}
            </motion.div>

            <motion.div
              className="mt-10 text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <a
                href="https://github.com/Ankita15k/GitNest/graphs/contributors"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#00dc82] font-medium hover:underline"
              >
                See all contributors on GitHub
                <ExternalLink className="w-4 h-4" />
              </a>
            </motion.div>
          </div>
        </section>

        {/* WHY GITNEST? */}
        <section className="relative py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-14"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <h2 className="text-3xl md:text-5xl font-black">
                Why{" "}
                <span className="bg-gradient-to-r from-[#00dc82] to-[#4fd1ff] bg-clip-text text-transparent">
                  GitNest?
                </span>
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-zinc-600 dark:text-zinc-400 text-lg">
                A focused alternative for teams and open-source projects that
                value clarity, speed, and community ownership.
              </p>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-3 gap-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              {[
                {
                  title: "Lightweight by design",
                  desc: "No bloated features you never use. GitNest focuses on the core workflows developers need every day.",
                },
                {
                  title: "Fully open source",
                  desc: "Self-host, audit, fork, or contribute. The entire platform is under the MIT license and community-owned.",
                },
                {
                  title: "Contributor experience",
                  desc: "From good-first-issues to clear docs and GSSoC mentorship, we invest in making contribution welcoming.",
                },
              ].map((card) => (
                <motion.div
                  key={card.title}
                  variants={fadeUp}
                  className="rounded-[28px] border border-zinc-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-xl p-8"
                >
                  <h3 className="text-xl font-bold mb-3">{card.title}</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {card.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* FAQ PREVIEW → FAQ.jsx + DocumentationPage.jsx */}
        <section className="relative py-20 px-6">
          <div className="max-w-3xl mx-auto">
            <motion.div
              className="text-center mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <h2 className="text-3xl md:text-5xl font-black">
                Frequently asked questions
              </h2>
              <p className="mt-4 text-zinc-600 dark:text-zinc-400 text-lg">
                A few quick answers. For accounts, repos, collaboration, and
                more — see the full FAQ.
              </p>
            </motion.div>

            <motion.div
              className="space-y-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              {aboutFaqs.map((faq, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-xl overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left font-semibold hover:bg-zinc-50/50 dark:hover:bg-white/[0.02] transition-colors"
                    aria-expanded={openFaq === i}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 shrink-0 text-[#00dc82] transition-transform duration-300 ${
                        openFaq === i ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <p className="px-6 pb-5 pt-4 text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-200 dark:border-white/5">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <Link
                to="/#faq"
                className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#00dc82] via-[#2be4da] to-[#4fd1ff] text-black font-bold shadow-[0_10px_30px_rgba(0,220,130,0.25)] hover:shadow-[0_10px_40px_rgba(0,220,130,0.35)] transition-all"
              >
                View all FAQs
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/docs"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-zinc-200 dark:border-white/20 bg-white/70 dark:bg-white/[0.03] backdrop-blur-xl font-medium hover:shadow-lg transition-all"
              >
                <BookOpen className="w-5 h-5 text-[#00dc82]" />
                Read Documentation
              </Link>
            </motion.div>
          </div>
        </section>

        {/* 9. JOIN THE MISSION */}
        <section className="relative py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              className="rounded-[36px] border border-zinc-200 dark:border-white/10 bg-gradient-to-br from-white/80 to-white/40 dark:from-white/[0.06] dark:to-white/[0.02] backdrop-blur-xl p-10 md:p-16 text-center relative overflow-hidden"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(0,220,130,0.1),transparent_60%)] blur-2xl" />
              </div>

              <div className="relative">
                <h2 className="text-3xl md:text-5xl font-black leading-tight">
                  Join the mission
                </h2>
                <p className="mt-5 max-w-xl mx-auto text-zinc-600 dark:text-zinc-400 text-lg">
                  Whether you write code, improve docs, report bugs, suggest
                  features, or join discussions — your contribution helps shape
                  the future of GitNest.
                </p>

                <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                  <a
                    href="https://github.com/Ankita15k/GitNest/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#00dc82] via-[#2be4da] to-[#4fd1ff] text-black font-bold shadow-[0_10px_40px_rgba(0,220,130,0.3)] hover:shadow-[0_10px_50px_rgba(0,220,130,0.4)] transition-all"
                  >
                    Contribute on GitHub
                    <ArrowRight className="w-5 h-5" />
                  </a>
                  <Link
                    to="/docs"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-zinc-200 dark:border-white/20 bg-white/70 dark:bg-white/[0.03] font-medium hover:shadow-lg transition-all"
                  >
                    Read Contributing Guide
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 10. JOIN THE COMMUNITY */}
        <section className="relative py-16 px-6 pb-28">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <h2 className="text-3xl md:text-4xl font-black">
                Join the community
              </h2>
              <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                Connect, discuss, and grow with fellow contributors.
              </p>
            </motion.div>

            <motion.div
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              {[
                {
                  icon: Github,
                  title: "GitHub",
                  desc: "Issues, PRs & Discussions",
                  href: "https://github.com/Ankita15k/GitNest",
                },
                {
                  icon: MessageCircle,
                  title: "Discord",
                  desc: "Chat with the community",
                  href: "https://discord.gg/QHSNsRuA",
                },
                {
                  icon: BookOpen,
                  title: "Docs",
                  desc: "Guides & architecture",
                  href: "/docs",
                  internal: true,
                },
                {
                  icon: GitPullRequest,
                  title: "Good First Issues",
                  desc: "Start contributing today",
                  href: "https://github.com/Ankita15k/GitNest/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22",
                },
              ].map((item) => {
                const Comp = item.internal ? Link : "a";
                const props = item.internal
                  ? { to: item.href }
                  : {
                      href: item.href,
                      target: "_blank",
                      rel: "noopener noreferrer",
                    };
                return (
                  <motion.div key={item.title} variants={fadeUp}>
                    <Comp
                      {...props}
                      className="flex flex-col items-center text-center rounded-[24px] border border-zinc-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-xl p-6 hover:border-[#00dc82]/30 hover:shadow-lg transition-all h-full"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00dc82]/15 to-cyan-400/15 flex items-center justify-center mb-4">
                        <item.icon className="w-6 h-6 text-[#00dc82]" />
                      </div>
                      <h3 className="font-bold">{item.title}</h3>
                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        {item.desc}
                      </p>
                    </Comp>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 dark:border-white/10 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500 dark:text-zinc-400">
          <p>
            © {new Date().getFullYear()} GitNest · Open source under MIT · GSSoC
            2026
          </p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-[#00dc82]" /> for the
            open source community
          </p>
        </div>
      </footer>
    </div>
  );
}
