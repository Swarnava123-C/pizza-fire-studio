import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface Contact {
  id: string;
  name: string;
  email: string;
  message: string;
  resolved: boolean;
  created_at: string;
}

const MessagesManager = () => {
  const [messages, setMessages] = useState<Contact[]>([]);

  const load = async () => {
    const { data } = await supabase.from("contact_submissions").select("*").order("created_at", { ascending: false });
    if (data) setMessages(data as Contact[]);
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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <h1 className="font-display text-3xl gradient-text">Messages ({messages.length})</h1>

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
    </motion.div>
  );
};

export default MessagesManager;
