import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, X, Edit2, Save } from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  featured: boolean;
  chef_recommended: boolean;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

const categories = ["Pizzas", "Burgers", "Pasta", "Beverages", "Desserts"];

const MenuManager = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from("menu_items").select("*").order("category").order("name");
    if (data) setItems(data as MenuItem[]);
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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="font-display text-3xl gradient-text">Menu Items ({items.length})</h1>
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
    </motion.div>
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

export default MenuManager;
