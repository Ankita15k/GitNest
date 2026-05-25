import { useState } from "react";
import { useThemeStore } from '../store/useThemeStore';
import {
    ShieldCheck,
    ArrowRight,
    Sun,
    Moon,
    Lock,
    FileText,
    CheckCircle2,
    Database,
    Eye,
    Menu,
    X,
} from "lucide-react";
import { Link } from 'react-router-dom';
import logo from "../assets/logo.png";
import { motion, AnimatePresence } from "framer-motion";
import "../App.css";

export default function GitNestPrivacy() {
    const { isDarkMode, toggleTheme } = useThemeStore();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeLink, setActiveLink] = useState(() => {
        if (typeof window !== "undefined" && window.location.hash) {
            return window.location.hash;
        }

        return "#home";
    });

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Features", href: "/#features" },
        { name: "Contributors", href: "/#contributors" },
    ];

    const lastUpdated = "May 24, 2026";

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#f6f8f7] dark:bg-[#07090d] text-zinc-900 dark:text-white transition-colors font-sans">

            {/* BACKGROUND */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-[radial-gradient(circle,rgba(0,220,130,0.12),transparent_60%)] blur-3xl" />
                <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-400/10 blur-3xl" />
                <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.08]"
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
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.25 }}
                        className="lg:hidden absolute top-[88px] left-3 right-3 rounded-3xl border border-white/10 bg-white/95 dark:bg-[#0c0f14]/95 backdrop-blur-2xl shadow-2xl p-6 z-50"
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
                )}
            </AnimatePresence>


            {/* PAGE HEADER */}
            <section className="relative pt-44 pb-12">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-[#00dc82]/20 bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl text-[#00b86b] shadow-sm mb-8">
                        <Lock className="w-4 h-4" />
                        <span className="text-sm font-bold tracking-[0.1em] uppercase">
                            Privacy & Security
                        </span>
                    </div>

                    <h1 className="text-[42px] md:text-[60px] leading-[1] font-black mb-6 text-[#071138] dark:text-white tracking-tight">
                        Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00dc82] to-[#4fd1ff]">Policy</span>
                    </h1>

                    <p className="text-[18px] text-zinc-500 dark:text-zinc-400 flex items-center justify-center gap-2">
                        <FileText className="w-5 h-5" />
                        Last Updated: {lastUpdated}
                    </p>
                </div>
            </section>

            {/* CONTENT CARD */}
            <section className="relative pb-32">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="relative overflow-hidden rounded-[42px] border border-[#b8f0dd] dark:border-white/10 bg-gradient-to-br from-white via-[#f7fffc] to-[#f4fffb] dark:bg-none dark:bg-black shadow-[0_20px_80px_rgba(16,185,129,0.08)] dark:shadow-none px-8 md:px-16 py-16">

                        {/* GLOW DECORATION */}
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#00dc82]/5 blur-[100px] rounded-full pointer-events-none dark:hidden" />

                        <div className="relative z-10 prose prose-lg dark:prose-invert prose-zinc max-w-none">

                            <h2 className="text-[28px] font-black text-[#071138] dark:text-white mt-0 mb-6 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-[#00dc82]/10 flex items-center justify-center text-[#00dc82]">
                                    <Database className="w-4 h-4" />
                                </div>
                                Information We Collect
                            </h2>
                            <p className="text-[17px] leading-8 text-[#64748b] dark:text-zinc-300 mb-4">
                                At GitNest, we believe in transparency. We only collect the information necessary to provide you with a seamless collaborative development experience. The types of data we collect include:
                            </p>
                            <ul className="list-none space-y-3 mb-10 text-[17px] text-[#64748b] dark:text-zinc-300">
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-6 h-6 text-[#00dc82] shrink-0 mt-1" />
                                    <span><strong>Account Information:</strong> Your name, email address, username, and authentication credentials when you register.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-6 h-6 text-[#00dc82] shrink-0 mt-1" />
                                    <span><strong>Repository Data:</strong> Code, commits, issues, pull requests, and comments you submit to the platform.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-6 h-6 text-[#00dc82] shrink-0 mt-1" />
                                    <span><strong>Usage Metrics:</strong> Anonymous telemetry data regarding how you interact with our AI workflows and UI features to help us improve the platform.</span>
                                </li>
                            </ul>

                            <h2 className="text-[28px] font-black text-[#071138] dark:text-white mb-6 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-[#4fd1ff]/10 flex items-center justify-center text-[#4fd1ff]">
                                    <Eye className="w-4 h-4" />
                                </div>
                                How We Use Your Information
                            </h2>
                            <p className="text-[17px] leading-8 text-[#64748b] dark:text-zinc-300 mb-10">
                                The information we collect is strictly used to operate, maintain, and enhance the GitNest platform. Your repository data is processed to enable version control features, facilitate collaboration, and power our AI-assisted code reviews. We do not sell your personal data or your proprietary code to third parties. Public repositories are visible to anyone on the internet, while private repositories are securely isolated and accessible only to authorized collaborators.
                            </p>

                            <h2 className="text-[28px] font-black text-[#071138] dark:text-white mb-6 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-violet-400/10 flex items-center justify-center text-violet-400">
                                    <ShieldCheck className="w-4 h-4" />
                                </div>
                                Data Security
                            </h2>
                            <p className="text-[17px] leading-8 text-[#64748b] dark:text-zinc-300 mb-10">
                                We implement robust, industry-standard security measures to protect your data. All data transmitted between your browser and GitNest is encrypted using SSL/TLS protocols. Code repositories and sensitive credentials are encrypted at rest. While we strive to use commercially acceptable means to protect your Personal Information, remember that no method of transmission over the Internet is 100% secure.
                            </p>

                            <h2 className="text-[28px] font-black text-[#071138] dark:text-white mb-6 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-400">
                                    <Lock className="w-4 h-4" />
                                </div>
                                Your Data Rights
                            </h2>
                            <p className="text-[17px] leading-8 text-[#64748b] dark:text-zinc-300 mb-4">
                                You maintain full control over your personal data. Depending on your location, you have the right to:
                            </p>
                            <ul className="list-none space-y-3 mb-10 text-[17px] text-[#64748b] dark:text-zinc-300">
                                <li className="flex items-start gap-3">
                                    <ShieldCheck className="w-6 h-6 text-[#00dc82] shrink-0 mt-1" />
                                    <span>Access, update, or delete the personal information we have on you.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <ShieldCheck className="w-6 h-6 text-[#00dc82] shrink-0 mt-1" />
                                    <span>Export your repository data and account history at any time.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <ShieldCheck className="w-6 h-6 text-[#00dc82] shrink-0 mt-1" />
                                    <span>Opt-out of optional telemetry and AI training data collection through your user settings.</span>
                                </li>
                            </ul>

                            <hr className="border-t border-zinc-200 dark:border-white/10 my-10" />

                            <p className="text-[16px] text-zinc-500 italic text-center">
                                If you have any privacy-related concerns or wish to exercise your data rights, please contact our Data Protection Officer at privacy@gitnest.com.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="relative overflow-hidden border-t border-[#dce7e3] dark:border-white/10 bg-[#f8fbfa] dark:bg-[#080b11] py-20">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[220px] bg-gradient-to-r from-[#00dc82]/10 via-[#4fd1ff]/10 to-[#d9f99d]/10 blur-3xl rounded-full" />
                    <div className="absolute left-[-80px] bottom-0 w-[240px] h-60 bg-[#4fd1ff]/10 blur-3xl rounded-full" />
                    <div className="absolute right-[-80px] top-0 w-[240px] h-60 bg-[#00dc82]/10 blur-3xl rounded-full" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-16">
                        {/* BRAND */}
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-4 mb-7">
                                <div className="w-14 h-14 rounded-[20px] bg-white border border-[#e4ece8] dark:border-white/10 shadow-[0_10px_30px_rgba(15,23,42,0.06)] flex items-center justify-center overflow-hidden p-2">
                                    <img src={logo} alt="GitNest Logo" className="w-full h-full object-contain" />
                                </div>
                                <div>
                                    <h3 className="font-black text-[34px] leading-none tracking-[-0.05em] text-[#071138] dark:text-white">
                                        Git<span className="text-[#00c97b]">Nest</span>
                                    </h3>
                                    <p className="text-[12px] uppercase tracking-[0.24em] text-[#7c8aa5] font-medium mt-1">
                                        Open Source Platform
                                    </p>
                                </div>
                            </div>
                            <p className="text-[17px] leading-9 text-[#64748b] dark:text-zinc-400 max-w-sm mb-8">
                                A modern collaborative development platform inspired by GitHub and built for open source communities worldwide.
                            </p>
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
                                    <a key={item} href="#" className="group flex items-center gap-3 text-[17px] text-[#475569] dark:text-zinc-400 hover:text-[#00b86b] dark:hover:text-[#00dc82] transition-all duration-300">
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
                                    <a key={item} href="#" className="group flex items-center gap-3 text-[17px] text-[#475569] dark:text-zinc-400 hover:text-[#00b86b] dark:hover:text-[#00dc82] transition-all duration-300">
                                        <div className="w-2 h-2 rounded-full bg-[#00c97b] group-hover:scale-150 transition-transform" />
                                        {item}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}