import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

const UnauthorizedPage = () => (
  <main className="pt-24 pb-20 min-h-screen flex items-center justify-center">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6 max-w-md mx-4">
      <div className="inline-flex p-4 rounded-full bg-destructive/10">
        <ShieldAlert className="w-12 h-12 text-destructive" />
      </div>
      <h1 className="font-display text-4xl gradient-text">Access Denied</h1>
      <p className="text-muted-foreground">You don't have permission to access this page. Contact your administrator if you believe this is an error.</p>
      <div className="flex gap-3 justify-center">
        <Link to="/"><Button variant="outline">Go Home</Button></Link>
        <Link to="/auth"><Button>Sign In</Button></Link>
      </div>
    </motion.div>
  </main>
);

export default UnauthorizedPage;
