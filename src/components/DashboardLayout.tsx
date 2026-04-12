import { Navigate } from "react-router-dom";
import { useAuth, type AppRole } from "@/contexts/AuthContext";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  requiredRole: AppRole;
  redirectTo?: string;
}

const DashboardLayout = ({ children, requiredRole, redirectTo = "/auth" }: DashboardLayoutProps) => {
  const { user, hasRole, loading } = useAuth();

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </main>
    );
  }

  if (!user) return <Navigate to={redirectTo} replace />;
  if (!hasRole(requiredRole)) return <Navigate to="/unauthorized" replace />;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full pt-16 md:pt-20">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <div className="h-12 flex items-center border-b border-border bg-background/80 backdrop-blur-xl px-4">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <span className="ml-3 text-sm text-muted-foreground font-medium capitalize">
              Dashboard
            </span>
          </div>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
