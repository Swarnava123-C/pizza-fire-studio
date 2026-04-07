import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingCart, CalendarDays, Clock } from "lucide-react";

const StatCard = ({ icon: Icon, label, value, color }: { icon: typeof ShoppingCart; label: string; value: string | number; color: string }) => (
  <div className="glass-card p-5">
    <div className="flex items-center gap-3">
      <div className={`p-2.5 rounded-lg ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-display text-foreground">{value}</p>
      </div>
    </div>
  </div>
);

const StaffOverview = () => {
  const [stats, setStats] = useState({ activeOrders: 0, todayBookings: 0 });

  useEffect(() => {
    const load = async () => {
      const today = new Date().toISOString().split("T")[0];
      const [orders, reservations] = await Promise.all([
        supabase.from("orders").select("id", { count: "exact" }).in("status", ["pending", "preparing", "ready"]),
        supabase.from("reservations").select("id", { count: "exact" }).eq("reservation_date", today),
      ]);
      setStats({
        activeOrders: orders.count || 0,
        todayBookings: reservations.count || 0,
      });
    };
    load();
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="font-display text-3xl md:text-4xl gradient-text">Staff Dashboard</h1>
        <p className="text-muted-foreground">Your assignments today</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard icon={ShoppingCart} label="Active Orders" value={stats.activeOrders} color="bg-primary" />
        <StatCard icon={CalendarDays} label="Today's Bookings" value={stats.todayBookings} color="bg-blue-600" />
      </div>
    </motion.div>
  );
};

export default StaffOverview;
