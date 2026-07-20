"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, Calculator, History, LogOut, User, Building2, Power, Activity, Gauge } from "lucide-react";

export function Header() {
  const { data: session } = useSession() || {};
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/dashboard/projects") {
      return pathname?.startsWith("/dashboard/projects");
    }
    return pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50">
      {/* Top Status Bar */}
      <div className="h-1 bg-gradient-to-r from-transparent via-eagle-yellow/30 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard/projects" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 bg-eagle-yellow/20 border border-eagle-yellow/50 rounded flex items-center justify-center group-hover:bg-eagle-yellow/30 transition-all">
            <Settings className="w-5 h-5 text-eagle-yellow" />
            {/* Status LED */}
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full shadow-glow-green animate-pulse" />
          </div>
          <div className="hidden sm:block">
            <span className="font-bold text-slate-100 tracking-wide text-sm">EAGLE OTR</span>
            <span className="text-eagle-yellow font-bold text-sm ml-1">OPS SUITE</span>
            <div className="flex items-center gap-2 mt-0.5">
              <Activity className="w-3 h-3 text-green-500" />
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">System Active</span>
            </div>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          <Link
            href="/dashboard/projects"
            className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${
              isActive("/dashboard/projects")
                ? "bg-eagle-yellow/20 text-eagle-yellow border border-eagle-yellow/50"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">Projects</span>
          </Link>
          <Link
            href="/calculator"
            className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${
              isActive("/calculator")
                ? "bg-eagle-yellow/20 text-eagle-yellow border border-eagle-yellow/50"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent"
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span className="hidden sm:inline">Calculator</span>
          </Link>
          <Link
            href="/history"
            className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${
              isActive("/history")
                ? "bg-eagle-yellow/20 text-eagle-yellow border border-eagle-yellow/50"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent"
            }`}
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">History</span>
          </Link>
          <Link
            href="/audit"
            className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${
              isActive("/audit")
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
                : "text-slate-400 hover:text-cyan-400 hover:bg-slate-800 border border-transparent"
            }`}
          >
            <Gauge className="w-4 h-4" />
            <span className="hidden sm:inline">Audit</span>
          </Link>

          {/* Divider */}
          <div className="h-6 w-px bg-slate-700 mx-2" />

          {/* User Section */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/80 border border-slate-700 rounded">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-glow-green" />
              <User className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-mono text-slate-300 hidden sm:inline">
                {session?.user?.name || session?.user?.email?.split("@")[0]}
              </span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-red-950/30 border border-transparent hover:border-red-800/50 rounded transition-all"
            >
              <Power className="w-4 h-4" />
              <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">Exit</span>
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
