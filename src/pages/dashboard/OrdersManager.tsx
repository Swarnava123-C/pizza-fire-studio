import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChefHat, Truck, Check, X, UserPlus, Download } from "lucide-react";

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_type: string;
  status: string;
  payment_status: string;
  total: number;
  notes: string | null;
  created_at: string;
  assigned_staff_id: string | null;
}

const statusFlow: Record<string, string> = {
  pending: "preparing",
  preparing: "ready",
  ready: "completed",
};

const staffStatusFlow: Record<string, string> = {
  preparing: "ready",
};

const statusColor = (s: string) => {
  const map: Record<string, string> = {
    pending: "bg-yellow-600/20 text-yellow-400",
    preparing: "bg-blue-600/20 text-blue-400",
    ready: "bg-green-600/20 text-green-400",
    completed: "bg-muted text-muted-foreground",
    cancelled: "bg-destructive/20 text-destructive",
  };
  return map[s] || "bg-muted text-muted-foreground";
};

const OrdersManager = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("active");
  const [staffList, setStaffList] = useState<{ user_id: string }[]>([]);
  const { role, user } = useAuth();

  const isStaff = role === "staff";
  const flow = isStaff ? staffStatusFlow : statusFlow;

  const load = async () => {
    let query = supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (filter === "active") {
      query = query.in("status", ["pending", "preparing", "ready"]);
    }
    const { data } = await query;
    if (data) setOrders(data as Order[]);
  };

  useEffect(() => { load(); }, [filter]);

  useEffect(() => {
    if (role === "admin" || role === "manager") {
      supabase.from("user_roles").select("user_id").eq("role", "staff").then(({ data }) => {
        if (data) setStaffList(data);
      });
    }
  }, [role]);

  useEffect(() => {
    const channel = supabase
      .channel("orders-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    toast.success(`Order marked as ${status}`);
    load();
  };

  const assignStaff = async (orderId: string, staffId: string) => {
    await supabase.from("orders").update({ assigned_staff_id: staffId } as Record<string, unknown>).eq("id", orderId);
    toast.success("Staff assigned");
    load();
  };

  const exportOrders = () => {
    const rows = [
      ["ID", "Customer", "Status", "Total", "Payment", "Date"],
      ...orders.map((o) => [o.id.slice(0, 8), o.customer_name, o.status, o.total.toString(), o.payment_status, new Date(o.created_at).toLocaleDateString()]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orders_report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="font-display text-3xl gradient-text">Orders</h1>
        <div className="flex gap-2">
          {!isStaff && (
            <Button variant="outline" size="sm" onClick={exportOrders}>
              <Download className="w-4 h-4 mr-1" /> Export
            </Button>
          )}
          <Button variant={filter === "active" ? "default" : "outline"} size="sm" onClick={() => setFilter("active")} className={filter === "active" ? "bg-primary text-primary-foreground" : ""}>Active</Button>
          <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")} className={filter === "all" ? "bg-primary text-primary-foreground" : ""}>All</Button>
        </div>
      </div>

      {orders.length === 0 && <p className="text-muted-foreground">No orders found.</p>}

      <div className="grid gap-3">
        {orders.map((order) => (
          <div key={order.id} className="glass-card p-5 space-y-3">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <div className="font-semibold text-foreground text-lg">{order.customer_name}</div>
                <div className="text-sm text-muted-foreground">{order.customer_email} · {order.customer_phone}</div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Badge className={statusColor(order.status)}>{order.status}</Badge>
                <Badge variant="outline">{order.delivery_type}</Badge>
                <Badge variant={order.payment_status === "paid" ? "default" : "outline"} className={order.payment_status === "paid" ? "bg-green-600/20 text-green-400" : ""}>
                  {order.payment_status}
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-display text-xl text-primary">₹{order.total}</span>
              <div className="flex gap-2 flex-wrap items-center">
                {/* Assign staff (admin/manager only) */}
                {(role === "admin" || role === "manager") && order.status !== "completed" && order.status !== "cancelled" && (
                  <select
                    value={order.assigned_staff_id || ""}
                    onChange={(e) => assignStaff(order.id, e.target.value)}
                    className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground"
                  >
                    <option value="">Assign Staff</option>
                    {staffList.map((s) => (
                      <option key={s.user_id} value={s.user_id}>{s.user_id.slice(0, 8)}...</option>
                    ))}
                  </select>
                )}

                {flow[order.status] && (
                  <Button size="sm" onClick={() => updateStatus(order.id, flow[order.status])} className="bg-primary text-primary-foreground">
                    {order.status === "pending" && <><ChefHat className="w-4 h-4 mr-1" /> Start Preparing</>}
                    {order.status === "preparing" && <><Truck className="w-4 h-4 mr-1" /> Mark Ready</>}
                    {order.status === "ready" && <><Check className="w-4 h-4 mr-1" /> Complete</>}
                  </Button>
                )}
                {order.status === "pending" && !isStaff && (
                  <Button size="sm" variant="ghost" onClick={() => updateStatus(order.id, "cancelled")} className="text-destructive">
                    <X className="w-4 h-4 mr-1" /> Cancel
                  </Button>
                )}
              </div>
            </div>
            {order.notes && <div className="text-sm text-muted-foreground">📝 {order.notes}</div>}
            <div className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default OrdersManager;
