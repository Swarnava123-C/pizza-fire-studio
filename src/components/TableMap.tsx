import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

interface RestaurantTable {
  id: string;
  table_number: number;
  capacity: number;
  section: string;
  status: string;
  position_x: number;
  position_y: number;
}

const sectionLabels: Record<string, string> = {
  main: "Main Hall",
  outdoor: "Outdoor",
  vip: "VIP Lounge",
  private: "Private Dining",
};

const statusColors: Record<string, { bg: string; border: string; text: string }> = {
  available: { bg: "bg-green-600/20", border: "border-green-500/40", text: "text-green-400" },
  reserved: { bg: "bg-accent/20", border: "border-accent/40", text: "text-accent" },
  occupied: { bg: "bg-destructive/20", border: "border-destructive/40", text: "text-destructive" },
};

const TableMap = ({ interactive = false, onSelect }: { interactive?: boolean; onSelect?: (tableNumber: number) => void }) => {
  const [tables, setTables] = useState<RestaurantTable[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("restaurant_tables").select("*").order("table_number");
      if (data) setTables(data as RestaurantTable[]);
    };
    load();
  }, []);

  const sections = [...new Set(tables.map((t) => t.section))];

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex gap-4 flex-wrap">
        {Object.entries(statusColors).map(([status, colors]) => (
          <div key={status} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${colors.bg} border ${colors.border}`} />
            <span className="text-sm text-muted-foreground capitalize">{status}</span>
          </div>
        ))}
      </div>

      {sections.map((section) => (
        <div key={section}>
          <h3 className="font-display text-lg text-foreground mb-3">{sectionLabels[section] || section}</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {tables.filter((t) => t.section === section).map((table) => {
              const colors = statusColors[table.status] || statusColors.available;
              return (
                <motion.button
                  key={table.id}
                  whileHover={interactive && table.status === "available" ? { scale: 1.05 } : {}}
                  whileTap={interactive && table.status === "available" ? { scale: 0.95 } : {}}
                  onClick={() => interactive && table.status === "available" && onSelect?.(table.table_number)}
                  disabled={!interactive || table.status !== "available"}
                  className={`${colors.bg} border ${colors.border} rounded-xl p-3 text-center transition-all ${
                    interactive && table.status === "available" ? "cursor-pointer hover:shadow-lg" : "cursor-default"
                  }`}
                >
                  <div className={`font-display text-xl ${colors.text}`}>T{table.table_number}</div>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Users className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{table.capacity}</span>
                  </div>
                  <Badge variant="outline" className={`text-[10px] mt-1 ${colors.text} border-current`}>
                    {table.status}
                  </Badge>
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TableMap;
