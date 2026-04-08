import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, Users, Clock, ShoppingCart } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
} from "recharts";

const COLORS = ["hsl(18,90%,55%)", "hsl(35,100%,50%)", "hsl(210,80%,55%)", "hsl(150,60%,45%)", "hsl(280,60%,55%)"];
const tooltipStyle = { background: "hsl(0,0%,10%)", border: "1px solid hsl(0,0%,18%)", borderRadius: "8px", color: "hsl(30,10%,92%)" };

const StatMini = ({ icon: Icon, label, value, color }: { icon: typeof TrendingUp; label: string; value: string | number; color: string }) => (
  <div className="glass-card p-4 flex items-center gap-3">
    <div className={`p-2 rounded-lg ${color}`}><Icon className="w-4 h-4 text-white" /></div>
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-display text-foreground">{value}</p>
    </div>
  </div>
);

const AnalyticsDashboard = () => {
  const [revenueData, setRevenueData] = useState<{ name: string; revenue: number }[]>([]);
  const [ordersByStatus, setOrdersByStatus] = useState<{ name: string; value: number }[]>([]);
  const [reservationTrend, setReservationTrend] = useState<{ date: string; count: number }[]>([]);
  const [topItems, setTopItems] = useState<{ name: string; count: number }[]>([]);
  const [peakHours, setPeakHours] = useState<{ hour: string; orders: number }[]>([]);
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, totalCustomers: 0, conversionRate: "0%" });

  useEffect(() => {
    const load = async () => {
      const [ordersRes, reservationsRes, orderItemsRes] = await Promise.all([
        supabase.from("orders").select("total, status, created_at, customer_email"),
        supabase.from("reservations").select("reservation_date, time_slot"),
        supabase.from("order_items").select("item_name, quantity"),
      ]);

      const orders = ordersRes.data || [];
      const reservations = reservationsRes.data || [];
      const orderItems = orderItemsRes.data || [];

      // Revenue
      const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
      const uniqueCustomers = new Set(orders.map((o) => o.customer_email)).size;
      const completedOrders = orders.filter((o) => o.status === "completed").length;
      const convRate = orders.length > 0 ? ((completedOrders / orders.length) * 100).toFixed(1) : "0";

      setStats({
        totalRevenue,
        totalOrders: orders.length,
        totalCustomers: uniqueCustomers,
        conversionRate: `${convRate}%`,
      });

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

      // Reservation trends
      const dateCounts: Record<string, number> = {};
      reservations.forEach((r) => { dateCounts[r.reservation_date] = (dateCounts[r.reservation_date] || 0) + 1; });
      const sorted = Object.entries(dateCounts).sort().slice(-14);
      setReservationTrend(sorted.map(([date, count]) => ({ date, count })));

      // Top items
      const itemCounts: Record<string, number> = {};
      orderItems.forEach((i) => { itemCounts[i.item_name] = (itemCounts[i.item_name] || 0) + i.quantity; });
      setTopItems(
        Object.entries(itemCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([name, count]) => ({ name, count }))
      );

      // Peak hours
      const hourCounts: Record<string, number> = {};
      orders.forEach((o) => {
        const h = new Date(o.created_at).getHours();
        const label = `${h.toString().padStart(2, "0")}:00`;
        hourCounts[label] = (hourCounts[label] || 0) + 1;
      });
      setPeakHours(
        Object.entries(hourCounts)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([hour, orders]) => ({ hour, orders }))
      );
    };
    load();
  }, []);

  const exportCSV = () => {
    const rows = [["Month", "Revenue"], ...revenueData.map((r) => [r.name, r.revenue.toString()])];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "revenue_report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="font-display text-3xl gradient-text">Analytics</h1>
        <Button variant="outline" size="sm" onClick={exportCSV}>
          <Download className="w-4 h-4 mr-1" /> Export CSV
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatMini icon={TrendingUp} label="Total Revenue" value={`₹${stats.totalRevenue}`} color="bg-green-600" />
        <StatMini icon={ShoppingCart} label="Total Orders" value={stats.totalOrders} color="bg-primary" />
        <StatMini icon={Users} label="Unique Customers" value={stats.totalCustomers} color="bg-blue-600" />
        <StatMini icon={Clock} label="Completion Rate" value={stats.conversionRate} color="bg-accent" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="glass-card p-5">
          <h2 className="font-display text-xl text-foreground mb-4">Monthly Revenue</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,18%)" />
              <XAxis dataKey="name" stroke="hsl(0,0%,55%)" fontSize={12} />
              <YAxis stroke="hsl(0,0%,55%)" fontSize={12} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="revenue" fill="hsl(18,90%,55%)" radius={[4, 4, 0, 0]} />
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
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Items */}
        <div className="glass-card p-5">
          <h2 className="font-display text-xl text-foreground mb-4">Most Ordered Items</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topItems} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,18%)" />
              <XAxis type="number" stroke="hsl(0,0%,55%)" fontSize={12} />
              <YAxis type="category" dataKey="name" stroke="hsl(0,0%,55%)" fontSize={11} width={100} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="hsl(35,100%,50%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Peak Hours */}
        <div className="glass-card p-5">
          <h2 className="font-display text-xl text-foreground mb-4">Peak Ordering Hours</h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={peakHours}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,18%)" />
              <XAxis dataKey="hour" stroke="hsl(0,0%,55%)" fontSize={12} />
              <YAxis stroke="hsl(0,0%,55%)" fontSize={12} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="orders" stroke="hsl(280,60%,55%)" fill="hsl(280,60%,55%)" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Reservation Trends */}
        <div className="glass-card p-5 lg:col-span-2">
          <h2 className="font-display text-xl text-foreground mb-4">Reservation Trends (Last 14 days)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={reservationTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,18%)" />
              <XAxis dataKey="date" stroke="hsl(0,0%,55%)" fontSize={12} />
              <YAxis stroke="hsl(0,0%,55%)" fontSize={12} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="count" stroke="hsl(210,80%,55%)" strokeWidth={2} dot={{ fill: "hsl(210,80%,55%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};

export default AnalyticsDashboard;
