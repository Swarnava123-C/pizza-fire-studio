import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingCart, CalendarDays, MessageSquare, Star } from "lucide-react";

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

const ManagerOverview = () => {
  const [stats, setStats] = useState({ pendingOrders: 0, todayReservations: 0, pendingReviews: 0, messages: 0 });

  useEffect(() => {
    const load = async () => {
      const today = new Date().toISOString().split("T")[0];
      const [orders, reservations, reviews, messages] = await Promise.all([
        supabase.from("orders").select("id", { count: "exact" }).in("status", ["pending", "preparing"]),
        supabase.from("reservations").select("id", { count: "exact" }).eq("reservation_date", today),
        supabase.from("reviews").select("id", { count: "exact" }).eq("status", "pending"),
        supabase.from("contact_submissions").select("id", { count: "exact" }).eq("resolved", false),
      ]);
      setStats({
        pendingOrders: orders.count || 0,
        todayReservations: reservations.count || 0,
        pendingReviews: reviews.count || 0,
        messages: messages.count || 0,
      });
    };
    load();
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="font-display text-3xl md:text-4xl gradient-text">Manager Dashboard</h1>
        <p className="text-muted-foreground">Today's overview</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ShoppingCart} label="Active Orders" value={stats.pendingOrders} color="bg-primary" />
        <StatCard icon={CalendarDays} label="Today's Reservations" value={stats.todayReservations} color="bg-blue-600" />
        <StatCard icon={Star} label="Pending Reviews" value={stats.pendingReviews} color="bg-accent" />
        <StatCard icon={MessageSquare} label="Unread Messages" value={stats.messages} color="bg-purple-600" />
      </div>
    </motion.div>
  );
};

export default ManagerOverview;
