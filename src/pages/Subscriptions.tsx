import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGym } from "@/context/GymContext";
import { Customer } from "@/lib/mockData";

type Filter = "all" | "active" | "expiring" | "expired";

const Subscriptions = () => {
  const { customers, payments } = useGym();
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isImageExpanded, setIsImageExpanded] = useState(false);

  const filtered = filter === "all" ? customers : customers.filter((c) => c.status === filter);

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "All", count: customers.length },
    { key: "active", label: "Active", count: customers.filter((c) => c.status === "active").length },
    { key: "expiring", label: "Expiring Soon", count: customers.filter((c) => c.status === "expiring").length },
    { key: "expired", label: "Expired", count: customers.filter((c) => c.status === "expired").length },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">Subscriptions</h1>
          <p className="text-muted-foreground text-sm mt-1">Track and manage member subscriptions</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {filters.map((f) => (
            <Button
              key={f.key}
              variant={filter === f.key ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f.key)}
            >
              {f.label}
              <span className="ml-1.5 text-xs opacity-70">({f.count})</span>
            </Button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
            <p className="text-sm">No subscriptions found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((customer, i) => (
              <motion.div
                key={customer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-border bg-card p-5 hover:border-primary/20 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">
                        {customer.fullName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <button
                        onClick={() => setSelectedCustomer(customer)}
                        className="font-medium text-foreground hover:text-primary transition-colors text-left"
                      >
                        {customer.fullName}
                      </button>
                      <p className="text-xs text-muted-foreground">{customer.phone}</p>
                    </div>
                  </div>
                  <Badge
                    className={
                      customer.status === 'active' ? 'bg-primary/10 text-primary border-primary/20' :
                      customer.status === 'expiring' ? 'bg-warning/10 text-warning border-warning/20' :
                      'bg-destructive/10 text-destructive border-destructive/20'
                    }
                  >
                    {customer.status}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plan</span>
                    <span className="text-foreground font-medium">{customer.subscriptionPlan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Start</span>
                    <span className="text-foreground">{customer.subscriptionStart}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">End</span>
                    <span className="text-foreground">{customer.subscriptionEnd}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6 pt-4">
              <div className="flex items-start gap-4">
                {selectedCustomer.photo ? (
                  <button onClick={() => setIsImageExpanded(true)} className="shrink-0 relative group">
                    <img 
                      src={selectedCustomer.photo} 
                      alt={selectedCustomer.fullName} 
                      className="h-20 w-20 rounded-full object-cover border-2 border-primary/20 group-hover:opacity-80 transition-opacity" 
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="bg-black/50 text-white text-xs px-2 py-1 rounded">View</span>
                    </div>
                  </button>
                ) : (
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-2xl font-bold text-primary">
                      {selectedCustomer.fullName.split(" ").map((n) => n[0]).join("")}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-foreground">{selectedCustomer.fullName}</h3>
                  <p className="text-sm text-muted-foreground">{selectedCustomer.phone}</p>
                  <div className="mt-2 flex gap-2">
                    <Badge variant={selectedCustomer.status === "active" ? "default" : "secondary"}>
                      {selectedCustomer.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Gender</p>
                  <p className="font-medium">{selectedCustomer.gender || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Joining Date</p>
                  <p className="font-medium">{selectedCustomer.joiningDate}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Address</p>
                  <p className="font-medium">{selectedCustomer.address || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Plan</p>
                  <p className="font-medium">{selectedCustomer.subscriptionPlan}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Plan Ends</p>
                  <p className="font-medium">{selectedCustomer.subscriptionEnd}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-3 border-b border-border pb-1">Payment History</h4>
                <div className="space-y-3">
                  {payments.filter(p => p.customerId === selectedCustomer.id).length > 0 ? (
                    payments.filter(p => p.customerId === selectedCustomer.id).map((payment) => (
                      <div key={payment.id} className="flex justify-between items-center bg-secondary/30 p-3 rounded-lg text-sm border border-border">
                        <div>
                          <p className="font-medium text-foreground">{payment.plan}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{payment.paymentDate} • {payment.mode}</p>
                        </div>
                        <p className="font-bold text-primary text-base">₹{payment.amount}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4 bg-secondary/10 rounded-lg border border-dashed border-border/50">
                      No payment history found.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isImageExpanded} onOpenChange={setIsImageExpanded}>
        <DialogContent className="max-w-2xl bg-transparent border-none shadow-none overflow-hidden flex justify-center p-0">
          <DialogTitle className="sr-only">Expanded View</DialogTitle>
          {selectedCustomer?.photo && (
            <img 
              src={selectedCustomer.photo} 
              alt={selectedCustomer.fullName} 
              className="max-w-full max-h-[85vh] rounded-lg object-contain shadow-2xl" 
            />
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Subscriptions;
