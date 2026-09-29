"use client";

import React, { useState } from "react";
import { User, Lock, ShieldCheck, X, Check, ArrowRight, LogOut, Briefcase } from "lucide-react";
import { AuthUser, loginUser } from "../lib/api";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
  onLoginSuccess: (user: AuthUser, token: string) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
}) => {
  const [username, setUsername] = useState("farmer");
  const [password, setPassword] = useState("farmer123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (u = username, p = password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await loginUser(u, p);
      onLoginSuccess(res.user, res.access_token);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const selectPreset = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    void handleLogin(u, p);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-stone-400 hover:text-stone-600 p-1.5 rounded-full hover:bg-stone-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-xl bg-emerald-50 text-[#1b4332]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-stone-900">User Authentication</h3>
            <p className="text-xs text-stone-500">SIH 2026 Role-Based Access Control (RBAC)</p>
          </div>
        </div>

        {currentUser ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-stone-500 font-bold uppercase tracking-wider">Logged In As</div>
                  <div className="text-base font-bold text-stone-900 mt-0.5">{currentUser.full_name}</div>
                  <div className="text-xs text-emerald-700 font-bold capitalize mt-0.5">Role: {currentUser.role?.replace("_", " ")}</div>
                </div>
                <div className="text-right text-xs text-stone-500">
                  <div>{currentUser.organization}</div>
                  <div className="font-mono text-[11px]">{currentUser.phone}</div>
                </div>
              </div>

              {currentUser.role_info?.permissions && (
                <div className="mt-3 pt-3 border-t border-stone-200">
                  <div className="text-[10px] uppercase font-bold text-stone-400 mb-1.5">Granted Permissions:</div>
                  <div className="flex flex-wrap gap-1">
                    {currentUser.role_info.permissions.map((p) => (
                      <span key={p} className="px-2 py-0.5 rounded text-[10px] bg-white border border-stone-200 font-mono text-stone-600">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={onLogout}
                className="flex-1 py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-rose-50 hover:text-rose-700 text-stone-800 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#1b4332] text-white text-xs font-bold transition"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Quick Role Presets for Demo */}
            <div>
              <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">
                1-Click Demo Personas:
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => selectPreset("farmer", "farmer123")}
                  className="p-2.5 rounded-xl border border-stone-200 hover:border-[#2d6a4f] bg-stone-50 hover:bg-emerald-50 text-left transition"
                >
                  <div className="text-xs font-bold text-stone-900">Dairy Farmer</div>
                  <div className="text-[10px] text-stone-500">Ramesh Patil</div>
                </button>
                <button
                  type="button"
                  onClick={() => selectPreset("officer", "officer123")}
                  className="p-2.5 rounded-xl border border-stone-200 hover:border-[#2d6a4f] bg-stone-50 hover:bg-emerald-50 text-left transition"
                >
                  <div className="text-xs font-bold text-stone-900">Field Officer</div>
                  <div className="text-[10px] text-stone-500">Dr. Sunita Deshmukh</div>
                </button>
                <button
                  type="button"
                  onClick={() => selectPreset("nutritionist", "nutri123")}
                  className="p-2.5 rounded-xl border border-stone-200 hover:border-[#2d6a4f] bg-stone-50 hover:bg-emerald-50 text-left transition"
                >
                  <div className="text-xs font-bold text-stone-900">Nutritionist</div>
                  <div className="text-[10px] text-stone-500">Kavita Rao, M.V.Sc</div>
                </button>
                <button
                  type="button"
                  onClick={() => selectPreset("lab", "lab123")}
                  className="p-2.5 rounded-xl border border-stone-200 hover:border-[#2d6a4f] bg-stone-50 hover:bg-emerald-50 text-left transition"
                >
                  <div className="text-xs font-bold text-stone-900">QA Lab Tech</div>
                  <div className="text-[10px] text-stone-500">Anand Shinde</div>
                </button>
              </div>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-stone-200"></div>
              <span className="flex-shrink mx-3 text-stone-400 text-[10px] uppercase font-bold">Or credentials</span>
              <div className="flex-grow border-t border-stone-200"></div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {error}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleLogin();
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white text-xs font-bold transition disabled:opacity-60 flex items-center justify-center gap-1.5"
              >
                <span>{loading ? "Authenticating..." : "Sign In with JWT"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
