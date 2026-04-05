import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Phone, Menu, X, LogIn, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/about", label: "About" },
  { to: "/reservations", label: "Reservations" },
  { to: "/contact", label: "Contact" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto flex items-center justify-between h-16 md:h-20 px-4">
        <Link to="/" className="font-display text-3xl md:text-4xl tracking-wide gradient-text">
          PizzaFast
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                location.pathname === link.to ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin" className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1 ${location.pathname === "/admin" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
              <Shield className="w-3.5 h-3.5" /> Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <a href="tel:+919748004981">
            <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground">
              <Phone className="w-4 h-4" /> Call Now
            </Button>
          </a>

          {user ? (
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="hidden sm:flex items-center gap-1 text-muted-foreground hover:text-foreground">
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>
          ) : (
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-1 text-muted-foreground hover:text-foreground">
                <LogIn className="w-4 h-4" /> Sign In
              </Button>
            </Link>
          )}

          <button className="lg:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="lg:hidden bg-background/95 backdrop-blur-xl border-b border-border">
            <nav className="flex flex-col p-4 gap-1">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)} className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${location.pathname === link.to ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <Link to="/admin" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-lg text-sm font-medium text-primary flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Admin Panel
                </Link>
              )}
              {user ? (
                <button onClick={() => { handleSignOut(); setMobileOpen(false); }} className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground text-left">
                  Sign Out
                </button>
              ) : (
                <Link to="/auth" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground">
                  Sign In / Sign Up
                </Link>
              )}
              <a href="tel:+919748004981" className="mt-2">
                <Button className="w-full bg-primary text-primary-foreground"><Phone className="w-4 h-4 mr-2" /> Call Now</Button>
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
