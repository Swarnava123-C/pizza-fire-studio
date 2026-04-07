import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Plus, Check, X, Edit2, Save } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type MenuItem = Tables<"menu_items">;
type Reservation = Tables<"reservations">;
type Contact = Tables<"contact_submissions">;

const categories = ["Pizzas", "Burgers", "Pasta", "Beverages", "Desserts"];

const AdminPage = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <main className="pt-24 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </main>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <main className="pt-24 pb-20">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-4xl md:text-5xl gradient-text mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground mb-8">Manage your restaurant</p>

          <Tabs defaultValue="menu" className="space-y-6">
            <TabsList className="bg-secondary border border-border">
              <TabsTrigger value="menu">Menu</TabsTrigger>
              <TabsTrigger value="reservations">Reservations</TabsTrigger>
              <TabsTrigger value="contacts">Messages</TabsTrigger>
            </TabsList>

            <TabsContent value="menu"><MenuManager /></TabsContent>
            <TabsContent value="reservations"><ReservationManager /></TabsContent>
            <TabsContent value="contacts"><ContactManager /></TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </main>
  );
};

// ─── Menu Manager ─────────────────────────────────────────
const MenuManager = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from("menu_items").select("*").order("category").order("name");
    if (data) setItems(data);
  };
  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    await supabase.from("menu_items").delete().eq("id", id);
    toast.success("Deleted");
    load();
  };

  const toggleField = async (id: string, field: "featured" | "chef_recommended", current: boolean) => {
    const update = field === "featured" ? { featured: !current } : { chef_recommended: !current };
    await supabase.from("menu_items").update(update).eq("id", id);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-2xl text-foreground">Menu Items ({items.length})</h2>
        <Button onClick={() => setShowAdd(!showAdd)} className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-1" /> Add Item
        </Button>
      </div>

      {showAdd && <MenuItemForm onSave={() => { setShowAdd(false); load(); }} onCancel={() => setShowAdd(false)} />}

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="glass-card p-4">
            {editId === item.id ? (
              <MenuItemForm item={item} onSave={() => { setEditId(null); load(); }} onCancel={() => setEditId(null)} />
            ) : (
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-foreground">{item.name}</span>
                    <Badge variant="outline" className="text-xs">{item.category}</Badge>
                    {item.featured && <Badge className="bg-accent text-accent-foreground text-xs">Featured</Badge>}
                    {item.chef_recommended && <Badge className="bg-primary text-primary-foreground text-xs">Chef's Pick</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{item.description}</p>
                </div>
                <span className="font-display text-xl text-primary">₹{item.price}</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => toggleField(item.id, "featured", item.featured)}>
                    {item.featured ? "Unfeature" : "Feature"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setEditId(item.id)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const MenuItemForm = ({ item, onSave, onCancel }: { item?: MenuItem; onSave: () => void; onCancel: () => void }) => {
  const [name, setName] = useState(item?.name ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [price, setPrice] = useState(item?.price?.toString() ?? "");
  const [category, setCategory] = useState(item?.category ?? "Pizzas");
  const [featured, setFeatured] = useState(item?.featured ?? false);
  const [chefRec, setChefRec] = useState(item?.chef_recommended ?? false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name || !price) return toast.error("Name and price are required");
    setSaving(true);
    const payload = { name, description, price: parseInt(price), category, featured, chef_recommended: chefRec };

    if (item) {
      await supabase.from("menu_items").update(payload).eq("id", item.id);
      toast.success("Updated");
    } else {
      await supabase.from("menu_items").insert(payload);
      toast.success("Added");
    }
    setSaving(false);
    onSave();
  };

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="grid sm:grid-cols-3 gap-3">
        <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="bg-background border-border" />
        <Input placeholder="Price (₹)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="bg-background border-border" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground">
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="bg-background border-border" rows={2} />
      <div className="flex gap-4 items-center">
        <label className="flex items-center gap-2 text-sm text-foreground">
          <Checkbox checked={featured} onCheckedChange={(v) => setFeatured(!!v)} /> Featured
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <Checkbox checked={chefRec} onCheckedChange={(v) => setChefRec(!!v)} /> Chef's Pick
        </label>
        <div className="flex-1" />
        <Button variant="ghost" size="sm" onClick={onCancel}><X className="w-4 h-4" /></Button>
        <Button size="sm" disabled={saving} onClick={handleSave} className="bg-primary text-primary-foreground">
          <Save className="w-4 h-4 mr-1" /> Save
        </Button>
      </div>
    </div>
  );
};

// ─── Reservation Manager ──────────────────────────────────
const ReservationManager = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const load = async () => {
    const { data } = await supabase.from("reservations").select("*").order("created_at", { ascending: false });
    if (data) setReservations(data);
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("reservations").update({ status }).eq("id", id);
    toast.success(`Marked as ${status}`);
    load();
  };

  const statusColor = (s: string) => {
    if (s === "confirmed") return "bg-green-600/20 text-green-400";
    if (s === "completed") return "bg-blue-600/20 text-blue-400";
    if (s === "cancelled") return "bg-destructive/20 text-destructive";
    return "bg-accent/20 text-accent";
  };

  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl text-foreground">Reservations ({reservations.length})</h2>
      {reservations.length === 0 && <p className="text-muted-foreground">No reservations yet.</p>}
      {reservations.map((r) => (
        <div key={r.id} className="glass-card p-5 space-y-3">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <div className="font-semibold text-foreground text-lg">{r.name}</div>
              <div className="text-sm text-muted-foreground">{r.email} · {r.phone}</div>
            </div>
            <Badge className={statusColor(r.status)}>{r.status}</Badge>
          </div>
          <div className="grid sm:grid-cols-3 gap-2 text-sm">
            <div><span className="text-muted-foreground">Date:</span> <span className="text-foreground">{r.reservation_date}</span></div>
            <div><span className="text-muted-foreground">Time:</span> <span className="text-foreground">{r.time_slot}</span></div>
            <div><span className="text-muted-foreground">Guests:</span> <span className="text-foreground">{r.guests}</span></div>
          </div>
          {r.food_preferences && (
            <div className="text-sm"><span className="text-muted-foreground">Food preferences:</span> <span className="text-foreground">{r.food_preferences}</span></div>
          )}
          {r.instructions && (
            <div className="text-sm"><span className="text-muted-foreground">Instructions:</span> <span className="text-foreground">{r.instructions}</span></div>
          )}
          <div className="flex gap-2 flex-wrap">
            {r.status === "pending" && (
              <>
                <Button size="sm" onClick={() => updateStatus(r.id, "confirmed")} className="bg-green-600/20 text-green-400 hover:bg-green-600/30">
                  <Check className="w-4 h-4 mr-1" /> Confirm
                </Button>
                <Button size="sm" variant="ghost" onClick={() => updateStatus(r.id, "cancelled")} className="text-destructive">
                  <X className="w-4 h-4 mr-1" /> Cancel
                </Button>
              </>
            )}
            {r.status === "confirmed" && (
              <Button size="sm" onClick={() => updateStatus(r.id, "completed")} className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/30">
                <Check className="w-4 h-4 mr-1" /> Complete
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Contact Manager ──────────────────────────────────────
const ContactManager = () => {
  const [messages, setMessages] = useState<Contact[]>([]);

  const load = async () => {
    const { data } = await supabase.from("contact_submissions").select("*").order("created_at", { ascending: false });
    if (data) setMessages(data);
  };
  useEffect(() => { load(); }, []);

  const toggleResolved = async (id: string, current: boolean) => {
    await supabase.from("contact_submissions").update({ resolved: !current }).eq("id", id);
    load();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("contact_submissions").delete().eq("id", id);
    toast.success("Deleted");
    load();
  };

  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl text-foreground">Messages ({messages.length})</h2>
      {messages.length === 0 && <p className="text-muted-foreground">No messages yet.</p>}
      {messages.map((m) => (
        <div key={m.id} className={`glass-card p-5 ${m.resolved ? "opacity-60" : ""}`}>
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <div className="font-semibold text-foreground">{m.name}</div>
              <div className="text-sm text-muted-foreground">{m.email}</div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => toggleResolved(m.id, m.resolved)}>
                {m.resolved ? "Unresolve" : "Resolve"}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(m.id)} className="text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-foreground leading-relaxed">{m.message}</p>
          <div className="text-xs text-muted-foreground mt-2">{new Date(m.created_at).toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
};

export default AdminPage;
