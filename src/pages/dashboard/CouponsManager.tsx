import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, X, Save } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  discount_percent: number;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

const CouponsManager = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ code: "", discount_percent: "", max_uses: "", expires_at: "" });

  const load = async () => {
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    if (data) setCoupons(data as Coupon[]);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.code || !form.discount_percent) return toast.error("Code and discount required");
    await supabase.from("coupons").insert({
      code: form.code.toUpperCase(),
      discount_percent: parseInt(form.discount_percent),
      max_uses: form.max_uses ? parseInt(form.max_uses) : null,
      expires_at: form.expires_at || null,
    });
    toast.success("Coupon created");
    setForm({ code: "", discount_percent: "", max_uses: "", expires_at: "" });
    setShowAdd(false);
    load();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("coupons").update({ is_active: !current }).eq("id", id);
    load();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("coupons").delete().eq("id", id);
    toast.success("Deleted");
    load();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="font-display text-3xl gradient-text">Coupons & Offers</h1>
        <Button onClick={() => setShowAdd(!showAdd)} className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-1" /> Create Coupon
        </Button>
      </div>

      {showAdd && (
        <div className="glass-card p-4 space-y-3">
          <div className="grid sm:grid-cols-4 gap-3">
            <Input placeholder="Promo Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="bg-background border-border" />
            <Input placeholder="Discount %" type="number" value={form.discount_percent} onChange={(e) => setForm({ ...form, discount_percent: e.target.value })} className="bg-background border-border" />
            <Input placeholder="Max Uses (optional)" type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} className="bg-background border-border" />
            <Input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} className="bg-background border-border" />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)}><X className="w-4 h-4" /></Button>
            <Button size="sm" onClick={handleAdd} className="bg-primary text-primary-foreground"><Save className="w-4 h-4 mr-1" /> Create</Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {coupons.map((c) => (
          <div key={c.id} className={`glass-card p-4 flex items-center gap-4 flex-wrap ${!c.is_active ? "opacity-50" : ""}`}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-foreground">{c.code}</span>
                <Badge className="bg-accent/20 text-accent">{c.discount_percent}% off</Badge>
                {c.max_uses && <span className="text-xs text-muted-foreground">{c.used_count}/{c.max_uses} used</span>}
              </div>
              {c.expires_at && <span className="text-xs text-muted-foreground">Expires: {new Date(c.expires_at).toLocaleDateString()}</span>}
            </div>
            <Switch checked={c.is_active} onCheckedChange={() => toggleActive(c.id, c.is_active)} />
            <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)} className="text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default CouponsManager;
