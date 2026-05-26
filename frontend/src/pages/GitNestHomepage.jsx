import { useState } from "react";
import { useThemeStore } from '../store/useThemeStore';
import {
    GitBranch,
    ShieldCheck,
    Sparkles,
    Users,
    ArrowRight,
    Sun,
    Moon,
    Layers3,
    Code2,
    Wand2,
    Shield,
    Menu, X
} from "lucide-react";
import { Link } from 'react-router-dom';
import logo from "../assets/logo.png";
import { motion, AnimatePresence } from "framer-motion";
import "../App.css";

export default function GitNestHomepage() {
    const [activeLink, setActiveLink] = useState(() => {
        if (typeof window !== "undefined" && window.location.hash) {
            return window.location.hash;
        }

        return "#home";
    });
    const { isDarkMode, toggleTheme } = useThemeStore();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


    const marqueeItems = [
        "MERN Stack",
        "AI Workflows",
        "Open Source",
        "GSSoC 2026",
        "DevOps",
        "Realtime Collaboration",
        "PR Reviews",
        "Contributor Friendly",
        "TypeScript",
        "Node.js",
        "MongoDB",
    ];

    const navLinks = [
        { name: "Home", href: "#home" },
        { name: "Features", href: "#features" },
        { name: "Contributors", href: "#contributors" },
    ];

    return (

        <div className="relative min-h-screen overflow-hidden bg-[#f6f8f7] dark:bg-[#07090d] text-zinc-900 dark:text-white transition-colors">

            {/* BACKGROUND */}
            <div className="absolute inset-0 -z-10 overflow-hidden">

                <div className="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-[radial-gradient(circle,rgba(0,220,130,0.12),transparent_60%)] blur-3xl" />

                <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-400/10 blur-3xl" />

                <div className="absolute inset-0 opacity-[0.04]"
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

                    {/* LOGO */}
                    <div className="flex items-center gap-4 cursor-pointer">

                        <div className="relative w-10 h-10 rounded-2xl bg-white dark:bg-[#10141b] border border-zinc-200 dark:border-white/10 flex items-center justify-center shadow-lg overflow-hidden">

                            <div className="absolute inset-0 bg-gradient-to-br from-[#00dc82]/20 to-cyan-400/20 blur-xl" />

                            <img
                                src={logo}
                                alt="GitNest"
                                className="relative w-8 h-8 object-contain  dark:bg-white rounded-2xl"
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
                    </div>

                    {/* NAV LINKS */}
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

                    {/* RIGHT */}
                    <div className="flex  gap-2">


                        {/* PREMIUM TOGGLE */}
                        <button
                            onClick={toggleTheme}
                            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                            aria-pressed={isDarkMode}
                            className="relative w-[90px] h-12 rounded-full bg-white dark:bg-[#11151c] border border-zinc-200 dark:border-white/10 shadow-inner flex items-center px-1"
                        >
                            <div
                                className={`absolute top-1 w-10 h-10 rounded-full bg-gradient-to-br from-[#00dc82] to-cyan-400 transition-all duration-500 shadow-lg ${isDarkMode ? "translate-x-[45px]" : "translate-x-0"
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
                            className="hidden lg:flex group px-5 rounded-2xl bg-gradient-to-r from-[#00dc82] via-[#2be4da] to-[#4fd1ff] text-black font-bold shadow-[0_10px_40px_rgba(0,220,130,0.35)] hover:-translate-x-1 transition-all duration-300 items-center gap-2"
                        >
                            Start Contributing

                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </header>

            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        {/* Backdrop — click outside to close */}
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
                                <a
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-lg font-medium text-zinc-800 dark:text-white"
                                >
                                    {item.name}
                                </a>
                            ))}

                            <Link
                                to="/docs"
                                className="w-full text-center rounded-2xl border px-4 py-3"
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
                    </>
                )}
            </AnimatePresence>

            {/* HERO */}
            <section className="relative pt-25" id="home">

                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-24 items-center">

                    {/* LEFT */}
                    <div className=" ">

                        {/* BADGE */}
                        <div className="inline-flex items-center gap-3 px-5 py-0 rounded-full border border-[#00dc82]/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl text-[#1edb8c] shadow-lg mb-10">

                            <Sparkles className="w-4 h-4" />

                            <span className="text-sm font-medium p-3">
                                Open Source • GSSoC 2026
                            </span>
                        </div>

                        {/* TITLE */}
                        <h1 className="text-[50px]  leading-[1]  font-black">

                            <span className="block">
                                Build the future
                            </span>

                            <span className="block">
                                of
                            </span>

                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#00dc82] via-[#36e4da] to-[#4fd1ff] drop-shadow-[0_10px_30px_rgba(0,220,130,0.25)]">
                                collaborative
                            </span>

                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#00dc82] via-[#36e4da] to-[#4fd1ff]">
                                coding
                            </span>
                        </h1>

                        {/* DESCRIPTION */}
                        <p className="text-[16px] leading-7 text-zinc-950 dark:text-zinc-400 max-w-2xl mb-5 mt-2">
                            GitNest is a full-featured GitHub-inspired platform built with the MERN stack. Create repositories, browse code, manage issues, review pull requests, and collaborate — all in one open-source developer ecosystem.
                        </p>

                        {/* CTA */}
                        <div className="flex flex-wrap gap-5 mb-14">

                            <Link
                                to="/login"
                                className="group px-6 py-3 rounded-3xl bg-gradient-to-r from-[#00dc82] to-[#36e4da] text-black font-bold shadow-[0_15px_45px_rgba(0,220,130,0.30)] hover:-translate-y-1 transition-all flex items-center gap-3"
                            >
                                Explore Repositories

                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <Link
                                to="/docs#architecture"
                                className="px-8 py-3 rounded-3xl border border-zinc-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-xl text-zinc-700 dark:text-zinc-200 hover:shadow-xl transition-all flex items-center gap-3"
                            >

                                <Layers3 className="w-5 h-5" />

                                View Architecture
                            </Link>
                        </div>

                        {/* TRACKS */}
                        <div className="flex flex-wrap items-center gap-2">

                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-2xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 flex items-center justify-center shadow-lg">
                                    <Code2 className="w-5 h-5 text-[#00dc82]" />
                                </div>

                                <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                                    MERN
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-2xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 flex items-center justify-center shadow-lg">
                                    <Users className="w-5 h-5 text-[#00dc82]" />
                                </div>

                                <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                                    GSSOC <br />Community
                                </span>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-2xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 flex items-center justify-center shadow-lg">
                                    <Wand2 className="w-5 h-5 text-[#00dc82]" />
                                </div>

                                <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                                    AI <br />Workflows
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-2xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 flex items-center justify-center shadow-lg">
                                    <Shield className="w-5 h-5 text-[#00dc82]" />
                                </div>

                                <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                                    Secure & Reliable
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT DASHBOARD */}
                    <div className="relative pt-16">

                        {/* ORBITAL EFFECT */}
                        <div className="absolute inset-0 flex items-center justify-center">

                            <div className="w-[700px] h-[700px] border border-[#00dc82]/10 rounded-full" />

                            <div className="absolute w-[520px] h-[520px] border border-cyan-400/10 rounded-full" />
                        </div>

                        {/* FLOATING DOTS */}
                        <div className="absolute left-10 top-20 w-3 h-3 rounded-full bg-[#00dc82] shadow-[0_0_30px_#00dc82]" />

                        <div className="absolute right-0 bottom-10 w-3 h-3 rounded-full bg-violet-400 shadow-[0_0_30px_#8b5cf6]" />

                        {/* DASHBOARD */}
                        <div className="relative rounded-[36px] border border-white/40 dark:border-white/10 bg-white/70 dark:bg-[#0f131a]/80 backdrop-blur-2xl shadow-[0_30px_80px_rgba(15,23,42,0.12)] overflow-hidden">

                            {/* TOP BAR */}
                            <div className="h-14 border-b border-zinc-200 dark:border-white/5 flex items-center justify-between px-8 bg-white/60 dark:bg-white/[0.02]">

                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-red-400" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                    <div className="w-3 h-3 rounded-full bg-[#00dc82]" />
                                </div>

                                <div className="text-xs uppercase tracking-[0.25em] text-zinc-900">
                                    GitNest Dashboard
                                </div>
                            </div>

                            {/* CONTENT */}
                            <div className="p-4 space-y-6">

                                {/* REPO CARD */}
                                <div className="relative overflow-hidden rounded-[28px] border border-[#00dc82]/10 bg-gradient-to-br from-white to-[#f3fffb] dark:from-[#11161d] dark:to-[#0f141a] p-6">

                                    <div className="absolute top-0 right-0 w-40 h-40 bg-[#00dc82]/10 blur-3xl rounded-full" />

                                    <div className="flex items-start justify-between">

                                        <div>
                                            <h3 className="text-2xl font-black mb-1">
                                                gitnest-core
                                            </h3>

                                            <p className="text-zinc-500 leading-7">
                                                GitHub-inspired repository management with pull requests, issues, branching, and AI-powered workflows.
                                            </p>
                                        </div>

                                        <div className="px-4 py-2 rounded-full bg-[#00dc82]/10 border border-[#00dc82]/20 text-[#00dc82] text-sm font-semibold">
                                            Public
                                        </div>
                                    </div>

                                    {/* STATS */}
                                    <div className="grid grid-cols-3 gap-2">

                                        {[
                                            { value: "42", label: "Stars", icon: <Sparkles className="w-5 h-5" /> },
                                            { value: "18", label: "PRs", icon: <GitBranch className="w-5 h-5" /> },
                                            { value: "9", label: "Contributors", icon: <Users className="w-5 h-5" /> },
                                        ].map((item) => (
                                            <div
                                                key={item.label}
                                                className="rounded-2xl border border-zinc-200 dark:border-white/5 bg-white/70 dark:bg-white/[0.03] backdrop-blur-xl p-2 px-4 shadow-lg"
                                            >
                                                <div className="w-7 h-7 rounded-2xl bg-[#00dc82]/10 flex items-center justify-center text-[#00dc82] mb-5">
                                                    {item.icon}
                                                </div>

                                                <div className="text-3xl font-black mb-2">
                                                    {item.value}
                                                </div>

                                                <div className="text-zinc-900 text-sm">
                                                    {item.label}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* ACTIVITY */}
                                <div className="space-y-4">

                                    {[
                                        "feat(auth): add JWT authentication flow",
                                        "fix(ui): resolve repository sidebar overflow",
                                        "feat(ai): integrate PR review assistant",
                                        "docs: add contributor onboarding guide",
                                    ].map((item) => (
                                        <div
                                            key={item}
                                            className="flex items-center justify-between rounded-2xl border border-zinc-200 dark:border-white/5 bg-white/70 dark:bg-white/[0.02] backdrop-blur-xl px-5 py-4 hover:translate-x-1 transition-all"
                                        >

                                            <div className="flex items-center gap-4 min-w-0">

                                                <div className="w-3 h-3 rounded-full bg-[#00dc82]" />

                                                <p className="truncate text-zinc-700 dark:text-zinc-300">
                                                    {item}
                                                </p>
                                            </div>

                                            <span className="text-sm text-zinc-500">
                                                2h ago
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MARQUEE */}
                <div className="relative mt-24 overflow-hidden border-y border-zinc-200 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] backdrop-blur-xl">

                    <div className="flex whitespace-nowrap animate-marquee py-6">

                        {[...marqueeItems, ...marqueeItems].map((item, i) => (
                            <div
                                key={i}
                                className="mx-4 px-6 py-3 rounded-full border border-zinc-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] shadow-md text-zinc-700 dark:text-zinc-300 font-medium"
                            >
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section
                id="features"
                className="relative py-32 overflow-hidden border-t border-zinc-200 dark:border-white/5 bg-[#f7faf9] dark:bg-[#080b11]"
            >

                {/* BACKGROUND DECOR */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">

                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage:
                                "radial-gradient(circle at 20% 18%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.45) 14%, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0) 58%), linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.12) 24%, rgba(255,255,255,0) 52%)",
                        }}
                    />

                    {/* LEFT BLUR */}
                    <div className="absolute left-[-120px] top-[45%] w-[220px] h-[220px] rounded-full bg-blue-200/25 blur-3xl" />

                    <div className="absolute -top-24 right-12 h-80 w-80 rounded-full bg-white/50 blur-3xl dark:bg-cyan-400/10" />

                    <div className="absolute inset-0 opacity-[0.04]"
                        style={{
                            backgroundImage:
                                "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
                            backgroundSize: "80px 80px",
                        }}
                    />

                    {/* RIGHT CURVE */}
                    <svg
                        className="absolute right-0 top-20 opacity-40"
                        width="420"
                        height="240"
                        viewBox="0 0 420 240"
                        fill="none"
                    >
                        <path
                            d="M0 120C120 20 220 220 420 40"
                            stroke="url(#paint0_linear)"
                            strokeWidth="2"
                        />

                        <defs>
                            <linearGradient id="paint0_linear" x1="0" y1="0" x2="420" y2="0">
                                <stop stopColor="#00dc82" />
                                <stop offset="1" stopColor="#4fd1ff" />
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* DOT GRID */}
                    <div className="absolute top-20 right-[18%] grid grid-cols-8 gap-4 opacity-20">
                        {Array.from({ length: 40 }).map((_, i) => (
                            <div
                                key={i}
                                className="w-1 h-1 rounded-full bg-[#4fd1ff]"
                            />
                        ))}
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">

                    {/* SECTION HEADER */}
                    <div className="max-w-4xl mb-20">

                        <p className="text-[15px] font-bold tracking-[0.25em] uppercase bg-gradient-to-r from-[#00dc82] to-[#4fd1ff] bg-clip-text text-transparent mb-6">
                            Platform Features
                        </p>

                        <h2 className="text-[52px] md:text-[72px] leading-[0.95] tracking-[-0.05em] font-black text-[#071138] dark:text-white mb-8">

                            Designed for contributors
                            <br />
                            and maintainers

                        </h2>

                        {/* ACCENT LINE */}
                        <div className="flex items-center gap-3 mb-8">

                            <div className="w-12 h-1 rounded-full bg-gradient-to-r from-[#00dc82] to-[#36e4da]" />

                            <div className="w-2 h-2 rounded-full bg-[#00dc82]" />

                        </div>

                        <p className="text-[20px] leading-10 text-[#64748b] dark:text-zinc-400 max-w-3xl">
                            The UI system establishes a consistent design language so contributors can confidently build new pages, dashboards, workflows, and tools.
                        </p>
                    </div>

                    {/* FEATURE GRID */}
                    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8">

                        {[
                            {
                                title: "Version Control",
                                desc: "Create repositories, branches, pull requests, and commits with a modern collaborative workflow.",
                                icon: <GitBranch className="w-7 h-7 text-[#00dc82]" />,
                                color: "#00dc82",
                                bg: "from-[#ecfff7] to-[#f8fffc]",
                                darkBg: "dark:from-[#0b1915] dark:to-[#0f1f1a]",
                            },
                            {
                                title: "AI Workflows",
                                desc: "AI-assisted code reviews, commit summaries, onboarding, and contributor guidance.",
                                icon: <Sparkles className="w-7 h-7 text-[#3b82f6]" />,
                                color: "#3b82f6",
                                bg: "from-[#f2f7ff] to-[#f9fbff]",
                                darkBg: "dark:from-[#0b1524] dark:to-[#101a2c]",
                            },
                            {
                                title: "Team Collaboration",
                                desc: "Built for contributors, maintainers, and open-source teams working together.",
                                icon: <Users className="w-7 h-7 text-[#9333ea]" />,
                                color: "#9333ea",
                                bg: "from-[#faf5ff] to-[#fcfaff]",
                                darkBg: "dark:from-[#171022] dark:to-[#120f1e]",
                            },
                            {
                                title: "Developer First",
                                desc: "Clean APIs, scalable architecture, and a contributor-friendly structure from day one.",
                                icon: <ShieldCheck className="w-7 h-7 text-[#f97316]" />,
                                color: "#f97316",
                                bg: "from-[#fff7f0] to-[#fffaf7]",
                                darkBg: "dark:from-[#21140d] dark:to-[#18110e]",
                            },
                        ].map((feature) => (

                            <div
                                key={feature.title}
                                className={`group relative overflow-hidden rounded-[34px] border border-white/60 dark:border-white/5 bg-gradient-to-br ${feature.bg} ${feature.darkBg} backdrop-blur-xl p-8 shadow-[0_10px_40px_rgba(15,23,42,0.05)] hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(15,23,42,0.12)] transition-all duration-500`}
                            >

                                <div className="absolute inset-0 bg-gradient-to-br from-white/55 via-white/15 to-transparent dark:from-white/6 dark:via-white/0 pointer-events-none" />

                                {/* TOP GLOW */}
                                <div
                                    className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20"
                                    style={{
                                        background: feature.color,
                                    }}
                                />

                                {/* ICON */}
                                <div
                                    className="relative w-20 h-20 rounded-[24px] border border-white/60 flex items-center justify-center shadow-inner mb-10"
                                    style={{
                                        background: `${feature.color}10`,
                                    }}
                                >
                                    {feature.icon}
                                </div>

                                {/* TITLE */}
                                <h3 className="text-[34px] leading-tight tracking-[-0.03em] font-black text-[#071138] dark:text-white mb-4">
                                    {feature.title}
                                </h3>

                                {/* ACCENT */}
                                <div className="flex items-center gap-2 mb-6">

                                    <div
                                        className="w-10 h-1 rounded-full"
                                        style={{
                                            background: feature.color,
                                        }}
                                    />

                                    <div
                                        className="w-2 h-2 rounded-full"
                                        style={{
                                            background: feature.color,
                                        }}
                                    />
                                </div>

                                {/* DESCRIPTION */}
                                <p className="text-[17px] leading-9 text-[#64748b] dark:text-zinc-400 relative z-10">
                                    {feature.desc}
                                </p>

                                {/* BOTTOM CURVE */}
                                <svg
                                    className="absolute bottom-0 left-0 opacity-20"
                                    width="320"
                                    height="90"
                                    viewBox="0 0 320 90"
                                    fill="none"
                                >
                                    <path
                                        d="M0 30C80 100 180 0 320 70"
                                        stroke={feature.color}
                                        strokeWidth="2"
                                    />
                                </svg>

                                {/* FLOATING DOT */}
                                <div
                                    className="absolute bottom-6 right-6 w-6 h-6 rounded-full flex items-center justify-center"
                                    style={{
                                        background: `${feature.color}20`,
                                    }}
                                >
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{
                                            background: feature.color,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            {/* Contributor CTA */}
            <section
                id="contributors"
                className="relative py-32 overflow-hidden border-t border-[#dce7e3] dark:border-white/5 bg-[#f7faf9] dark:bg-[#080b11]"
            >

                {/* BACKGROUND EFFECTS */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">

                    {/* MAIN GLOW */}
                    <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-r from-[#00dc82]/10 to-[#4fd1ff]/10 blur-3xl rounded-full" />

                    {/* LEFT BLOB */}
                    <div className="absolute left-[-120px] top-28 w-[320px] h-[320px] rounded-full bg-gradient-to-br from-[#a7f3d0]/40 to-[#d9f99d]/20 blur-2xl" />

                    {/* SMALL FLOATING CIRCLE */}
                    <div className="absolute left-[14%] bottom-24 w-14 h-14 rounded-full bg-gradient-to-br from-[#d9f99d]/70 to-[#bef264]/40 blur-sm border border-white/40" />

                    {/* RIGHT CODE ICON GLOW */}
                    <div className="absolute right-[8%] top-[26%] w-[260px] h-[260px] rounded-full bg-gradient-to-br from-[#00dc82]/20 to-[#fde047]/20 blur-3xl" />

                    {/* DOT GRID */}
                    <div className="absolute top-16 right-[12%] grid grid-cols-5 gap-5 opacity-20">
                        {Array.from({ length: 25 }).map((_, i) => (
                            <div
                                key={i}
                                className="w-1.5 h-1.5 rounded-full bg-[#00dc82]"
                            />
                        ))}
                    </div>

                    {/* LEFT CURVE */}
                    <svg
                        className="absolute left-0 bottom-10 opacity-30"
                        width="420"
                        height="180"
                        viewBox="0 0 420 180"
                        fill="none"
                    >
                        <path
                            d="M0 40C120 120 180 0 300 90C350 130 390 110 420 60"
                            stroke="url(#curveLeft)"
                            strokeWidth="2"
                        />

                        <defs>
                            <linearGradient id="curveLeft" x1="0" y1="0" x2="420" y2="0">
                                <stop stopColor="#4fd1ff" />
                                <stop offset="1" stopColor="#00dc82" />
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* RIGHT CURVE */}
                    <svg
                        className="absolute right-0 top-36 opacity-30"
                        width="420"
                        height="220"
                        viewBox="0 0 420 220"
                        fill="none"
                    >
                        <path
                            d="M0 120C120 20 240 220 420 60"
                            stroke="url(#curveRight)"
                            strokeWidth="2"
                        />

                        <defs>
                            <linearGradient id="curveRight" x1="0" y1="0" x2="420" y2="0">
                                <stop stopColor="#fde047" />
                                <stop offset="1" stopColor="#00dc82" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">

                    {/* MAIN CARD */}
                    <div className="relative overflow-hidden rounded-[42px] border border-[#b8f0dd] bg-gradient-to-br from-white via-[#f7fffc] to-[#f4fffb] dark:from-[#11151d] dark:to-[#0c1017] shadow-[0_20px_80px_rgba(16,185,129,0.08)] px-8 md:px-16 py-20 text-center">

                        {/* FLOATING CODE CARD */}
                        <div className="hidden lg:flex absolute right-16 top-24 w-[140px] h-[140px] rounded-[36px] border border-white/60 bg-white/60 backdrop-blur-xl shadow-[0_20px_60px_rgba(16,185,129,0.15)] items-center justify-center rotate-[16deg]">

                            <div className="absolute inset-0 rounded-[36px] bg-gradient-to-br from-[#00dc82]/10 to-[#4fd1ff]/10" />

                            <div className="relative text-6xl font-black bg-gradient-to-r from-[#00dc82] to-[#4fd1ff] bg-clip-text text-transparent">
                                {"</>"}
                            </div>
                        </div>

                        {/* TOP BADGE */}
                        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-[#b8f0dd] bg-white/70 backdrop-blur-xl shadow-sm mb-10">

                            <Users className="w-5 h-5 text-[#00b86b]" />

                            <span className="text-[15px] font-bold tracking-[0.18em] uppercase bg-gradient-to-r from-[#00b86b] to-[#4fd1ff] bg-clip-text text-transparent">
                                Open Source Collaboration
                            </span>
                        </div>

                        {/* TITLE */}
                        <h2 className="text-[52px] md:text-[82px] leading-[0.95] tracking-[-0.06em] font-black text-[#071138] dark:text-white mb-8">

                            Build{" "}

                            <span className="bg-gradient-to-r from-[#00dc82] via-[#22c55e] to-[#4fd1ff] bg-clip-text text-transparent">
                                GitNest
                            </span>

                            {" "}together

                        </h2>

                        {/* DESCRIPTION */}
                        <p className="text-[22px] leading-[2.1rem] text-[#64748b] dark:text-zinc-400 max-w-4xl mx-auto mb-14">
                            This homepage establishes the design system, visual hierarchy, spacing patterns, component styling, and interaction language for the entire frontend ecosystem.
                        </p>

                        {/* BUTTONS */}
                        <div className="flex flex-wrap justify-center gap-6">

                            {/* PRIMARY BTN */}
                            <Link
                                to="/register"
                                className="group px-10 py-5 rounded-[22px] bg-gradient-to-r from-[#00b86b] via-[#00dc82] to-[#7bf542] text-white font-bold text-[18px] shadow-[0_15px_40px_rgba(16,185,129,0.25)] hover:scale-[1.03] transition-all duration-300 flex items-center gap-4"
                            >

                                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />

                                Contribute Now

                            </Link>

                            {/* SECONDARY BTN */}
                            <button className="group px-10 py-5 rounded-[22px] border border-[#dbe7e2] bg-white/80 backdrop-blur-xl text-[#0f172a] font-semibold text-[18px] hover:border-[#00dc82]/40 hover:bg-white transition-all duration-300 flex items-center gap-4 shadow-sm">

                                <ShieldCheck className="w-5 h-5 text-[#00b86b]" />

                                Read Contribution Guide

                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative overflow-hidden border-t border-[#dce7e3] bg-[#f8fbfa] dark:bg-[#080b11] py-20">

                {/* BACKGROUND EFFECTS */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">

                    {/* TOP GRADIENT */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[220px] bg-gradient-to-r from-[#00dc82]/10 via-[#4fd1ff]/10 to-[#d9f99d]/10 blur-3xl rounded-full" />

                    {/* LEFT GLOW */}
                    <div className="absolute left-[-80px] bottom-0 w-[240px] h-60 bg-[#4fd1ff]/10 blur-3xl rounded-full" />

                    {/* RIGHT GLOW */}
                    <div className="absolute right-[-80px] top-0 w-[240px] h-60 bg-[#00dc82]/10 blur-3xl rounded-full" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6">

                    {/* MAIN GRID */}
                    <div className="grid md:grid-cols-4 gap-16">

                        {/* BRAND */}
                        <div>

                            <div className="flex items-center gap-4 mb-7">

                                {/* LOGO */}
                                <div className="w-14 h-14 rounded-[20px] bg-white border border-[#e4ece8] shadow-[0_10px_30px_rgba(15,23,42,0.06)] flex items-center justify-center overflow-hidden p-2">

                                    <img
                                        src={logo}
                                        alt="GitNest Logo"
                                        className="w-full h-full object-contain"
                                    />
                                </div>

                                {/* TITLE */}
                                <div>
                                    <h3 className="font-black text-[34px] leading-none tracking-[-0.05em] text-[#071138] dark:text-white">
                                        Git<span className="text-[#00c97b]">Nest</span>
                                    </h3>

                                    <p className="text-[12px] uppercase tracking-[0.24em] text-[#7c8aa5] font-medium mt-1">
                                        Open Source Platform
                                    </p>
                                </div>
                            </div>

                            {/* DESCRIPTION */}
                            <p className="text-[17px] leading-9 text-[#64748b] max-w-sm mb-8">
                                A modern collaborative development platform inspired by GitHub and built for open source communities worldwide.
                            </p>

                            {/* COPYRIGHT */}
                            <p className="text-[15px] text-[#7c8aa5] leading-7">
                                © 2026 GitNest. Built for open-source collaboration.
                            </p>
                        </div>

                        {/* PLATFORM */}
                        <div>

                            <h4 className="text-[28px] font-black tracking-[-0.04em] text-[#071138] dark:text-white mb-8">
                                Platform
                            </h4>

                            <div className="space-y-5">

                                {[
                                    "Repositories",
                                    "Pull Requests",
                                    "AI Workflows",
                                    "Discussions",
                                ].map((item) => (
                                    <a
                                        key={item}
                                        href="#"
                                        className="group flex items-center gap-3 text-[17px] text-[#475569] hover:text-[#00b86b] transition-all duration-300"
                                    >

                                        <div className="w-2 h-2 rounded-full bg-[#00c97b] group-hover:scale-150 transition-transform" />

                                        {item}

                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* DEVELOPERS */}
                        <div>

                            <h4 className="text-[28px] font-black tracking-[-0.04em] text-[#071138] dark:text-white mb-8">
                                Developers
                            </h4>

                            <div className="space-y-5">

                                {[
                                    "Contribution Guide",
                                    "Roadmap",
                                    "API Docs",
                                    "Architecture",
                                ].map((item) => (
                                    <a
                                        key={item}
                                        href="#"
                                        className="group flex items-center gap-3 text-[17px] text-[#475569] hover:text-[#00b86b] transition-all duration-300"
                                    >

                                        <div className="w-2 h-2 rounded-full bg-[#00c97b] group-hover:scale-150 transition-transform" />

                                        {item}

                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* TECH STACK */}
                        <div>

                            <h4 className="text-[28px] font-black tracking-[-0.04em] text-[#071138] dark:text-white mb-8">
                                Tech Stack
                            </h4>

                            <div className="flex flex-wrap gap-2">

                                {[
                                    "React",
                                    "Tailwind",
                                    "Node.js",
                                    "MongoDB",
                                    "Express",
                                    "Socket.io",
                                    "JWT",
                                    "AI",
                                ].map((tech) => (
                                    <div
                                        key={tech}
                                        className="px-5 py-3 rounded-2xl border border-[#e6ece9] bg-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-[15px] font-medium text-[#334155] flex items-center gap-3"
                                    >

                                        <div className="w-2 h-2 rounded-full bg-[#00c97b]" />

                                        {tech}

                                    </div>
                                ))}
                            </div>

                        </div>

                        {/* LEGAL */}
                        <div>

                            <h4 className="text-[28px] font-black tracking-[-0.04em] text-[#071138] dark:text-white mb-8">
                                Legal
                            </h4>

                            <div className="space-y-5">

                                <Link
                                    to="/terms"
                                    className="group flex items-center gap-3 text-[17px] text-[#475569] hover:text-[#00b86b] transition-all duration-300"
                                >

                                    <div className="w-2 h-2 rounded-full bg-[#00c97b] group-hover:scale-150 transition-transform" />

                                    Terms & Conditions

                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>

    );
};
