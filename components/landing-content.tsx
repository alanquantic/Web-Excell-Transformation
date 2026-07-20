"use client";

import { Settings, Calculator, PieChart, History, Save, Activity, Factory, Power } from "lucide-react";
import Link from "next/link";

export function LandingContent() {
  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="relative inline-flex items-center justify-center w-20 h-20 bg-eagle-yellow/20 border-2 border-eagle-yellow/50 rounded mb-6">
            <Settings className="w-10 h-10 text-eagle-yellow" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full shadow-glow-green animate-pulse" />
          </div>
          <div className="flex items-center justify-center gap-3 mb-4">
            <Activity className="w-5 h-5 text-green-500" />
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Industrial Control System Online</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-4 tracking-wide">
            EAGLE <span className="text-eagle-yellow">OTR OPS</span> SUITE
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto font-mono">
            Industrial-grade operations management for OTR tire recycling facilities. Production simulations, cost analysis, and real-time monitoring.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {[
            { icon: Calculator, title: "Real-time Calculations", desc: "Instant pricing updates as you modify quantities", color: "cyan" },
            { icon: Save, title: "Save Scenarios", desc: "Store and reload your custom configurations", color: "green" },
            { icon: PieChart, title: "Visual Analytics", desc: "Interactive charts showing cost distribution", color: "purple" },
            { icon: Factory, title: "Production Simulations", desc: "Model throughput and bottleneck analysis", color: "yellow" }
          ].map((feature, i) => (
            <div key={i} className="industrial-card p-5 hover:border-eagle-yellow/50 transition-all group">
              <div className={`w-10 h-10 rounded flex items-center justify-center mb-3 ${
                feature.color === "cyan" ? "bg-cyan-900/50 border border-cyan-700/50" :
                feature.color === "green" ? "bg-green-900/50 border border-green-700/50" :
                feature.color === "purple" ? "bg-purple-900/50 border border-purple-700/50" :
                "bg-eagle-yellow/20 border border-eagle-yellow/50"
              }`}>
                <feature.icon className={`w-5 h-5 ${
                  feature.color === "cyan" ? "text-cyan-400" :
                  feature.color === "green" ? "text-green-400" :
                  feature.color === "purple" ? "text-purple-400" :
                  "text-eagle-yellow"
                }`} />
              </div>
              <h3 className="font-bold text-slate-200 mb-2 tracking-wide group-hover:text-eagle-yellow transition-colors">{feature.title}</h3>
              <p className="text-slate-500 text-sm font-mono">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/login"
            className="industrial-btn-primary inline-flex items-center gap-3 px-8 py-4 text-lg"
          >
            <Power className="w-5 h-5" />
            <span className="font-bold uppercase tracking-wider">Access System</span>
          </Link>
          <p className="mt-4 text-slate-500 text-sm font-mono">
            No credentials?{" "}
            <Link href="/signup" className="text-eagle-yellow hover:underline font-bold">
              Request Access
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
