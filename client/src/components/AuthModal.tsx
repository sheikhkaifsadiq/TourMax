import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Github, Mail, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAuth } from "@/_core/hooks/useAuth";

type Mode = "signin" | "signup";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode?: Mode;
}

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

export default function AuthModal({ open, onOpenChange, initialMode = "signin" }: AuthModalProps) {
  const { refresh } = useAuth();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [showEmail, setShowEmail] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setShowEmail(false);
      setMode(initialMode);
    }
  }, [open, initialMode]);

  const handleOAuth = (provider: "google" | "github") => {
    window.location.href = `/api/oauth/${provider}/login`;
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = mode === "signup" ? "/api/auth/register" : "/api/auth/login";
      const body = mode === "signup" ? { name, email, password } : { email, password };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Authentication failed");
        return;
      }
      toast.success(mode === "signup" ? "Account created!" : "Welcome back!");
      await refresh();
      onOpenChange(false);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white border-slate-200/60 rounded-2xl">
        <div className="p-8">
          <div className="flex flex-col items-center mb-6">
            <img src="/logo-icon.png" alt="TourMax" className="w-24 h-24 object-contain mb-3 drop-shadow-md" />
            <h2 className="text-2xl font-bold text-slate-900">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {mode === "signin" ? "Sign in to continue your journey" : "Start exploring amazing tours"}
            </p>
          </div>

          {!showEmail ? (
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 font-medium border-slate-300 hover:bg-slate-50"
                onClick={() => handleOAuth("google")}
              >
                <GoogleIcon />
                Continue with Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 font-medium border-slate-300 hover:bg-slate-50"
                onClick={() => handleOAuth("github")}
              >
                <Github className="w-5 h-5" />
                Continue with GitHub
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 font-medium border-slate-300 hover:bg-slate-50"
                onClick={() => setShowEmail(true)}
              >
                <Mail className="w-5 h-5" />
                Continue with Email
              </Button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setShowEmail(false)}
                className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 mb-4 transition"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                {mode === "signup" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="auth-name">Name</Label>
                    <Input
                      id="auth-name"
                      type="text"
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      maxLength={120}
                      className="h-11"
                    />
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="auth-email">Email</Label>
                  <Input
                    id="auth-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="auth-password">Password</Label>
                  <Input
                    id="auth-password"
                    type="password"
                    placeholder={mode === "signup" ? "At least 8 characters" : "••••••••"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={mode === "signup" ? 8 : 1}
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    className="h-11"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 font-medium shadow-md shadow-blue-500/20"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : mode === "signin" ? (
                    "Sign in"
                  ) : (
                    "Create account"
                  )}
                </Button>
              </form>
            </>
          )}

          <p className="text-center text-sm text-slate-500 mt-6">
            {mode === "signin" ? (
              <>
                Don't have an account?{" "}
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                  onClick={() => { setMode("signup"); setShowEmail(true); }}
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                  onClick={() => { setMode("signin"); }}
                >
                  Sign in
                </button>
              </>
            )}
          </p>

          <p className="text-center text-xs text-slate-400 mt-4">
            By continuing, you agree to TourMax's Terms & Privacy Policy.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
