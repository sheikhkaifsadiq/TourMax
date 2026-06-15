import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut } from "lucide-react";
import AuthModal from "@/components/AuthModal";

interface NavigationProps {
  sessionId: string;
}

export default function Navigation({ sessionId }: NavigationProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  // If user lands on /auth, /login, /signup — open modal and rewrite to /
  useEffect(() => {
    if (location === "/auth" || location === "/login" || location === "/signup") {
      setAuthMode(location === "/signup" ? "signup" : "signin");
      setAuthOpen(true);
      setLocation("/", { replace: true });
    }
  }, [location, setLocation]);

  const navTo = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMenuOpen(false);
    setLocation(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openAuth = (mode: "signin" | "signup") => {
    setAuthMode(mode);
    setAuthOpen(true);
    setIsMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="container px-4 mx-auto">
        <div className="flex items-center justify-between h-16">
          <button onClick={() => setLocation("/")} className="flex items-center">
            <img src="/logo-title-slogan.png" alt="TourMax" className="h-10 md:h-12 object-contain" />
          </button>

          <div className="hidden md:flex items-center gap-6">
            <a href="/tours" onClick={navTo("/tours")} className="text-slate-600 hover:text-slate-900 font-medium transition">Tours</a>
            <a href="/visual-search" onClick={navTo("/visual-search")} className="text-slate-600 hover:text-slate-900 font-medium transition">📸 Visual</a>
            <a href="/community" onClick={navTo("/community")} className="text-slate-600 hover:text-slate-900 font-medium transition">Community</a>
            <a href="/stories" onClick={navTo("/stories")} className="text-slate-600 hover:text-slate-900 font-medium transition">Stories</a>
            <a href="/compare" onClick={navTo("/compare")} className="text-slate-600 hover:text-slate-900 font-medium transition">Compare</a>
            <a href="/plan" onClick={navTo("/plan")} className="text-slate-600 hover:text-slate-900 font-medium transition">AI Planner</a>
            {isAuthenticated && (
              <>
                <a href="/feed" onClick={navTo("/feed")} className="text-slate-600 hover:text-slate-900 font-medium transition">Feed</a>
                <a href="/my-bookings" onClick={navTo("/my-bookings")} className="text-slate-600 hover:text-slate-900 font-medium transition">My Bookings</a>
                <a href="/host" onClick={navTo("/host")} className="text-slate-600 hover:text-slate-900 font-medium transition">Host</a>
              </>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => setLocation("/profile")}>Profile</Button>
                <Button variant="ghost" size="sm" onClick={() => logout()} className="flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => openAuth("signin")}>Sign In</Button>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => openAuth("signup")}>Sign Up</Button>
              </>
            )}
          </div>

          <button className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6 text-slate-900" /> : <Menu className="w-6 h-6 text-slate-900" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-4 space-y-4">
            <a href="/tours" onClick={navTo("/tours")} className="block text-slate-600 hover:text-slate-900 font-medium">Tours</a>
            <a href="/experiences" onClick={navTo("/experiences")} className="block text-slate-600 hover:text-slate-900 font-medium">Experiences</a>
            <a href="/compare" onClick={navTo("/compare")} className="block text-slate-600 hover:text-slate-900 font-medium">Compare</a>
            <a href="/plan" onClick={navTo("/plan")} className="block text-slate-600 hover:text-slate-900 font-medium">AI Planner</a>
            <a href="/my-bookings" onClick={navTo("/my-bookings")} className="block text-slate-600 hover:text-slate-900 font-medium">My Bookings</a>
            {isAuthenticated && (
              <a href="/host" onClick={navTo("/host")} className="block text-slate-600 hover:text-slate-900 font-medium">Host</a>
            )}
            <a href="/about" onClick={navTo("/about")} className="block text-slate-600 hover:text-slate-900 font-medium">About</a>
            <a href="/contact" onClick={navTo("/contact")} className="block text-slate-600 hover:text-slate-900 font-medium">Contact</a>
            <div className="pt-4 border-t border-slate-200">
              {isAuthenticated && user ? (
                <>
                  <p className="text-sm text-slate-600 mb-2">Welcome, {user.name}</p>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => logout()}>Logout</Button>
                </>
              ) : (
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full" onClick={() => openAuth("signin")}>Sign In</Button>
                  <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => openAuth("signup")}>Sign Up</Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} initialMode={authMode} />
    </nav>
  );
}
