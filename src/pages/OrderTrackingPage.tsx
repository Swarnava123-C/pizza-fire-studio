import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Clock, ChefHat, Truck, Check, ArrowLeft } from "lucide-react";

interface OrderItem {
  id: string;
  item_name: string;
  quantity: number;
  price: number;
}

const statusSteps = [
  { key: "pending", label: "Order Placed", icon: Package },
  { key: "preparing", label: "Preparing", icon: ChefHat },
  { key: "ready", label: "Ready", icon: Truck },
  { key: "completed", label: "Completed", icon: Check },
];

const OrderTrackingPage = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const { data: orderData } = await supabase.from("orders").select("*").eq("id", id).single();
      if (orderData) setOrder(orderData);
      const { data: items } = await supabase.from("order_items").select("*").eq("order_id", id);
      if (items) setOrderItems(items as OrderItem[]);
      setLoading(false);
    };
    load();

    // Realtime updates
    const channel = supabase
      .channel(`order-${id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${id}` }, (payload) => {
        setOrder(payload.new);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id]);

  if (loading) {
    return (
      <main className="pt-24 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading order...</div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="pt-24 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-3xl text-foreground mb-2">Order not found</h1>
          <Link to="/menu"><Button className="bg-primary text-primary-foreground">Back to Menu</Button></Link>
        </div>
      </main>
    );
  }

  const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <main className="pt-24 pb-20 min-h-screen">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/menu" className="flex items-center gap-1 text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Menu
          </Link>

          <h1 className="font-display text-4xl gradient-text mb-2">Order Tracking</h1>
          <p className="text-muted-foreground text-sm mb-6">Order ID: {order.id.slice(0, 8)}...</p>

          {/* Status Progress */}
          {!isCancelled ? (
            <div className="glass-card p-6 mb-6">
              <div className="flex items-center justify-between relative">
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" />
                <div className="absolute top-5 left-0 h-0.5 bg-primary transition-all" style={{ width: `${Math.max(0, currentStepIndex) / (statusSteps.length - 1) * 100}%` }} />
                {statusSteps.map((step, i) => {
                  const Icon = step.icon;
                  const isActive = i <= currentStepIndex;
                  return (
                    <div key={step.key} className="relative z-10 flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-xs mt-2 ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}`}>{step.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="glass-card p-6 mb-6 border-destructive/30">
              <Badge className="bg-destructive/20 text-destructive text-sm">Order Cancelled</Badge>
            </div>
          )}

          {/* Order Details */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Delivery Type</span>
              <Badge variant="outline" className="capitalize">{order.delivery_type}</Badge>
            </div>
            <div className="border-t border-border pt-4 space-y-2">
              {orderItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-foreground">{item.item_name} × {item.quantity}</span>
                  <span className="text-muted-foreground">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-3 space-y-1">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span><span>₹{order.subtotal}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-green-400">
                  <span>Discount</span><span>-₹{order.discount}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-foreground text-lg">
                <span>Total</span><span className="font-display text-primary">₹{order.total}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default OrderTrackingPage;
