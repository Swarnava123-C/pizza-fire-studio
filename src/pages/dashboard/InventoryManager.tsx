import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Save, Trash2, AlertTriangle, X } from "lucide-react";

interface InventoryItem {
  id: string;
  ingredient_name: string;
  quantity: number;
  unit: string;
  low_stock_threshold: number;
  is_low_stock: boolean;
}

const InventoryManager = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ ingredient_name: "", quantity: "", unit: "kg", low_stock_threshold: "5" });

  const load = async () => {
    const { data } = await supabase.from("inventory").select("*").order("ingredient_name");
    if (data) setItems(data as InventoryItem[]);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!newItem.ingredient_name) return toast.error("Name required");
    const qty = parseFloat(newItem.quantity) || 0;
    const threshold = parseFloat(newItem.low_stock_threshold) || 5;
    await supabase.from("inventory").insert({
      ingredient_name: newItem.ingredient_name,
      quantity: qty,
      unit: newItem.unit,
      low_stock_threshold: threshold,
      is_low_stock: qty <= threshold,
    });
    toast.success("Added");
    setNewItem({ ingredient_name: "", quantity: "", unit: "kg", low_stock_threshold: "5" });
    setShowAdd(false);
    load();
  };

  const updateQty = async (id: string, quantity: number, threshold: number) => {
    await supabase.from("inventory").update({ quantity, is_low_stock: quantity <= threshold }).eq("id", id);
    load();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("inventory").delete().eq("id", id);
    toast.success("Deleted");
    load();
  };

  const lowStockCount = items.filter((i) => i.is_low_stock).length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="font-display text-3xl gradient-text">Inventory</h1>
          {lowStockCount > 0 && (
            <div className="flex items-center gap-1 text-yellow-400 text-sm mt-1">
              <AlertTriangle className="w-4 h-4" /> {lowStockCount} item(s) low on stock
            </div>
          )}
        </div>
        <Button onClick={() => setShowAdd(!showAdd)} className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-1" /> Add Item
        </Button>
      </div>

      {showAdd && (
        <div className="glass-card p-4 space-y-3">
          <div className="grid sm:grid-cols-4 gap-3">
            <Input placeholder="Ingredient" value={newItem.ingredient_name} onChange={(e) => setNewItem({ ...newItem, ingredient_name: e.target.value })} className="bg-background border-border" />
            <Input placeholder="Quantity" type="number" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })} className="bg-background border-border" />
            <Input placeholder="Unit" value={newItem.unit} onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })} className="bg-background border-border" />
            <Input placeholder="Low threshold" type="number" value={newItem.low_stock_threshold} onChange={(e) => setNewItem({ ...newItem, low_stock_threshold: e.target.value })} className="bg-background border-border" />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)}><X className="w-4 h-4" /></Button>
            <Button size="sm" onClick={handleAdd} className="bg-primary text-primary-foreground"><Save className="w-4 h-4 mr-1" /> Save</Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className={`glass-card p-4 flex items-center gap-4 flex-wrap ${item.is_low_stock ? "border-yellow-500/30" : ""}`}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">{item.ingredient_name}</span>
                {item.is_low_stock && <Badge className="bg-yellow-600/20 text-yellow-400 text-xs">Low Stock</Badge>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={item.quantity}
                onChange={(e) => updateQty(item.id, parseFloat(e.target.value) || 0, item.low_stock_threshold)}
                className="w-20 bg-background border-border text-center"
              />
              <span className="text-sm text-muted-foreground">{item.unit}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default InventoryManager;
