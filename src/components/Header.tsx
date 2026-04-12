import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Phone, Menu, X, LogIn, LogOut, Shield, Users, UserCheck, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import CartIcon from "@/components/CartIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/about", label: "About" },
  { to: "/reservations", label: "Reservations" },
  { to: "/contact", label: "Contact" },
];

const adminLinks = [
  { to: "/admin/login", label: "Super Admin", icon: Shield },
  { to: "/manager/login", label: "Manager Admin", icon: Users },
  { to: "/staff/login", label: "Staff Admin", icon: UserCheck },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, isAdmin, isManager, isStaff, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getDashboardLink = () => {
    if (isAdmin) return "/admin";
    if (isManager) return "/manager";
    if (isStaff) return "/staff";
    return null;
  };

  const dashboardLink = getDashboardLink();

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

          {/* Admin dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="px-4 py-2 text-sm font-medium rounded-lg transition-colors text-muted-foreground hover:text-foreground flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> Admin <ChevronDown className="w-3 h-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border-border">
              {adminLinks.map((link) => (
                <DropdownMenuItem key={link.to} onClick={() => navigate(link.to)} className="cursor-pointer">
                  <link.icon className="w-4 h-4 mr-2" /> {link.label}
                </DropdownMenuItem>
              ))}
              {dashboardLink && (
                <DropdownMenuItem onClick={() => navigate(dashboardLink)} className="cursor-pointer text-primary">
                  <Shield className="w-4 h-4 mr-2" /> Go to Dashboard
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="flex items-center gap-2">
          <CartIcon />

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

              <div className="border-t border-border my-2" />
              <span className="px-4 py-1 text-xs text-muted-foreground uppercase tracking-wider">Admin Access</span>
              {adminLinks.map((link) => (
                <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-2">
                  <link.icon className="w-4 h-4" /> {link.label}
                </Link>
              ))}
              {dashboardLink && (
                <Link to={dashboardLink} onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-lg text-sm font-medium text-primary flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Go to Dashboard
                </Link>
              )}

              <div className="border-t border-border my-2" />
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
