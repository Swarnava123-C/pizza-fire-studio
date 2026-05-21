/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingCart, CalendarDays, UtensilsCrossed, TrendingUp } from "lucide-react";
import { DashboardLoading, DashboardError } from "@/components/DashboardStates";

const StatCard = ({ icon: Icon, label, value, color }: { icon: typeof ShoppingCart; label: string; value: string | number; color: string }) => (
  <div className="glass-card p-5 transition-transform hover:scale-[1.02]">
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

const AdminOverview = () => {
  const [stats, setStats] = useState({ orders: 0, reservations: 0, menuItems: 0, reviews: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [orders, reservations, menu, reviews] = await Promise.all([
        supabase.from("orders").select("total", { count: "exact" }),
        supabase.from("reservations").select("id", { count: "exact" }),
        supabase.from("menu_items").select("id", { count: "exact" }),
        supabase.from("reviews").select("id", { count: "exact" }),
      ]);
      if (orders.error) throw orders.error;
      const revenue = (orders.data || []).reduce((sum, o) => sum + (o.total || 0), 0);
      setStats({
        orders: orders.count || 0,
        reservations: reservations.count || 0,
        menuItems: menu.count || 0,
        reviews: reviews.count || 0,
        revenue,
      });
    } catch (e: any) {
      setError(e.message || "Failed to load dashboard data");
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (loading) return <DashboardLoading count={4} />;
  if (error) return <DashboardError message={error} onRetry={load} />;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="font-display text-3xl md:text-4xl gradient-text">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to the Super Admin dashboard</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp} label="Total Revenue" value={`₹${stats.revenue.toLocaleString()}`} color="bg-green-600" />
        <StatCard icon={ShoppingCart} label="Total Orders" value={stats.orders} color="bg-primary" />
        <StatCard icon={CalendarDays} label="Reservations" value={stats.reservations} color="bg-blue-600" />
        <StatCard icon={UtensilsCrossed} label="Menu Items" value={stats.menuItems} color="bg-accent" />
      </div>
    </motion.div>
  );
};

export default AdminOverview;
