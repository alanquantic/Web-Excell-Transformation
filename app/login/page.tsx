"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Settings, LogIn, Eye, EyeOff, Activity, Power } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.replace("/calculator");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Industrial Card */}
        <div className="industrial-card overflow-hidden">
          {/* Status Bar */}
          <div className="panel-header">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-glow-green animate-pulse" />
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">System Access Terminal</span>
          </div>
          
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="relative inline-flex items-center justify-center w-16 h-16 bg-eagle-yellow/20 border border-eagle-yellow/50 rounded mb-4">
                <Settings className="w-8 h-8 text-eagle-yellow" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full shadow-glow-green animate-pulse" />
              </div>
              <h1 className="text-2xl font-bold text-slate-100 tracking-wide">EAGLE OTR OPS</h1>
              <p className="text-slate-500 mt-2 font-mono text-sm">Operator Authentication Required</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-950/50 border border-red-800/50 text-red-400 p-3 rounded text-sm font-mono">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="industrial-input w-full"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="industrial-input w-full pr-12"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-eagle-yellow transition"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="industrial-btn-primary w-full flex items-center justify-center gap-2 py-3 mt-6"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Power className="w-5 h-5" />
                    <span className="font-bold uppercase tracking-wider">Authenticate</span>
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-slate-500 text-sm font-mono">
              No access credentials?{" "}
              <Link href="/signup" className="text-eagle-yellow hover:underline font-bold">
                Request Access
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
