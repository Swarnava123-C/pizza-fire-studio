import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionHeading from "@/components/SectionHeading";

const AdminPage = () => (
  <main className="pt-24 pb-20 min-h-screen flex items-center justify-center">
    <div className="container mx-auto px-4 max-w-lg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-10 text-center"
      >
        <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
        <SectionHeading title="Admin Panel" subtitle="Authentication required to access the dashboard" />
        <p className="text-muted-foreground text-sm mb-6">
          To enable the admin dashboard with login, menu management, reservation tracking, and more — we need to set up Lovable Cloud for authentication and database storage.
        </p>
        <Button disabled className="bg-primary text-primary-foreground opacity-60">
          Sign In (Requires Lovable Cloud)
        </Button>
      </motion.div>
    </div>
  </main>
);

export default AdminPage;
