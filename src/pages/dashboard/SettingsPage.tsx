import { motion } from "framer-motion";

const SettingsPage = () => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <h1 className="font-display text-3xl gradient-text">Settings</h1>
      <div className="glass-card p-6">
        <p className="text-muted-foreground">Restaurant settings and configuration will be available here.</p>
      </div>
    </motion.div>
  );
};

export default SettingsPage;
