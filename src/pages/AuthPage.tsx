import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import SectionHeading from "@/components/SectionHeading";

const AuthPage = () => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = mode === "signin" ? await signIn(email, password) : await signUp(email, password);

    if (result.error) {
      toast.error(result.error);
    } else if (mode === "signup") {
      toast.success("Account created! Check your email to verify.");
    } else {
      toast.success("Signed in!");
      navigate("/");
    }
    setLoading(false);
  };

  return (
    <main className="pt-24 pb-20 min-h-screen flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8"
        >
          <SectionHeading title={mode === "signin" ? "Sign In" : "Sign Up"} />
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@email.com"
                className="bg-background border-border"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Min 6 characters"
                className="bg-background border-border"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground py-5">
              {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {mode === "signin" ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default AuthPage;
