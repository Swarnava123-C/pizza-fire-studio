import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChefHat, Truck, Check, X } from "lucide-react";

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
}

const statusFlow: Record<string, string> = {
  pending: "preparing",
  preparing: "ready",
  ready: "completed",
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

  const load = async () => {
    let query = supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (filter === "active") {
      query = query.in("status", ["pending", "preparing", "ready"]);
    }
    const { data } = await query;
    if (data) setOrders(data as Order[]);
  };

  useEffect(() => { load(); }, [filter]);

  // Subscribe to realtime
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

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="font-display text-3xl gradient-text">Orders</h1>
        <div className="flex gap-2">
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
              <div className="flex gap-2">
                <Badge className={statusColor(order.status)}>{order.status}</Badge>
                <Badge variant="outline">{order.delivery_type}</Badge>
                <Badge variant={order.payment_status === "paid" ? "default" : "outline"} className={order.payment_status === "paid" ? "bg-green-600/20 text-green-400" : ""}>
                  {order.payment_status}
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-display text-xl text-primary">₹{order.total}</span>
              <div className="flex gap-2">
                {statusFlow[order.status] && (
                  <Button size="sm" onClick={() => updateStatus(order.id, statusFlow[order.status])} className="bg-primary text-primary-foreground">
                    {order.status === "pending" && <><ChefHat className="w-4 h-4 mr-1" /> Start Preparing</>}
                    {order.status === "preparing" && <><Truck className="w-4 h-4 mr-1" /> Mark Ready</>}
                    {order.status === "ready" && <><Check className="w-4 h-4 mr-1" /> Complete</>}
                  </Button>
                )}
                {order.status === "pending" && (
                  <Button size="sm" variant="ghost" onClick={() => updateStatus(order.id, "cancelled")} className="text-destructive">
                    <X className="w-4 h-4 mr-1" /> Cancel
                  </Button>
                )}
              </div>
            </div>
            <div className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default OrdersManager;
