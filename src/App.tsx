import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DashboardLayout from "@/components/DashboardLayout";
import Index from "./pages/Index";
import MenuPage from "./pages/MenuPage";
import AboutPage from "./pages/AboutPage";
import ReservationsPage from "./pages/ReservationsPage";
import ContactPage from "./pages/ContactPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import RoleLoginPage from "@/components/RoleLoginPage";

// Dashboard pages
import AdminOverview from "./pages/dashboard/AdminOverview";
import ManagerOverview from "./pages/dashboard/ManagerOverview";
import StaffOverview from "./pages/dashboard/StaffOverview";
import MenuManager from "./pages/dashboard/MenuManager";
import OrdersManager from "./pages/dashboard/OrdersManager";
import ReservationsManager from "./pages/dashboard/ReservationsManager";
import ReviewsManager from "./pages/dashboard/ReviewsManager";
import InventoryManager from "./pages/dashboard/InventoryManager";
import AnalyticsDashboard from "./pages/dashboard/AnalyticsDashboard";
import UsersManager from "./pages/dashboard/UsersManager";
import MessagesManager from "./pages/dashboard/MessagesManager";
import CouponsManager from "./pages/dashboard/CouponsManager";
import SettingsPage from "./pages/dashboard/SettingsPage";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const isDashboard = ["/admin", "/manager", "/staff"].some((p) => location.pathname.startsWith(p) && !location.pathname.endsWith("/login"));
  const isLoginPage = location.pathname.endsWith("/login");

  return (
    <>
      <Header />
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Index />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/reservations" element={<ReservationsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/auth" element={<AuthPage />} />

        {/* Role login pages */}
        <Route path="/admin/login" element={<RoleLoginPage roleKey="admin" />} />
        <Route path="/manager/login" element={<RoleLoginPage roleKey="manager" />} />
        <Route path="/staff/login" element={<RoleLoginPage roleKey="staff" />} />

        {/* Super Admin Dashboard */}
        <Route path="/admin" element={<DashboardLayout requiredRole="admin"><AdminOverview /></DashboardLayout>} />
        <Route path="/admin/menu" element={<DashboardLayout requiredRole="admin"><MenuManager /></DashboardLayout>} />
        <Route path="/admin/orders" element={<DashboardLayout requiredRole="admin"><OrdersManager /></DashboardLayout>} />
        <Route path="/admin/reservations" element={<DashboardLayout requiredRole="admin"><ReservationsManager /></DashboardLayout>} />
        <Route path="/admin/reviews" element={<DashboardLayout requiredRole="admin"><ReviewsManager /></DashboardLayout>} />
        <Route path="/admin/inventory" element={<DashboardLayout requiredRole="admin"><InventoryManager /></DashboardLayout>} />
        <Route path="/admin/analytics" element={<DashboardLayout requiredRole="admin"><AnalyticsDashboard /></DashboardLayout>} />
        <Route path="/admin/users" element={<DashboardLayout requiredRole="admin"><UsersManager /></DashboardLayout>} />
        <Route path="/admin/messages" element={<DashboardLayout requiredRole="admin"><MessagesManager /></DashboardLayout>} />
        <Route path="/admin/coupons" element={<DashboardLayout requiredRole="admin"><CouponsManager /></DashboardLayout>} />
        <Route path="/admin/settings" element={<DashboardLayout requiredRole="admin"><SettingsPage /></DashboardLayout>} />

        {/* Manager Dashboard */}
        <Route path="/manager" element={<DashboardLayout requiredRole="manager"><ManagerOverview /></DashboardLayout>} />
        <Route path="/manager/orders" element={<DashboardLayout requiredRole="manager"><OrdersManager /></DashboardLayout>} />
        <Route path="/manager/reservations" element={<DashboardLayout requiredRole="manager"><ReservationsManager /></DashboardLayout>} />
        <Route path="/manager/reviews" element={<DashboardLayout requiredRole="manager"><ReviewsManager /></DashboardLayout>} />
        <Route path="/manager/messages" element={<DashboardLayout requiredRole="manager"><MessagesManager /></DashboardLayout>} />

        {/* Staff Dashboard */}
        <Route path="/staff" element={<DashboardLayout requiredRole="staff"><StaffOverview /></DashboardLayout>} />
        <Route path="/staff/orders" element={<DashboardLayout requiredRole="staff"><OrdersManager /></DashboardLayout>} />
        <Route path="/staff/reservations" element={<DashboardLayout requiredRole="staff"><ReservationsManager /></DashboardLayout>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isDashboard && !isLoginPage && <Footer />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
