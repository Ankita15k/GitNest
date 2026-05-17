
    import {
        GitBranch,
        GitPullRequest,
        FolderGit2,
        ShieldCheck,
        Code2,
        Sparkles,
        Users,
        Workflow,
        Star,
        ArrowRight,
    } from "lucide-react";

    export default function GitNestHomepage() {
        const features = [
            {
                title: "Version Control",
                desc: "Create repositories, branches, pull requests, and commits with a modern collaborative workflow.",
                icon: <GitBranch className="w-7 h-7 text-emerald-400" />,
            },
            {
                title: "AI Workflows",
                desc: "AI-assisted code reviews, commit summaries, onboarding, and contributor guidance.",
                icon: <Sparkles className="w-7 h-7 text-emerald-400" />,
            },
            {
                title: "Team Collaboration",
                desc: "Built for contributors, maintainers, and open-source teams working together.",
                icon: <Users className="w-7 h-7 text-emerald-400" />,
            },
            {
                title: "Developer First",
                desc: "Clean APIs, scalable architecture, and a contributor-friendly structure from day one.",
                icon: <ShieldCheck className="w-7 h-7 text-emerald-400" />,
            },
        ];

        const stats = [
            { value: "MERN", label: "Full Stack" },
            { value: "AI", label: "Developer Workflows" },
            { value: "OSS", label: "Open Source" },
            { value: "GSSoC", label: "Community Driven" },
        ];

        return (
            <div className="min-h-screen bg-white dark:bg-[#06070a] text-zinc-900 dark:text-white transition-colors overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/5 dark:bg-emerald-500/10 blur-[120px] rounded-full" />
                    <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full" />
                </div>

                {/* Navbar */}
                <header className="sticky top-0 z-50 border-b border-zinc-200 dark:border-white/5 backdrop-blur-xl bg-white/80 dark:bg-[#06070a]/80 transition-colors">
                    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-3 cursor-pointer select-none">
                            <div className="w-11 h-11 rounded-2xl bg-zinc-100 dark:bg-white flex items-center justify-center overflow-hidden shadow-2xl shadow-emerald-500/20 border border-zinc-200 dark:border-white/10 p-1">
                                <img
                                    src="./logo.png"
                                    alt="GitNest Logo"
                                    className="w-full h-full object-contain"
                                />
                            </div>

                            <div>
                                <h1 className="text-xl font-black tracking-tight">
                                    Git<span className="text-emerald-400">Nest</span>
                                </h1>
                                <p className="text-[10px] text-zinc-500 tracking-[0.25em] uppercase">
                                    Collaborative Development
                                </p>
                            </div>
                        </div>

                        <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-600 dark:text-zinc-400">
                            <a href="#features" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                                Features
                            </a>
                            <a href="#workflow" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                                Workflow
                            </a>
                            <a href="#opensource" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                                Open Source
                            </a>
                            <a href="#contributors" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                                Contributors
                            </a>
                        </nav>

                        <div className="flex items-center gap-3">
                            <button className="hidden sm:flex px-4 py-2 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.03] text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition-all">
                                Documentation
                            </button>

                            <button className="px-5 py-2 rounded-xl bg-emerald-400 text-black font-semibold text-sm hover:scale-[1.02] transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2">
                                Start Contributing
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Hero */}
                <section className="relative">
                    <div className="max-w-7xl mx-auto px-6 pt-28 pb-24 grid lg:grid-cols-2 gap-16 items-center">
                        {/* Left */}
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 text-emerald-300 text-sm mb-8">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                Open Source • GSSoC 2026
                            </div>

                            <h1 className="text-5xl md:text-7xl font-black leading-none tracking-tight mb-8">
                                Build the future of
                                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-400">
                                    collaborative coding
                                </span>
                            </h1>

                            <p className="text-lg text-zinc-400 leading-8 max-w-2xl mb-10">
                                GitNest is a full-featured GitHub-inspired platform built with the MERN stack. Create repositories, browse code, manage issues, review pull requests, and collaborate — all in one open-source developer ecosystem.
                            </p>

                            <div className="flex flex-wrap gap-4 mb-14">
                                <button className="px-7 py-4 rounded-2xl bg-emerald-400 text-black font-semibold hover:scale-[1.02] transition-all shadow-xl shadow-emerald-500/20">
                                    Explore Repositories
                                </button>

                                <button className="px-7 py-4 rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.03] text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition-all">
                                    View Architecture
                                </button>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                                {stats.map((item) => (
                                    <div
                                        key={item.label}
                                        className="rounded-2xl border border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-white/[0.03] p-5"
                                    >
                                        <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-1">
                                            {item.value}
                                        </h3>
                                        <p className="text-sm text-zinc-500">{item.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 blur-3xl rounded-full" />

                            <div className="relative rounded-3xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#0d1016]/80 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/40">
                                {/* Window Header */}
                                <div className="h-14 border-b border-zinc-200 dark:border-white/5 flex items-center justify-between px-6 bg-zinc-100 dark:bg-white/[0.02]">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-400" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                        <div className="w-3 h-3 rounded-full bg-emerald-400" />
                                    </div>

                                    <div className="text-xs text-zinc-500 tracking-widest uppercase">
                                        GitNest Dashboard
                                    </div>
                                </div>

                                {/* Dashboard Preview */}
                                <div className="p-6 space-y-5">
                                    <div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/5 p-5">
                                        <div className="flex items-center justify-between mb-5">
                                            <div>
                                                <h3 className="font-bold text-lg">gitnest-core</h3>
                                                <p className="text-sm text-zinc-500 mt-1">
                                                    GitHub-inspired repository management with pull requests, issues, branching, and AI-powered workflows
                                                </p>
                                            </div>

                                            <div className="px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 text-xs">
                                                Public
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="absolute top-5 right-5 w-32 h-32 bg-emerald-400/10 blur-3xl rounded-full" />
                                            <div className="rounded-xl border border-white/5 bg-black/20 p-4">
                                                <div className="text-2xl font-black">42</div>
                                                <div className="text-xs text-zinc-500 mt-1">Stars</div>
                                            </div>

                                            <div className="rounded-xl border border-white/5 bg-black/20 p-4">
                                                <div className="text-2xl font-black">18</div>
                                                <div className="text-xs text-zinc-500 mt-1">PRs</div>
                                            </div>

                                            <div className="rounded-xl border border-white/5 bg-black/20 p-4">
                                                <div className="text-2xl font-black">9</div>
                                                <div className="text-xs text-zinc-500 mt-1">Contributors</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {[
                                            "feat(auth): add JWT authentication flow",
                                            "fix(ui): resolve repository sidebar overflow",
                                            "feat(ai): integrate PR review assistant",
                                            "docs: add contributor onboarding guide",
                                        ].map((item) => (
                                            <div
                                                key={item}
                                                className="flex items-center justify-between rounded-xl border border-zinc-200 dark:border-white/5 bg-zinc-100 dark:bg-white/[0.02] px-4 py-3"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                                                    <p className="text-sm text-zinc-300 truncate">{item}</p>
                                                </div>

                                                <span className="text-xs text-zinc-600">2h ago</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section id="features" className="relative py-28 border-t border-zinc-200 dark:border-white/5">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="max-w-3xl mb-16">
                            <p className="text-emerald-400 text-sm font-semibold tracking-widest uppercase mb-4">
                                Platform Features
                            </p>

                            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
                                Designed for contributors and maintainers
                            </h2>

                            <p className="text-zinc-400 text-lg leading-8">
                                The UI system establishes a consistent design language so contributors
                                can confidently build new pages, dashboards, workflows, and tools.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
                            {features.map((feature) => (
                                <div
                                    key={feature.title}
                                    className="group rounded-3xl border border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-white/[0.03] p-7 hover:border-emerald-400/20 hover:bg-zinc-100 dark:hover:bg-white/[0.05] transition-all duration-300"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-emerald-400/10 border border-emerald-400/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        {feature.icon}
                                    </div>

                                    <h3 className="text-xl font-bold mb-4">{feature.title}</h3>

                                    <p className="text-zinc-400 leading-7 text-sm">
                                        {feature.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Contributor CTA */}
                <section
                    id="contributors"
                    className="relative py-28 border-t border-zinc-200 dark:border-white/5"
                >
                    <div className="max-w-5xl mx-auto px-6 text-center">
                        <div className="rounded-[2rem] border border-zinc-200 dark:border-white/5 bg-gradient-to-br from-emerald-400/10 to-cyan-500/5 p-14 overflow-hidden relative">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_50%)]" />

                            <div className="relative z-10">
                                <p className="text-emerald-400 font-semibold tracking-widest uppercase text-sm mb-5">
                                    Open Source Collaboration
                                </p>

                                <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
                                    Build GitNest together
                                </h2>

                                <p className="text-zinc-400 text-lg leading-8 max-w-3xl mx-auto mb-10">
                                    This homepage establishes the design system, visual hierarchy,
                                    spacing patterns, component styling, and interaction language for
                                    the entire frontend ecosystem.
                                </p>

                                <div className="flex flex-wrap justify-center gap-4">
                                    <button className="px-7 py-4 rounded-2xl bg-emerald-400 text-black font-semibold hover:scale-[1.02] transition-all shadow-xl shadow-emerald-500/20">
                                        Contribute Now
                                    </button>

                                    <button className="px-7 py-4 rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.03] text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition-all">
                                        Read Contribution Guide
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-zinc-200 dark:border-white/5 py-14">
                    <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12">
                        <div>
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-11 h-11 rounded-2xl bg-zinc-100 dark:bg-white flex items-center justify-center overflow-hidden border border-zinc-200 dark:border-white/10 p-1">
                                    <img
                                        src="/logo.png"
                                        alt="GitNest Logo"
                                        className="w-full h-full object-contain"
                                    />
                                </div>

                                <div>
                                    <h3 className="font-black text-xl tracking-tight text-zinc-900 dark:text-white">
                                        Git<span className="text-emerald-400">Nest</span>
                                    </h3>
                                    <p className="text-xs text-zinc-500 uppercase tracking-[0.25em]">
                                        Open Source Platform
                                    </p>
                                </div>
                            </div>

                            <p className="text-sm text-zinc-500 leading-7 max-w-sm">
                                A modern collaborative development platform inspired by GitHub and
                                built for contributors, maintainers, and developer communities.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-5">Platform</h4>

                            <div className="space-y-3 text-sm text-zinc-500">
                                <a href="#" className="block hover:text-white transition-colors">
                                    Repositories
                                </a>
                                <a href="#" className="block hover:text-white transition-colors">
                                    Pull Requests
                                </a>
                                <a href="#" className="block hover:text-white transition-colors">
                                    AI Workflows
                                </a>
                                <a href="#" className="block hover:text-white transition-colors">
                                    Discussions
                                </a>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-5">Developers</h4>

                            <div className="space-y-3 text-sm text-zinc-500">
                                <a href="#" className="block hover:text-white transition-colors">
                                    Contribution Guide
                                </a>
                                <a href="#" className="block hover:text-white transition-colors">
                                    Roadmap
                                </a>
                                <a href="#" className="block hover:text-white transition-colors">
                                    API Docs
                                </a>
                                <a href="#" className="block hover:text-white transition-colors">
                                    Architecture
                                </a>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-5">Tech Stack</h4>

                            <div className="flex flex-wrap gap-3">
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
                                    <span
                                        key={tech}
                                        className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-white/[0.03] text-xs text-zinc-600 dark:text-zinc-400"
                                    >
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-zinc-600">
                        <p>© 2026 GitNest. Built for open-source collaboration.</p>

                        <div className="flex items-center gap-6">
                            <a href="#" className="hover:text-white transition-colors">
                                Privacy
                            </a>
                            <a href="#" className="hover:text-white transition-colors">
                                Terms
                            </a>
                            <a href="#" className="hover:text-white transition-colors">
                                GitHub
                            </a>
                        </div>
                    </div>
                </footer>
            </div>
        );
    }
