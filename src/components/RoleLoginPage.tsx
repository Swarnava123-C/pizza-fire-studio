import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth, type AppRole } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Users, UserCheck } from "lucide-react";

const roleConfig: Record<string, { title: string; icon: typeof Shield; requiredRole: AppRole; redirect: string; color: string }> = {
  admin: { title: "Super Admin", icon: Shield, requiredRole: "admin", redirect: "/admin", color: "from-primary to-accent" },
  manager: { title: "Manager", icon: Users, requiredRole: "manager", redirect: "/manager", color: "from-blue-500 to-cyan-400" },
  staff: { title: "Staff", icon: UserCheck, requiredRole: "staff", redirect: "/staff", color: "from-green-500 to-emerald-400" },
};

const RoleLoginPage = ({ roleKey }: { roleKey: string }) => {
  const { user, role, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const config = roleConfig[roleKey];
  if (!config) return <Navigate to="/" replace />;

  if (loading) {
    return (
      <main className="pt-24 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </main>
    );
  }

  // Already logged in with correct role
  if (user && (role === config.requiredRole || role === "admin")) {
    return <Navigate to={config.redirect} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Please fill all fields");
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success(`Welcome back!`);
      // Role will be fetched by AuthContext, redirect happens via the Navigate above on re-render
      // But we can also navigate directly
      navigate(config.redirect);
    }
  };

  const Icon = config.icon;

  return (
    <main className="pt-24 pb-20 min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-4"
      >
        <div className="glass-card p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className={`inline-flex p-3 rounded-full bg-gradient-to-r ${config.color} mb-2`}>
              <Icon className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-display text-3xl gradient-text">{config.title} Login</h1>
            <p className="text-muted-foreground text-sm">Sign in to access the {config.title.toLowerCase()} dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background border-border"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-background border-border"
            />
            <Button type="submit" disabled={submitting} className="w-full bg-primary text-primary-foreground">
              {submitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>
      </motion.div>
    </main>
  );
};

export default RoleLoginPage;
