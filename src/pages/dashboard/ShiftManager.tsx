import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, X, Clock } from "lucide-react";

interface Shift {
  id: string;
  user_id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  responsibilities: string;
}

const ShiftManager = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [staffList, setStaffList] = useState<{ user_id: string }[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newShift, setNewShift] = useState({
    user_id: "", shift_date: new Date().toISOString().split("T")[0],
    start_time: "09:00", end_time: "17:00", responsibilities: "",
  });

  const load = async () => {
    const { data } = await supabase.from("staff_shifts").select("*").order("shift_date", { ascending: false });
    if (data) setShifts(data as Shift[]);
  };

  useEffect(() => {
    load();
    supabase.from("user_roles").select("user_id").eq("role", "staff").then(({ data }) => {
      if (data) setStaffList(data);
    });
  }, []);

  const handleAdd = async () => {
    if (!newShift.user_id) return toast.error("Select a staff member");
    await supabase.from("staff_shifts").insert({
      user_id: newShift.user_id,
      shift_date: newShift.shift_date,
      start_time: newShift.start_time,
      end_time: newShift.end_time,
      responsibilities: newShift.responsibilities,
    });
    toast.success("Shift assigned");
    setShowAdd(false);
    setNewShift({ user_id: "", shift_date: new Date().toISOString().split("T")[0], start_time: "09:00", end_time: "17:00", responsibilities: "" });
    load();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("staff_shifts").delete().eq("id", id);
    toast.success("Shift removed");
    load();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="font-display text-3xl gradient-text">Staff Shifts</h1>
        <Button onClick={() => setShowAdd(!showAdd)} className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-1" /> Assign Shift
        </Button>
      </div>

      {showAdd && (
        <div className="glass-card p-4 space-y-3">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <select
              value={newShift.user_id}
              onChange={(e) => setNewShift({ ...newShift, user_id: e.target.value })}
              className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground"
            >
              <option value="">Select Staff</option>
              {staffList.map((s) => (
                <option key={s.user_id} value={s.user_id}>{s.user_id.slice(0, 8)}...</option>
              ))}
            </select>
            <Input type="date" value={newShift.shift_date} onChange={(e) => setNewShift({ ...newShift, shift_date: e.target.value })} className="bg-background border-border" />
            <Input type="time" value={newShift.start_time} onChange={(e) => setNewShift({ ...newShift, start_time: e.target.value })} className="bg-background border-border" />
            <Input type="time" value={newShift.end_time} onChange={(e) => setNewShift({ ...newShift, end_time: e.target.value })} className="bg-background border-border" />
            <Input placeholder="Responsibilities" value={newShift.responsibilities} onChange={(e) => setNewShift({ ...newShift, responsibilities: e.target.value })} className="bg-background border-border" />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)}><X className="w-4 h-4" /></Button>
            <Button size="sm" onClick={handleAdd} className="bg-primary text-primary-foreground"><Save className="w-4 h-4 mr-1" /> Save</Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {shifts.map((shift) => (
          <div key={shift.id} className="glass-card p-4 flex items-center gap-4 flex-wrap">
            <Clock className="w-5 h-5 text-primary" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-mono text-muted-foreground">{shift.user_id.slice(0, 8)}...</div>
              <div className="text-sm text-foreground">{shift.responsibilities || "General duties"}</div>
            </div>
            <Badge variant="outline">{shift.shift_date}</Badge>
            <span className="text-sm text-foreground">{shift.start_time} - {shift.end_time}</span>
            <Button variant="ghost" size="sm" onClick={() => handleDelete(shift.id)} className="text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        {shifts.length === 0 && <p className="text-muted-foreground">No shifts assigned.</p>}
      </div>
    </motion.div>
  );
};

export default ShiftManager;
