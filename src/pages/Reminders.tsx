import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Bell, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useGym } from "@/context/GymContext";
import { Customer } from "@/lib/mockData";
import { CustomerDetailsDialog } from "@/components/CustomerDetailsDialog";

const getGymName = () => {
  try {
    const saved = localStorage.getItem("gym_settings");
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.gymName || "IronCore";
    }
  } catch (e) {
    // ignore
  }
  return "IronCore";
};

const getTemplate = () => `Hi {name}! 👋

Your gym subscription is {status}. 
Plan: {plan}
End Date: {endDate}

Please renew your subscription to continue your fitness journey! 💪

— ${getGymName()}`;

const Reminders = () => {
  const { customers } = useGym();
  const [detailsTarget, setDetailsTarget] = useState<Customer | null>(null);

  const expiring = customers.filter((c) => c.status === "expiring");
  const expired = customers.filter((c) => c.status === "expired");

  const handleWhatsApp = (phone: string, message: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone) {
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, "_blank");
      toast.success("Opening WhatsApp...");
    } else {
      toast.error("Invalid phone number");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">Reminders</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage and send subscription reminders</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expiring Soon */}
        <div className="rounded-xl border border-warning/20 bg-warning/5 overflow-hidden flex flex-col h-full">
          <div className="p-4 border-b border-warning/20 bg-warning/10 flex items-center gap-3">
            <div className="p-2 bg-warning/20 rounded-lg text-warning">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-warning-foreground">Expiring Soon</h2>
              <p className="text-xs text-warning-foreground/80">{expiring.length} customers</p>
            </div>
          </div>
          
          <div className="p-4 flex-1 overflow-auto max-h-[400px]">
            {expiring.length === 0 ? (
              <p className="text-sm text-center text-muted-foreground py-8">No customers expiring soon</p>
            ) : (
              <div className="space-y-3">
                {expiring.map((customer) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={customer.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-warning/20 bg-background/50 gap-3"
                  >
                    <div>
                      <span 
                        className="font-medium text-foreground cursor-pointer hover:text-primary transition-colors"
                        onClick={() => setDetailsTarget(customer)}
                      >
                        {customer.fullName}
                      </span>
                      <p className="text-xs text-muted-foreground">{customer.phone} · Ends: {customer.subscriptionEnd}</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-warning/30 text-warning-foreground hover:bg-warning/10 w-full sm:w-auto gap-2"
                      onClick={() => handleWhatsApp(customer.phone, getTemplate()
                        .replace("{name}", customer.fullName)
                        .replace("{status}", customer.status)
                        .replace("{plan}", customer.subscriptionPlan)
                        .replace("{endDate}", customer.subscriptionEnd)
                      )}
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      Remind
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Expired */}
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 overflow-hidden flex flex-col h-full">
          <div className="p-4 border-b border-destructive/20 bg-destructive/10 flex items-center gap-3">
            <div className="p-2 bg-destructive/20 rounded-lg text-destructive">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-destructive-foreground">Expired</h2>
              <p className="text-xs text-destructive-foreground/80">{expired.length} customers</p>
            </div>
          </div>
          
          <div className="p-4 flex-1 overflow-auto max-h-[400px]">
            {expired.length === 0 ? (
              <p className="text-sm text-center text-muted-foreground py-8">No expired customers</p>
            ) : (
              <div className="space-y-3">
                {expired.map((customer) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={customer.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-destructive/20 bg-background/50 gap-3"
                  >
                    <div>
                      <span 
                        className="font-medium text-foreground cursor-pointer hover:text-primary transition-colors"
                        onClick={() => setDetailsTarget(customer)}
                      >
                        {customer.fullName}
                      </span>
                      <p className="text-xs text-muted-foreground">{customer.phone} · Ended: {customer.subscriptionEnd}</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-destructive/30 text-destructive-foreground hover:bg-destructive/10 w-full sm:w-auto gap-2"
                      onClick={() => handleWhatsApp(customer.phone, getTemplate()
                        .replace("{name}", customer.fullName)
                        .replace("{status}", customer.status)
                        .replace("{plan}", customer.subscriptionPlan)
                        .replace("{endDate}", customer.subscriptionEnd)
                      )}
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      Remind
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>


      
      <CustomerDetailsDialog
        customer={detailsTarget}
        onClose={() => setDetailsTarget(null)}
      />
    </div>
  );
};

export default Reminders;
