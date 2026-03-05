import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useGym } from "@/context/GymContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { session } = useGym();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b border-border px-4 lg:px-6 backdrop-blur-sm bg-background/80 sticky top-0 z-10 print:hidden">
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
          <main className="flex-1 p-4 lg:p-6 overflow-auto print:overflow-visible print:h-auto print:p-0 print:block">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
