import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Trash2, Shield, Users, UserCheck } from "lucide-react";
import type { AppRole } from "@/contexts/AuthContext";

interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
}

const roleIcon: Record<string, typeof Shield> = { admin: Shield, manager: Users, staff: UserCheck };
const roleColor: Record<string, string> = {
  admin: "bg-primary/20 text-primary",
  manager: "bg-blue-600/20 text-blue-400",
  staff: "bg-green-600/20 text-green-400",
  user: "bg-muted text-muted-foreground",
};

const UsersManager = () => {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"manager" | "staff">("manager");

  const load = async () => {
    const { data } = await supabase.from("user_roles").select("*").order("role");
    if (data) setRoles(data as UserRole[]);
  };

  useEffect(() => { load(); }, []);

  const handleAddRole = async () => {
    if (!newEmail) return toast.error("Email required");
    // We need to look up user by email — but we can't query auth.users directly
    // The admin would need to ensure the user has signed up first
    toast.info("The user must sign up first. Then their role can be changed from the user_roles table.");
    // For now, show info — in production you'd use an edge function
  };

  const handleRemoveRole = async (id: string) => {
    await supabase.from("user_roles").delete().eq("id", id);
    toast.success("Role removed");
    load();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <h1 className="font-display text-3xl gradient-text">User Management</h1>
      <p className="text-muted-foreground text-sm">Manage manager and staff roles. Users must sign up first, then you can assign roles.</p>

      <div className="glass-card p-4 space-y-3">
        <div className="grid sm:grid-cols-3 gap-3">
          <Input placeholder="User email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="bg-background border-border sm:col-span-1" />
          <select value={newRole} onChange={(e) => setNewRole(e.target.value as "manager" | "staff")} className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground">
            <option value="manager">Manager</option>
            <option value="staff">Staff</option>
          </select>
          <Button onClick={handleAddRole} className="bg-primary text-primary-foreground">
            <UserPlus className="w-4 h-4 mr-1" /> Add Role
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {roles.map((r) => {
          const Icon = roleIcon[r.role] || UserCheck;
          return (
            <div key={r.id} className="glass-card p-4 flex items-center gap-4">
              <Icon className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <span className="text-sm text-muted-foreground font-mono">{r.user_id.slice(0, 8)}...</span>
              </div>
              <Badge className={roleColor[r.role]}>{r.role}</Badge>
              {r.role !== "admin" && (
                <Button variant="ghost" size="sm" onClick={() => handleRemoveRole(r.id)} className="text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default UsersManager;
