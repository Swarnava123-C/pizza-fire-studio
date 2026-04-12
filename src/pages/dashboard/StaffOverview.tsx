import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ShoppingCart, CalendarDays, Clock, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DashboardLoading, DashboardError } from "@/components/DashboardStates";

const StatCard = ({ icon: Icon, label, value, color }: { icon: typeof ShoppingCart; label: string; value: string | number; color: string }) => (
  <div className="glass-card p-5 transition-transform hover:scale-[1.02]">
    <div className="flex items-center gap-3">
      <div className={`p-2.5 rounded-lg ${color}`}><Icon className="w-5 h-5 text-white" /></div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-display text-foreground">{value}</p>
      </div>
    </div>
  </div>
);

interface Shift { shift_date: string; start_time: string; end_time: string; responsibilities: string; }

const StaffOverview = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ activeOrders: 0, todayBookings: 0, assignedOrders: 0 });
  const [todayShift, setTodayShift] = useState<Shift | null>(null);
  const [lowStockItems, setLowStockItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const today = new Date().toISOString().split("T")[0];
      const [orders, reservations, inventoryRes] = await Promise.all([
        supabase.from("orders").select("id, assigned_staff_id", { count: "exact" }).in("status", ["pending", "preparing", "ready"]),
        supabase.from("reservations").select("id", { count: "exact" }).eq("reservation_date", today),
        supabase.from("inventory").select("ingredient_name").eq("is_low_stock", true),
      ]);
      if (orders.error) throw orders.error;

      const assignedCount = (orders.data || []).filter((o: Record<string, unknown>) => o.assigned_staff_id === user?.id).length;
      setStats({ activeOrders: orders.count || 0, todayBookings: reservations.count || 0, assignedOrders: assignedCount });
      setLowStockItems((inventoryRes.data || []).map((i) => i.ingredient_name));

      if (user?.id) {
        const { data: shifts } = await supabase.from("staff_shifts").select("shift_date, start_time, end_time, responsibilities").eq("user_id", user.id).eq("shift_date", today).limit(1);
        if (shifts && shifts.length > 0) setTodayShift(shifts[0] as Shift);
      }
    } catch (e: any) {
      setError(e.message || "Failed to load data");
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [user?.id]);

  if (loading) return <DashboardLoading count={3} />;
  if (error) return <DashboardError message={error} onRetry={load} />;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="font-display text-3xl md:text-4xl gradient-text">Staff Dashboard</h1>
        <p className="text-muted-foreground">Your assignments today</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={ShoppingCart} label="Active Orders" value={stats.activeOrders} color="bg-primary" />
        <StatCard icon={CalendarDays} label="Today's Bookings" value={stats.todayBookings} color="bg-blue-600" />
        <StatCard icon={ShoppingCart} label="My Assigned" value={stats.assignedOrders} color="bg-green-600" />
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-5 h-5 text-primary" />
          <h2 className="font-display text-xl text-foreground">Today's Shift</h2>
        </div>
        {todayShift ? (
          <div className="space-y-2">
            <div className="flex gap-4 text-sm">
              <span className="text-muted-foreground">Time:</span>
              <span className="text-foreground font-medium">{todayShift.start_time} - {todayShift.end_time}</span>
            </div>
            {todayShift.responsibilities && (
              <div className="text-sm">
                <span className="text-muted-foreground">Responsibilities:</span>
                <span className="text-foreground ml-2">{todayShift.responsibilities}</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No shift assigned for today.</p>
        )}
      </div>

      {lowStockItems.length > 0 && (
        <div className="glass-card p-5 border-yellow-500/30">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-5 h-5 text-yellow-400" />
            <h2 className="font-display text-xl text-foreground">Low Stock Alerts</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStockItems.map((item) => (
              <Badge key={item} className="bg-yellow-600/20 text-yellow-400">{item}</Badge>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default StaffOverview;
