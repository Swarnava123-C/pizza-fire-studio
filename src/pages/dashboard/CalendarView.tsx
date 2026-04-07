import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Reservation {
  id: string;
  name: string;
  guests: number;
  time_slot: string;
  status: string;
  reservation_date: string;
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

const CalendarView = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("reservations").select("id, name, guests, time_slot, status, reservation_date");
      if (data) setReservations(data as Reservation[]);
    };
    load();
  }, []);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const reservationsByDate = useMemo(() => {
    const map: Record<string, Reservation[]> = {};
    reservations.forEach((r) => {
      if (!map[r.reservation_date]) map[r.reservation_date] = [];
      map[r.reservation_date].push(r);
    });
    return map;
  }, [reservations]);

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const formatDate = (day: number) => {
    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${m}-${d}`;
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl gradient-text">Reservation Calendar</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}><ChevronLeft className="w-4 h-4" /></Button>
          <span className="font-display text-lg text-foreground min-w-[160px] text-center">
            {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </span>
          <Button variant="outline" size="icon" onClick={nextMonth}><ChevronRight className="w-4 h-4" /></Button>
        </div>
      </div>

      <div className="glass-card p-4">
        <div className="grid grid-cols-7 gap-1">
          {dayNames.map((d) => (
            <div key={d} className="text-center text-xs text-muted-foreground font-semibold py-2">{d}</div>
          ))}
          {blanks.map((b) => <div key={`blank-${b}`} />)}
          {days.map((day) => {
            const dateStr = formatDate(day);
            const dayReservations = reservationsByDate[dateStr] || [];
            const isToday = dateStr === today;

            return (
              <div
                key={day}
                className={`min-h-[80px] rounded-lg p-1 border transition-colors ${
                  isToday ? "border-primary/50 bg-primary/5" : "border-border/30 hover:border-border"
                }`}
              >
                <div className={`text-xs font-semibold mb-1 ${isToday ? "text-primary" : "text-foreground"}`}>{day}</div>
                <div className="space-y-0.5">
                  {dayReservations.slice(0, 3).map((r) => (
                    <div key={r.id} className={`text-[9px] px-1 py-0.5 rounded truncate ${statusColor(r.status)}`}>
                      {r.time_slot} · {r.name}
                    </div>
                  ))}
                  {dayReservations.length > 3 && (
                    <div className="text-[9px] text-muted-foreground text-center">+{dayReservations.length - 3} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default CalendarView;
