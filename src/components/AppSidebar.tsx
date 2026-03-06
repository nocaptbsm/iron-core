import {
  LayoutDashboard,
  Users,
  UserPlus,
  CreditCard,
  CalendarCheck,
  Bell,
  Dumbbell,
  Building2,
  Settings,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
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
import { useGym } from "@/context/GymContext";

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Customers", url: "/customers", icon: Users },
  { title: "Add Customer", url: "/add-customer", icon: UserPlus },
  { title: "Payments", url: "/payments", icon: CreditCard },
  { title: "Subscriptions", url: "/subscriptions", icon: CalendarCheck },
  { title: "Reminders", url: "/reminders", icon: Bell },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { signOut, role, selectedGymId, setSelectedGymId } = useGym();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg overflow-hidden flex items-center justify-center shrink-0 border border-border bg-black/20">
            <img src="/logo.png" alt="IronCore Logo" className="w-full h-full object-cover" />
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {!collapsed && (
          <div className="flex flex-col gap-2">
            {role === 'super_admin' && selectedGymId && (
              <button
                onClick={() => setSelectedGymId(null)}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary/10 text-primary border border-primary/20 p-2 text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors mb-2"
              >
                <Building2 className="w-4 h-4" />
                Return to Gateway
              </button>
            )}
            <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
              <p className="text-[11px] text-muted-foreground">Need help?</p>
              <p className="text-[11px] text-primary font-medium mt-0.5 cursor-pointer hover:underline">View Documentation</p>
            </div>
            <button
              onClick={() => signOut()}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 p-2 text-sm font-medium hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              Log Out
            </button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
