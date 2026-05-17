import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0F1C] flex flex-col items-center justify-center text-zinc-900 dark:text-slate-200 p-6 font-sans selection:bg-blue-500/30 transition-colors">
      <div className="max-w-md w-full flex flex-col items-center text-center space-y-8">
        
        {/* Logo/Icon Area */}
        <div className="relative">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-[#111827]/80 rounded-2xl md:rounded-[1.5rem] flex items-center justify-center border border-slate-700/30 shadow-[0_4px_20px_rgba(0,0,0,0.2)] backdrop-blur-md">
            <span className="text-4xl md:text-[2.75rem] font-bold text-slate-300 tracking-tighter" style={{ fontFamily: 'sans-serif' }}>
              G
            </span>
          </div>
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 md:w-4 md:h-4 bg-slate-400 rounded-full border-[3px] border-[#0A0F1C]"></div>
        </div>

        {/* 404 Text */}
        <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-slate-100 flex items-center justify-center select-none">
          4<span className="text-slate-500/80 mx-1 md:mx-2">0</span>4
        </h1>

        {/* Messaging */}
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold text-slate-100 tracking-wide">
            GitNest Disconnected
          </h2>
          <p className="text-sm md:text-base text-slate-400/80 leading-relaxed max-w-[340px] mx-auto font-light">
            It looks like the repository you're looking for doesn't exist or has been moved. Let's get your code journey back on track.
          </p>
        </div>

        {/* Actions */}
        <div className="pt-2 md:pt-4 w-full sm:w-auto">
          <Link 
            to="/" 
            className="group w-full sm:w-auto px-7 py-3 bg-slate-100 text-slate-900 rounded-xl font-medium text-sm md:text-base transition-all duration-300 flex items-center justify-center gap-2.5 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:bg-white hover:shadow-[0_0_25px_rgba(255,255,255,0.25)] hover:-translate-y-0.5 active:translate-y-0"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={2} 
              stroke="currentColor" 
              className="w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 group-hover:-translate-x-1"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Go to Home
          </Link>
        </div>

      </div>

      {/* Footer text */}
      <div className="absolute bottom-8 text-[10px] md:text-xs font-mono text-slate-500/50 tracking-[0.2em] uppercase select-none">
        ERROR_CODE: REPOSITORY_NOT_FOUND // GITNEST_V1.0
      </div>
    </div>
  );
};

export default NotFound;
