import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag, CreditCard } from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const CartPage = () => {
  const { items, updateQuantity, removeItem, clearCart, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<"cart" | "checkout">("cart");
  const [form, setForm] = useState({
    name: "",
    email: user?.email || "",
    phone: "",
    delivery_type: "pickup" as "pickup" | "delivery",
    delivery_address: "",
    notes: "",
    coupon_code: "",
  });
  const [discount, setDiscount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const applyCoupon = async () => {
    if (!form.coupon_code) return;
    const { data } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", form.coupon_code.toUpperCase())
      .eq("is_active", true)
      .single();

    if (!data) return toast.error("Invalid coupon code");
    if (data.expires_at && new Date(data.expires_at) < new Date()) return toast.error("Coupon expired");
    if (data.max_uses && data.used_count >= data.max_uses) return toast.error("Coupon usage limit reached");

    const discountAmount = Math.round(total * (data.discount_percent / 100));
    setDiscount(discountAmount);
    toast.success(`${data.discount_percent}% discount applied! You save ₹${discountAmount}`);
  };

  const createOrderInDB = async () => {
    const orderId = crypto.randomUUID();
    const finalTotal = total - discount;

    const { error } = await supabase.from("orders").insert({
      id: orderId,
      user_id: user?.id || null,
      customer_name: form.name,
      customer_email: form.email,
      customer_phone: form.phone,
      delivery_type: form.delivery_type,
      delivery_address: form.delivery_address || null,
      subtotal: total,
      discount,
      total: finalTotal,
      coupon_code: form.coupon_code || null,
      notes: form.notes || null,
    });

    if (error) throw new Error("Failed to create order");

    const orderItems = items.map((item) => ({
      order_id: orderId,
      menu_item_id: item.id,
      item_name: item.name,
      quantity: item.quantity,
      price: item.price,
    }));
    await supabase.from("order_items").insert(orderItems);

    return { orderId, finalTotal };
  };

  const handleCODOrder = async () => {
    if (!form.name || !form.email || !form.phone) return toast.error("Please fill all required fields");
    if (form.delivery_type === "delivery" && !form.delivery_address) return toast.error("Please enter delivery address");

    setSubmitting(true);
    try {
      const { orderId } = await createOrderInDB();
      clearCart();
      toast.success("Order placed successfully!");
      navigate(`/order/${orderId}`);
    } catch {
      toast.error("Failed to place order");
    }
    setSubmitting(false);
  };

  const handleRazorpayOrder = async () => {
    if (!form.name || !form.email || !form.phone) return toast.error("Please fill all required fields");
    if (form.delivery_type === "delivery" && !form.delivery_address) return toast.error("Please enter delivery address");

    setSubmitting(true);
    try {
      const { orderId, finalTotal } = await createOrderInDB();

      // Create Razorpay order
      const { data: rpOrder, error: rpError } = await supabase.functions.invoke("create-razorpay-order", {
        body: { amount: finalTotal, receipt: orderId },
      });

      if (rpError || !rpOrder?.order_id) {
        toast.error("Failed to initiate payment");
        setSubmitting(false);
        return;
      }

      // Load Razorpay script if not loaded
      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve();
          script.onerror = () => reject();
          document.body.appendChild(script);
        });
      }

      const options = {
        key: rpOrder.key_id,
        amount: rpOrder.amount,
        currency: rpOrder.currency,
        name: "PizzaFast",
        description: `Order #${orderId.slice(0, 8)}`,
        order_id: rpOrder.order_id,
        handler: async (response: any) => {
          // Verify payment
          const { data: verifyData } = await supabase.functions.invoke("verify-razorpay-payment", {
            body: {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: orderId,
            },
          });
          if (verifyData?.verified) {
            clearCart();
            toast.success("Payment successful! Order confirmed.");
            navigate(`/order/${orderId}`);
          } else {
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },
        theme: { color: "#E8642B" },
        modal: {
          ondismiss: () => {
            toast.info("Payment cancelled. Your order is saved — you can pay later.");
            navigate(`/order/${orderId}`);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error("Failed to process payment");
    }
    setSubmitting(false);
  };

  if (items.length === 0 && step === "cart") {
    return (
      <main className="pt-24 pb-20 min-h-screen">
        <div className="container mx-auto px-4 text-center py-20">
          <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-display text-3xl text-foreground mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Add some delicious items from our menu!</p>
          <Link to="/menu">
            <Button className="bg-primary text-primary-foreground">Browse Menu</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-24 pb-20 min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {step === "cart" ? (
            <>
              <h1 className="font-display text-4xl gradient-text mb-6">Your Cart</h1>
              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="glass-card p-4 flex items-center gap-4">
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">₹{item.price} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="w-8 h-8" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center text-foreground font-semibold">{item.quantity}</span>
                      <Button variant="outline" size="icon" className="w-8 h-8" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <span className="font-display text-lg text-primary w-20 text-right">₹{item.price * item.quantity}</span>
                    <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="glass-card p-5 space-y-3">
                <div className="flex justify-between text-foreground">
                  <span>Subtotal</span>
                  <span className="font-display text-xl">₹{total}</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Coupon code"
                    value={form.coupon_code}
                    onChange={(e) => setForm({ ...form, coupon_code: e.target.value })}
                    className="bg-background border-border"
                  />
                  <Button variant="outline" onClick={applyCoupon}>Apply</Button>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-foreground font-semibold text-lg border-t border-border pt-3">
                  <span>Total</span>
                  <span className="font-display text-2xl text-primary">₹{total - discount}</span>
                </div>
                <Button className="w-full bg-primary text-primary-foreground text-lg py-6" onClick={() => setStep("checkout")}>
                  Proceed to Checkout
                </Button>
              </div>
            </>
          ) : (
            <>
              <button onClick={() => setStep("cart")} className="flex items-center gap-1 text-muted-foreground hover:text-foreground mb-4">
                <ArrowLeft className="w-4 h-4" /> Back to cart
              </button>
              <h1 className="font-display text-4xl gradient-text mb-6">Checkout</h1>
              <div className="glass-card p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input placeholder="Full Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-background border-border" />
                  <Input placeholder="Email *" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-background border-border" />
                  <Input placeholder="Phone *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-background border-border" />
                  <select
                    value={form.delivery_type}
                    onChange={(e) => setForm({ ...form, delivery_type: e.target.value as "pickup" | "delivery" })}
                    className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground"
                  >
                    <option value="pickup">Pickup</option>
                    <option value="delivery">Delivery</option>
                  </select>
                </div>
                {form.delivery_type === "delivery" && (
                  <Textarea placeholder="Delivery Address *" value={form.delivery_address} onChange={(e) => setForm({ ...form, delivery_address: e.target.value })} className="bg-background border-border" />
                )}
                <Textarea placeholder="Special instructions (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="bg-background border-border" rows={2} />

                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{items.reduce((s, i) => s + i.quantity, 0)} items</span>
                    <span>₹{total}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-400">
                      <span>Discount</span>
                      <span>-₹{discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-foreground text-lg">
                    <span>Total</span>
                    <span className="font-display text-primary">₹{total - discount}</span>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <Button
                    className="w-full bg-primary text-primary-foreground py-6"
                    onClick={handleRazorpayOrder}
                    disabled={submitting}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    {submitting ? "Processing..." : "Pay with Razorpay"}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full py-6 border-border"
                    onClick={handleCODOrder}
                    disabled={submitting}
                  >
                    {submitting ? "Placing..." : "Cash on Delivery"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </main>
  );
};

export default CartPage;
