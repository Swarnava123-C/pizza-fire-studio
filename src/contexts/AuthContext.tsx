import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export type AppRole = "admin" | "manager" | "staff" | "user";

interface AuthContextType {
  user: User | null;
  role: AppRole;
  isAdmin: boolean;
  isManager: boolean;
  isStaff: boolean;
  hasRole: (r: AppRole) => boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

const ROLE_HIERARCHY: Record<AppRole, number> = { admin: 4, manager: 3, staff: 2, user: 1 };

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole>("user");
  const [loading, setLoading] = useState(true);

  const fetchRole = async (userId: string) => {
    // Check roles in priority order
    for (const r of ["admin", "manager", "staff"] as AppRole[]) {
      const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: r });
      if (data) {
        setRole(r);
        return;
      }
    }
    setRole("user");
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        await fetchRole(u.id);
      } else {
        setRole("user");
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        await fetchRole(u.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data.user) {
      // Log login to audit_logs
      supabase.from("audit_logs").insert({
        user_id: data.user.id,
        action_type: "LOGIN",
        entity_type: "user",
        entity_id: data.user.id,
        details: `Login by ${email}`,
      }).then(() => {});
    }
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole("user");
  };

  const isAdmin = role === "admin";
  const isManager = role === "manager";
  const isStaff = role === "staff";
  const hasRole = (r: AppRole) => ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[r];

  return (
    <AuthContext.Provider value={{ user, role, isAdmin, isManager, isStaff, hasRole, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
