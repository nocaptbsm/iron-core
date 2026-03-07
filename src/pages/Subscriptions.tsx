import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGym } from "@/context/GymContext";
import { Customer } from "@/lib/mockData";
import { Search } from "lucide-react";
import { CustomerDetailsDialog } from "@/components/CustomerDetailsDialog";

type Filter = "all" | "active" | "expiring" | "expired";

const Subscriptions = () => {
  const { customers } = useGym();
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const activeCustomers = customers.filter(c => c.status !== "archived");

  const filtered = activeCustomers.filter((c) => {
    const matchesFilter = filter === "all" || c.status === filter;
    const matchesSearch = 
      c.fullName.toLowerCase().includes(search.toLowerCase()) || 
      c.phone.includes(search);
    return matchesFilter && matchesSearch;
  });

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "All", count: activeCustomers.length },
    { key: "active", label: "Active", count: activeCustomers.filter((c) => c.status === "active").length },
    { key: "expiring", label: "Expiring Soon", count: activeCustomers.filter((c) => c.status === "expiring").length },
    { key: "expired", label: "Expired", count: activeCustomers.filter((c) => c.status === "expired").length },
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

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search subscriptions by name or phone..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="pl-10 bg-card border-border" 
          />
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
                    {customer.photo ? (
                      <img 
                        src={customer.photo} 
                        alt={customer.fullName}
                        className="h-10 w-10 rounded-full object-cover border border-primary/20 shrink-0" 
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-primary">
                          {customer.fullName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </span>
                      </div>
                    )}
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
                      customer.status === 'archived' ? 'bg-secondary/40 text-muted-foreground border-border' :
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

      <CustomerDetailsDialog 
        customer={selectedCustomer} 
        onClose={() => setSelectedCustomer(null)} 
      />
    </DashboardLayout>
  );
};

export default Subscriptions;
