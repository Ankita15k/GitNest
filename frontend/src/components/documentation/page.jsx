import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Rocket, Users, Star } from "lucide-react";
import logo from "../../assets/logo.png";

const sections = [
  { id: "overview", label: "Project Overview" },
  { id: "features", label: "Features" },
  { id: "getting-started", label: "Getting Started" },
  { id: "installation", label: "Installation" },
  { id: "usage", label: "Usage Guidelines" },
  { id: "contributing", label: "Contribution Guidelines" },
  { id: "faq", label: "FAQs & Troubleshooting" },
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("overview");

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f8f7] dark:bg-[#07090d] text-zinc-900 dark:text-white">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 border-b border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-[#0c0f14]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img src={logo} alt="GitNest" className="w-9 h-9" />
              <div>
                <h1 className="font-black text-2xl tracking-tight">GitNest</h1>
                <p className="text-xs text-zinc-500 -mt-1">Documentation</p>
              </div>
            </Link>
          </div>

          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-medium hover:text-[#00dc82] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12 flex gap-12">
        {/* Sidebar */}
        <div className="w-72 hidden lg:block">
          <div className="sticky top-24">
            <div className="flex items-center gap-3 mb-8">
              <BookOpen className="w-6 h-6 text-[#00dc82]" />
              <h2 className="font-semibold text-lg">Documentation</h2>
            </div>

            <div className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full text-left px-4 py-3 rounded-2xl transition-all text-sm font-medium ${
                    activeSection === section.id
                      ? "bg-[#00dc82]/10 text-[#00dc82] border-l-4 border-[#00dc82]"
                      : "hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </div>

            <div className="mt-12 text-xs text-zinc-500 dark:text-zinc-400">
              <p>Last updated: June 2026</p>
              <p className="mt-1">Version 0.1.0</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-3xl">
          {/* Hero */}
          <div className="mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00dc82]/20 bg-[#00dc82]/5 text-[#00dc82] mb-6">
              <Star className="w-4 h-4" /> GSSoC 2026 Project
            </div>
            <h1 className="text-5xl font-black tracking-tighter mb-6">
              GitNest Documentation
            </h1>
            <p className="text-xl text-zinc-600 dark:text-zinc-400">
              Everything you need to understand, install, use, and contribute to
              GitNest.
            </p>
          </div>

          {/* Overview */}
          <section id="overview" className="mb-20">
            <h2 className="text-4xl font-black mb-6">Project Overview</h2>
            <div className="prose dark:prose-invert max-w-none text-lg leading-relaxed">
              <p>
                <strong>GitNest</strong> is a modern, lightweight,
                GitHub-inspired collaborative code hosting platform built with
                the MERN Stack.
              </p>
              <p>
                It enables developers to create repositories, browse code,
                manage issues, review pull requests, and collaborate seamlessly
                in one open-source ecosystem.
              </p>
            </div>
          </section>

          {/* Features */}
          <section id="features" className="mb-20">
            <h2 className="text-4xl font-black mb-8 flex items-center gap-3">
              <Rocket className="w-8 h-8 text-[#00dc82]" /> Features
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                "Authentication — Register, login, JWT, GitHub OAuth",
                "Repository Management — Create, fork, star, delete repos",
                "File Browser with Monaco Editor syntax highlighting",
                "Issues & Pull Requests with labels and comments",
                "User Profiles & Activity Feed",
                "Global Search across repos, users & code",
                "Real-time Notifications via Socket.io",
                "Dark/Light Mode",
              ].map((feature, i) => (
                <div
                  key={i}
                  className="flex gap-4 p-6 rounded-3xl border border-zinc-200 dark:border-white/10 hover:border-[#00dc82]/30 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-[#00dc82]/10 flex-shrink-0 flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-[#00dc82] rounded-full" />
                  </div>
                  <p className="text-lg">{feature}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Getting Started */}
          <section id="getting-started" className="mb-20">
            <h2 className="text-4xl font-black mb-6">Getting Started</h2>
            <div className="prose dark:prose-invert text-lg">
              <h3 className="text-2xl font-semibold mt-8 mb-4">
                Prerequisites
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Node.js v20+</li>
                <li>Git</li>
                <li>MongoDB (or use Docker)</li>
              </ul>
            </div>
          </section>

          {/* Installation */}
          <section id="installation" className="mb-20">
            <h2 className="text-4xl font-black mb-8">Installation</h2>
            <div className="space-y-10">
              <div>
                <h3 className="text-2xl font-semibold mb-4">
                  1. Clone the Repository
                </h3>
                <pre className="bg-zinc-900 text-white p-6 rounded-3xl overflow-x-auto text-sm">
                  {`git clone https://github.com/<your-username>/GitNest.git
cd GitNest`}
                </pre>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-4">
                  2. Environment Variables
                </h3>
                <pre className="bg-zinc-900 text-white p-6 rounded-3xl overflow-x-auto text-sm">
                  {`cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env`}
                </pre>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-4">3. Run with npm</h3>
                <pre className="bg-zinc-900 text-white p-6 rounded-3xl overflow-x-auto text-sm">
                  {`# Terminal 1 - Backend
cd backend && npm install && npm start

# Terminal 2 - Frontend
cd frontend && npm install && npm run dev`}
                </pre>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-4">
                  Docker Setup (Recommended)
                </h3>
                <pre className="bg-zinc-900 text-white p-6 rounded-3xl overflow-x-auto text-sm">
                  docker-compose up --build
                </pre>
              </div>
            </div>
          </section>

          {/* Usage */}
          <section id="usage" className="mb-20">
            <h2 className="text-4xl font-black mb-6">Usage Guidelines</h2>
            <div className="prose dark:prose-invert text-lg">
              <p>After starting the application:</p>
              <ul className="list-disc pl-6 space-y-3">
                <li>
                  Visit <code>http://localhost:5173</code>
                </li>
                <li>Register a new account or login</li>
                <li>Create your first repository</li>
                <li>
                  Explore features like Issues, PRs, and real-time collaboration
                </li>
              </ul>
            </div>
          </section>

          {/* Contributing */}
          <section id="contributing" className="mb-20">
            <h2 className="text-4xl font-black mb-6 flex items-center gap-3">
              <Users className="w-8 h-8 text-[#00dc82]" /> Contribution
              Guidelines
            </h2>
            <div className="prose dark:prose-invert text-lg">
              <p>We welcome contributions of all levels!</p>
              <p className="font-medium">Before contributing:</p>
              <ol className="list-decimal pl-6 space-y-3">
                <li>
                  Read <strong>CONTRIBUTING.md</strong>
                </li>
                <li>
                  Check open issues labeled <code>good first issue</code>
                </li>
                <li>Comment on the issue and wait for assignment</li>
                <li>Follow the coding standards and commit message format</li>
              </ol>
              <p className="mt-6">
                This is a <strong>GSSoC 2026</strong> project. Happy
                contributing!
              </p>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="mb-20">
            <h2 className="text-4xl font-black mb-8">
              FAQs &amp; Troubleshooting
            </h2>
            <div className="space-y-8">
              <div className="border-l-4 border-[#00dc82] pl-6">
                <h3 className="font-semibold text-xl">
                  How do I run both frontend and backend?
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 mt-2">
                  Use two terminals or Docker Compose (recommended).
                </p>
              </div>
              <div className="border-l-4 border-[#00dc82] pl-6">
                <h3 className="font-semibold text-xl">
                  MongoDB connection error?
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 mt-2">
                  Check your <code>MONGODB_URI</code> in backend .env and ensure
                  MongoDB is running.
                </p>
              </div>
              <div className="border-l-4 border-[#00dc82] pl-6">
                <h3 className="font-semibold text-xl">Port already in use?</h3>
                <p className="text-zinc-600 dark:text-zinc-400 mt-2">
                  Change ports in <code>.env</code> files or kill the
                  conflicting process.
                </p>
              </div>
            </div>
          </section>

          <div className="pt-12 border-t border-zinc-200 dark:border-white/10 text-center text-sm text-zinc-500">
            Made with ❤️ for the open source community • GitNest © 2026
          </div>
        </div>
      </div>
    </div>
  );
}
