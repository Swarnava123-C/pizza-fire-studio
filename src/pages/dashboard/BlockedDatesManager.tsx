import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, CalendarOff } from "lucide-react";

interface BlockedDate {
  id: string;
  blocked_date: string;
  reason: string;
}

const BlockedDatesManager = () => {
  const [dates, setDates] = useState<BlockedDate[]>([]);
  const [newDate, setNewDate] = useState("");
  const [newReason, setNewReason] = useState("");

  const load = async () => {
    const { data } = await supabase.from("blocked_dates").select("*").order("blocked_date");
    if (data) setDates(data as BlockedDate[]);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!newDate) return toast.error("Select a date");
    const { error } = await supabase.from("blocked_dates").insert({ blocked_date: newDate, reason: newReason });
    if (error) return toast.error(error.message.includes("duplicate") ? "Date already blocked" : "Failed");
    toast.success("Date blocked");
    setNewDate("");
    setNewReason("");
    load();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("blocked_dates").delete().eq("id", id);
    toast.success("Date unblocked");
    load();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <h1 className="font-display text-3xl gradient-text">Blocked Dates</h1>
      <p className="text-muted-foreground text-sm">Block dates to prevent reservations (e.g., holidays, private events).</p>

      <div className="glass-card p-4">
        <div className="flex gap-3 flex-wrap">
          <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="bg-background border-border w-auto" />
          <Input placeholder="Reason (optional)" value={newReason} onChange={(e) => setNewReason(e.target.value)} className="bg-background border-border flex-1" />
          <Button onClick={handleAdd} className="bg-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-1" /> Block Date
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {dates.map((d) => (
          <div key={d.id} className="glass-card p-4 flex items-center gap-4">
            <CalendarOff className="w-5 h-5 text-destructive" />
            <div className="flex-1">
              <span className="text-foreground font-medium">{d.blocked_date}</span>
              {d.reason && <span className="text-muted-foreground ml-2">— {d.reason}</span>}
            </div>
            <Button variant="ghost" size="sm" onClick={() => handleDelete(d.id)} className="text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        {dates.length === 0 && <p className="text-muted-foreground">No blocked dates.</p>}
      </div>
    </motion.div>
  );
};

export default BlockedDatesManager;
