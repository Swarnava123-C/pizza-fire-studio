/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, CalendarDays } from "lucide-react";
import { DashboardLoading, DashboardEmpty, DashboardError } from "@/components/DashboardStates";

interface Reservation {
  id: string; name: string; email: string; phone: string; reservation_date: string;
  time_slot: string; guests: number; food_preferences: string | null; instructions: string | null;
  status: string; created_at: string;
}

const statusColor = (s: string) => {
  const map: Record<string, string> = {
    confirmed: "bg-green-600/20 text-green-400",
    completed: "bg-blue-600/20 text-blue-400",
    cancelled: "bg-destructive/20 text-destructive",
    pending: "bg-accent/20 text-accent",
  };
  return map[s] || "bg-muted text-muted-foreground";
};

const ReservationsManager = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase.from("reservations").select("*").order("created_at", { ascending: false });
      if (err) throw err;
      setReservations((data || []) as Reservation[]);
    } catch (e: any) {
      setError(e.message || "Failed to load reservations");
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("reservations").update({ status }).eq("id", id);
    if (error) return toast.error("Failed to update");
    toast.success(`Marked as ${status}`);
    load();
  };

  if (loading) return <DashboardLoading count={3} />;
  if (error) return <DashboardError message={error} onRetry={load} />;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <h1 className="font-display text-3xl gradient-text">Reservations ({reservations.length})</h1>

      {reservations.length === 0 ? (
        <DashboardEmpty icon={CalendarDays} title="No reservations" description="Reservations will appear here when customers book a table." />
      ) : (
        reservations.map((r) => (
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
            {r.food_preferences && <div className="text-sm"><span className="text-muted-foreground">Food preferences:</span> <span className="text-foreground">{r.food_preferences}</span></div>}
            {r.instructions && <div className="text-sm"><span className="text-muted-foreground">Instructions:</span> <span className="text-foreground">{r.instructions}</span></div>}
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
        ))
      )}
    </motion.div>
  );
};

export default ReservationsManager;
