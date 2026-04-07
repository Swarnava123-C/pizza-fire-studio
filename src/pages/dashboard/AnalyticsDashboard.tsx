import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const COLORS = ["hsl(18, 90%, 55%)", "hsl(35, 100%, 50%)", "hsl(210, 80%, 55%)", "hsl(150, 60%, 45%)", "hsl(280, 60%, 55%)"];

const AnalyticsDashboard = () => {
  const [revenueData, setRevenueData] = useState<{ name: string; revenue: number }[]>([]);
  const [ordersByStatus, setOrdersByStatus] = useState<{ name: string; value: number }[]>([]);
  const [reservationTrend, setReservationTrend] = useState<{ date: string; count: number }[]>([]);

  useEffect(() => {
    const load = async () => {
      // Orders for revenue
      const { data: orders } = await supabase.from("orders").select("total, status, created_at");
      if (orders) {
        // Monthly revenue
        const monthly: Record<string, number> = {};
        orders.forEach((o) => {
          const month = new Date(o.created_at).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
          monthly[month] = (monthly[month] || 0) + (o.total || 0);
        });
        setRevenueData(Object.entries(monthly).map(([name, revenue]) => ({ name, revenue })));

        // Orders by status
        const statusCounts: Record<string, number> = {};
        orders.forEach((o) => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });
        setOrdersByStatus(Object.entries(statusCounts).map(([name, value]) => ({ name, value })));
      }

      // Reservations trend
      const { data: reservations } = await supabase.from("reservations").select("reservation_date");
      if (reservations) {
        const dateCounts: Record<string, number> = {};
        reservations.forEach((r) => { dateCounts[r.reservation_date] = (dateCounts[r.reservation_date] || 0) + 1; });
        const sorted = Object.entries(dateCounts).sort().slice(-14);
        setReservationTrend(sorted.map(([date, count]) => ({ date, count })));
      }
    };
    load();
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <h1 className="font-display text-3xl gradient-text">Analytics</h1>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="glass-card p-5">
          <h2 className="font-display text-xl text-foreground mb-4">Monthly Revenue</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 18%)" />
              <XAxis dataKey="name" stroke="hsl(0, 0%, 55%)" fontSize={12} />
              <YAxis stroke="hsl(0, 0%, 55%)" fontSize={12} />
              <Tooltip contentStyle={{ background: "hsl(0, 0%, 10%)", border: "1px solid hsl(0, 0%, 18%)", borderRadius: "8px", color: "hsl(30, 10%, 92%)" }} />
              <Bar dataKey="revenue" fill="hsl(18, 90%, 55%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Orders by Status */}
        <div className="glass-card p-5">
          <h2 className="font-display text-xl text-foreground mb-4">Orders by Status</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={ordersByStatus} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {ordersByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(0, 0%, 10%)", border: "1px solid hsl(0, 0%, 18%)", borderRadius: "8px", color: "hsl(30, 10%, 92%)" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Reservation Trends */}
        <div className="glass-card p-5 lg:col-span-2">
          <h2 className="font-display text-xl text-foreground mb-4">Reservation Trends (Last 14 days)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={reservationTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 18%)" />
              <XAxis dataKey="date" stroke="hsl(0, 0%, 55%)" fontSize={12} />
              <YAxis stroke="hsl(0, 0%, 55%)" fontSize={12} />
              <Tooltip contentStyle={{ background: "hsl(0, 0%, 10%)", border: "1px solid hsl(0, 0%, 18%)", borderRadius: "8px", color: "hsl(30, 10%, 92%)" }} />
              <Line type="monotone" dataKey="count" stroke="hsl(210, 80%, 55%)" strokeWidth={2} dot={{ fill: "hsl(210, 80%, 55%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};

export default AnalyticsDashboard;
