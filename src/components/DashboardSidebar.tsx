import {
  LayoutDashboard,
  UtensilsCrossed,
  CalendarDays,
  ShoppingCart,
  Star,
  Package,
  BarChart3,
  Users,
  MessageSquare,
  Tag,
  Settings,
  LogOut,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

interface NavItem {
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
  roles: string[];
}

const navItems: NavItem[] = [
  { title: "Overview", url: "/admin", icon: LayoutDashboard, roles: ["admin"] },
  { title: "Overview", url: "/manager", icon: LayoutDashboard, roles: ["manager"] },
  { title: "Overview", url: "/staff", icon: LayoutDashboard, roles: ["staff"] },
  { title: "Menu", url: "/admin/menu", icon: UtensilsCrossed, roles: ["admin"] },
  { title: "Orders", url: "/admin/orders", icon: ShoppingCart, roles: ["admin", "manager", "staff"] },
  { title: "Reservations", url: "/admin/reservations", icon: CalendarDays, roles: ["admin", "manager", "staff"] },
  { title: "Reviews", url: "/admin/reviews", icon: Star, roles: ["admin", "manager"] },
  { title: "Inventory", url: "/admin/inventory", icon: Package, roles: ["admin"] },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3, roles: ["admin"] },
  { title: "Users", url: "/admin/users", icon: Users, roles: ["admin"] },
  { title: "Messages", url: "/admin/messages", icon: MessageSquare, roles: ["admin", "manager"] },
  { title: "Coupons", url: "/admin/coupons", icon: Tag, roles: ["admin"] },
  { title: "Settings", url: "/admin/settings", icon: Settings, roles: ["admin"] },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { role, signOut, user } = useAuth();

  const filteredItems = navItems.filter((item) => item.roles.includes(role));
  // For manager/staff, remap URLs
  const getUrl = (item: NavItem) => {
    if (role === "manager") return item.url.replace("/admin", "/manager");
    if (role === "staff") return item.url.replace("/admin", "/staff");
    return item.url;
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground">
            {role === "admin" ? "Super Admin" : role === "manager" ? "Manager" : "Staff"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => {
                const url = getUrl(item);
                return (
                  <SidebarMenuItem key={item.title + url}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={url}
                        end={url === "/admin" || url === "/manager" || url === "/staff"}
                        className="hover:bg-muted/50"
                        activeClassName="bg-primary/10 text-primary font-medium"
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-2">
        {!collapsed && (
          <div className="text-xs text-muted-foreground px-2 mb-2 truncate">
            {user?.email}
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="w-full justify-start text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4 mr-2" />
          {!collapsed && "Sign Out"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
