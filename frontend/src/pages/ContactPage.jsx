import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useToastStore } from "../store/useToastStore";
import { useThemeStore } from '../store/useThemeStore';
import {
    ArrowRight,
    Sun,
    Moon,
    Menu, X
} from "lucide-react";
import { Link } from 'react-router-dom';
import logo from "../assets/logo.png";
import { motion, AnimatePresence } from "framer-motion";

export default function ContactPage() {

    const [activeLink, setActiveLink] = useState(() => {
        if (typeof window !== "undefined" && window.location.hash) {
            return window.location.hash;
        }

        return "#home";
    });
    const { isDarkMode, toggleTheme } = useThemeStore();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const addToast = useToastStore((s) => s.addToast);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const navLinks = [
        { name: "Home", href: "/#home" },
        { name: "Features", href: "/#features" },
        { name: "Contributors", href: "/#contributors" },
    ];

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const { name, email, subject, message } = formData;

        if (!name || !email || !subject || !message) {
            addToast({
                message: "Please fill all fields",
                type: "error",
            });
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            addToast({
                message: "Please enter a valid email",
                type: "error",
            });
            return;
        }

        addToast({
            message: "Message sent successfully!",
            type: "success",
        });

        setFormData({
            name: "",
            email: "",
            subject: "",
            message: "",
        });
    };

    return (
        <div className="min-h-screen bg-[#f6f8f7] dark:bg-[#07090d] text-zinc-900 dark:text-white transition-colors">

            {/* NAVBAR */}
            <header className="fixed top-4 inset-x-0 z-50 px-3 md:px-6">
                <div className="max-w-7xl mx-auto h-16 md:h-20 rounded-[24px] md:rounded-[28px] border border-white/50 dark:border-white/10 bg-white/75 dark:bg-[#0c0f14]/70 backdrop-blur-2xl shadow-2xl flex items-center justify-between px-6">

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
                                className={`absolute top-1 w-10 h-10 rounded-full bg-gradient-to-br from-[#00dc82] to-cyan-400 transition-all duration-500 shadow-lg ${isDarkMode ? "translate-x-[40px]" : "translate-x-0"
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
                            className="hidden md:flex px-6 py-3 rounded-2xl border border-zinc-200 dark:border-white/20 bg-white/70 dark:bg-white/[0.03] backdrop-blur-xl text-zinc-700 dark:text-zinc-300 font-medium transition-colors"
                        >
                            Documentation
                        </Link>

                        <Link
                            to="/register"
                            className="hidden lg:flex group px-5 rounded-2xl bg-gradient-to-r from-[#00dc82] via-[#2be4da] to-[#4fd1ff] text-black font-bold shadow-[0_10px_40px_rgba(0,220,130,0.3)] hover:shadow-[0_10px_60px_rgba(0,220,130,0.4)] transition-shadow items-center gap-2"
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

            <section className="relative pt-36 pb-24 px-6">

                {/* Background Glow */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle,rgba(0,220,130,0.12),transparent_60%)] blur-3xl" />
                </div>

                <div className="max-w-7xl mx-auto">

                    {/* Heading */}
                    <motion.div
                        className="text-center mb-20"
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                        <span className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-[#00dc82]/20 bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl text-[#00dc82] font-medium text-sm">
                            Contact GitNest
                        </span>

                        <h1 className="mt-8 text-5xl md:text-7xl font-black leading-tight">
                            Let's Build
                            <span className="block bg-gradient-to-r from-[#00dc82] via-[#36e4da] to-[#4fd1ff] bg-clip-text text-transparent">
                                Together
                            </span>
                        </h1>

                        <p className="max-w-2xl mx-auto mt-6 text-lg text-zinc-600 dark:text-zinc-400">
                            Have questions, suggestions, or want to contribute?
                            We'd love to hear from you.
                        </p>
                    </motion.div>

                    <div className="grid lg:grid-cols-2 gap-10">

                        {/* Contact Info */}
                        <motion.div
                            className="space-y-6"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={{
                                hidden: {},
                                visible: {
                                    transition: {
                                        staggerChildren: 0.15,
                                    },
                                },
                            }}
                        >

                            <motion.div
                                variants={{
                                    hidden: { opacity: 0, x: -40 },
                                    visible: { opacity: 1, x: 0 },
                                }}
                                transition={{ duration: 0.5 }}
                                whileHover={{
                                    y: -8,
                                    scale: 1.02,
                                }}
                                className="rounded-[32px] border border-zinc-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-xl p-8"
                            >
                                <Mail className="w-8 h-8 text-[#00dc82] mb-4" />
                                <h3 className="text-2xl font-bold mb-2">Email Us</h3>
                                <p className="text-zinc-600 dark:text-zinc-400">
                                    support@gitnest.dev
                                </p>
                            </motion.div>

                            <motion.div
                                variants={{
                                    hidden: { opacity: 0, x: -40 },
                                    visible: { opacity: 1, x: 0 },
                                }}
                                transition={{ duration: 0.5 }}
                                whileHover={{
                                    y: -8,
                                    scale: 1.02,
                                }}
                                className="rounded-[32px] border border-zinc-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-xl p-8"
                            >
                                <Phone className="w-8 h-8 text-[#00dc82] mb-4" />
                                <h3 className="text-2xl font-bold mb-2">Call Us</h3>
                                <p className="text-zinc-600 dark:text-zinc-400">
                                    +91 98765 43210
                                </p>
                            </motion.div>

                            <motion.div
                                variants={{
                                    hidden: { opacity: 0, x: -40 },
                                    visible: { opacity: 1, x: 0 },
                                }}
                                transition={{ duration: 0.5 }}
                                whileHover={{
                                    y: -8,
                                    scale: 1.02,
                                }}
                                className="rounded-[32px] border border-zinc-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-xl p-8"
                            >
                                <MapPin className="w-8 h-8 text-[#00dc82] mb-4" />
                                <h3 className="text-2xl font-bold mb-2">Location</h3>
                                <p className="text-zinc-600 dark:text-zinc-400">
                                    Open Source Community Worldwide
                                </p>
                            </motion.div>

                        </motion.div>

                        {/* Form */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                            className="rounded-[36px] border border-zinc-200 dark:border-white/10 bg-white/70 dark:bg-[#0f131a]/80 backdrop-blur-2xl p-8 md:p-10 shadow-xl"
                        >

                            <h2 className="text-3xl font-black mb-8">
                                Send us a message
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-5">

                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Your Name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-5 py-4 outline-none text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:border-emerald-400 transition-colors"
                                />

                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Your Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-5 py-4 outline-none text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:border-emerald-400 transition-colors"
                                />

                                <input
                                    type="text"
                                    name="subject"
                                    placeholder="Subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-5 py-4 outline-none text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:border-emerald-400 transition-colors"
                                />

                                <textarea
                                    rows="6"
                                    name="message"
                                    placeholder="Write your message..."
                                    value={formData.message}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-5 py-4 outline-none resize-none text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:border-emerald-400 transition-colors"
                                />

                                <motion.button
                                    type="submit"
                                    whileHover={{
                                        scale: 1.03,
                                    }}

                                    whileTap={{
                                        scale: 0.97,
                                    }}
                                    className="group w-full py-4 rounded-2xl bg-gradient-to-r from-[#00dc82] via-[#2be4da] to-[#4fd1ff] text-black font-bold flex items-center justify-center gap-3 hover:shadow-[0_15px_50px_rgba(0,220,130,0.3)] transition-shadow"
                                >
                                    Send Message
                                    <Send className="w-5 h-5" />
                                </motion.button>

                            </form>
                        </motion.div>

                    </div>
                </div>
            </section>
        </div>
    );
}
