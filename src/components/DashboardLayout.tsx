import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useGym } from "@/context/GymContext";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
  const { session } = useGym();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-transparent flex flex-col">
        <header className="h-14 flex items-center border-b border-white/10 px-4 lg:px-6 glass-panel rounded-b-lg mx-2 mt-2 sticky top-2 z-10 print:hidden">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
          <div className="ml-auto flex items-center gap-3">
            {session?.user?.email && (
              <span className="text-xs sm:text-sm font-medium text-muted-foreground mr-2 border border-border px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-secondary/20 truncate max-w-[130px] sm:max-w-none">
                {session.user.email}
              </span>
            )}
            <div className="h-8 w-8 rounded-full overflow-hidden border border-primary/20 flex items-center justify-center bg-primary/10">
              <img src="/logo.png" alt="Logo" className="h-full w-full object-cover" />
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 print:overflow-visible print:h-auto print:p-0 print:block overflow-y-auto">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;
