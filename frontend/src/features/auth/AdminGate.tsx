import { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

const SESSION_KEY = "vlip_admin_session";
const PASSPHRASE_ENV = import.meta.env.VITE_ADMIN_PASSPHRASE as string | undefined;

interface AdminGateProps {
  children: React.ReactNode;
}

export function AdminGate({ children }: AdminGateProps) {
  const [authed, setAuthed] = useState(false);
  const [value, setValue] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  // Check sessionStorage on mount
  useEffect(() => {
    const token = sessionStorage.getItem(SESSION_KEY);
    if (token === "1") {
      setAuthed(true);
    }
  }, []);

  // If no passphrase configured, bypass gate (dev mode)
  if (!PASSPHRASE_ENV) {
    return <>{children}</>;
  }

  if (authed) {
    return <>{children}</>;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (value.trim() === PASSPHRASE_ENV) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setError(false);
      setAuthed(true);
    } else {
      setError(true);
      setValue("");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-6">
      <div className={`w-full max-w-sm ${shake ? 'animate-shake' : ''}`}>
        {/* Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0d1428] border border-white/[0.08] mb-5">
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
              <path d="M8 8L14.5 22L16 18.5L11.5 8H8Z" fill="#dc2626"/>
              <path d="M24 8L17.5 22L16 18.5L20.5 8H24Z" fill="white" fillOpacity="0.9"/>
            </svg>
          </div>
          <p className="text-[13px] font-bold text-white tracking-tight">Venturizer</p>
          <p className="text-[11px] text-white/30 mt-0.5">Internal Team Access</p>
        </div>

        {/* Gate card */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#111827] p-8">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="h-4 w-4 text-white/30" />
            <h1 className="text-[14px] font-semibold text-white">Admin Authentication</h1>
            <span className="ml-auto rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold text-amber-400 uppercase tracking-widest">
              Internal
            </span>
          </div>

          <p className="text-[13px] text-white/40 leading-relaxed mb-6">
            This dashboard is restricted to the Venturizer internal team. Enter your access code to continue.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                id="admin-passphrase"
                type={showPass ? "text" : "password"}
                value={value}
                onChange={(e) => { setValue(e.target.value); setError(false); }}
                placeholder="Enter access code"
                autoComplete="current-password"
                className={`w-full rounded-xl bg-white/[0.05] border px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 transition-all pr-10 ${
                  error
                    ? 'border-red-500/50 focus:ring-red-500/30'
                    : 'border-white/[0.1] focus:ring-white/20 focus:border-white/25'
                }`}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors"
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-[12px] text-red-400">
                <AlertCircle className="h-3.5 w-3.5 flex-none" />
                Incorrect access code. Please try again.
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-white py-3 text-[14px] font-semibold text-[#0d1428] hover:bg-white/90 transition-all active:scale-[0.98]"
            >
              Enter Dashboard
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-[11px] text-white/15">
          Venturizer Lead Intelligence Platform · Internal ERP
        </p>
      </div>
    </div>
  );
}
