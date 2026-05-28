import { Link } from "react-router-dom";
import { ArrowLeft, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f8f7] dark:bg-[#07090d] flex items-center justify-center px-6">

      {/* Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">

        <div className="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-[radial-gradient(circle,rgba(0,220,130,0.12),transparent_60%)] blur-3xl" />

        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-400/10 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right,#000 1px,transparent 1px), linear-gradient(to bottom,#000 1px,transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      {/* Card */}
      <div className="w-full h-screen rounded-none border border-white/50 dark:border-white/10 bg-white/75 dark:bg-[#0c0f14]/70 backdrop-blur-2xl shadow-[0_30px_80px_rgba(15,23,42,0.12)] flex flex-col items-center justify-center text-center px-6">

        {/* Badge */}
        <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full border border-[#00dc82]/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl text-[#1edb8c] shadow-lg mb-8">
          <SearchX className="w-4 h-4" />
          <span className="text-sm font-medium">
            ERROR • ROUTE_NOT_FOUND
          </span>
        </div>

        {/* 404 */}
        <h1 className="text-[110px] md:text-[180px] leading-none font-black tracking-[-0.08em] bg-gradient-to-r from-[#00dc82] via-[#36e4da] to-[#4fd1ff] bg-clip-text text-transparent">
          404
        </h1>

        {/* Title */}
        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-[#071138] dark:text-white mt-4">
          GitNest Disconnected
        </h2>

        {/* Description */}
        <p className="text-lg leading-8 text-[#64748b] dark:text-zinc-400 max-w-2xl mx-auto mt-6">
          The page you are looking for could not be found. It may have been
          moved, deleted, or the URL might be incorrect.
        </p>

        {/* Actions */}
        <div className="flex flex-wrap justify-center gap-5 mt-10">

          <Link
            to="/"
            className="group px-8 py-4 rounded-3xl bg-gradient-to-r from-[#00dc82] to-[#36e4da] text-black font-bold shadow-[0_15px_45px_rgba(0,220,130,0.30)] hover:-translate-y-1 transition-all flex items-center gap-3"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Return Home
          </Link>

          <Link
            to="/docs"
            className="px-8 py-4 rounded-3xl border border-zinc-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-xl text-zinc-700 dark:text-zinc-200 hover:shadow-xl transition-all"
          >
            View Documentation
          </Link>

        </div>

        {/* Footer */}
        <div className="mt-10 text-xs tracking-[0.3em] uppercase text-zinc-500">
          GitNest • Repository Not Found
        </div>
      </div>
    </div>
  );
}