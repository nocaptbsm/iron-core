import {
  LayoutDashboard,
  Users,
  UserPlus,
  CreditCard,
  CalendarCheck,
  Bell,
  Dumbbell,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useGym } from "@/context/GymContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Customers", url: "/customers", icon: Users },
  { title: "Add Customer", url: "/add-customer", icon: UserPlus },
  { title: "Payments", url: "/payments", icon: CreditCard },
  { title: "Subscriptions", url: "/subscriptions", icon: CalendarCheck },
  { title: "Reminders", url: "/reminders", icon: Bell },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { isAdmin, logout } = useGym();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg overflow-hidden flex items-center justify-center shrink-0 border border-border bg-black/20">
            <img src="/ironcore-logo.jpg" alt="IronCore Logo" className="w-full h-full object-cover" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-display text-lg font-bold tracking-tight text-foreground">IronCore</h1>
              <p className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">Management</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground/60 text-[10px] uppercase tracking-widest">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-secondary transition-colors"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/admin")}
                    tooltip="Admin Portal"
                    className="mt-2 text-primary"
                  >
                    <NavLink
                      to="/admin"
                      end
                      className="hover:bg-primary/20 bg-primary/10 transition-colors"
                      activeClassName="bg-primary/20 text-primary font-bold"
                    >
                      <UserPlus className="h-4 w-4" />
                      {!collapsed && <span>Admin Portal</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 flex flex-col gap-2">
        <button
          onClick={logout}
          className="flex items-center gap-3 p-2 w-full text-left text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors"
        >
          <LayoutDashboard className="h-4 w-4 rotate-180" />
          {!collapsed && <span>Log Out</span>}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
