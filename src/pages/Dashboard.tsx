import { Users, UserCheck, AlertTriangle, UserX, UserPlus, CreditCard, ArchiveRestore } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { useGym } from "@/context/GymContext";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const navigate = useNavigate();
  const { customers, payments, getStats } = useGym();
  const stats = getStats();

  const recentCustomers = customers.slice(0, 5);
  const recentPayments = payments.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Welcome back! Here's your gym overview.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/add-customer")} size="sm" className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add Customer
          </Button>
          <Button onClick={() => navigate("/payments")} variant="outline" size="sm" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Register Payment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Customers" value={stats.total} icon={Users} onClick={() => navigate("/customers")} />
        <StatCard title="Active" value={stats.active} icon={UserCheck} variant="primary" onClick={() => navigate("/customers")} />
        <StatCard title="Expiring Soon" value={stats.expiring} icon={AlertTriangle} variant="warning" onClick={() => navigate("/reminders")} />
        <StatCard title="Expired" value={stats.expired} icon={UserX} variant="destructive" onClick={() => navigate("/reminders")} />
        <StatCard title="Archived" value={stats.archived} icon={ArchiveRestore} onClick={() => navigate("/customers")} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Customers</h2>
            <Button variant="link" onClick={() => navigate("/customers")} className="text-sm h-auto p-0">View all</Button>
          </div>
          {recentCustomers.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No customers yet</p>
          ) : (
            <div className="space-y-4">
              {recentCustomers.map((customer) => (
                <div key={customer.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors gap-3 cursor-pointer" onClick={() => navigate("/customers")}>
                  <div>
                    <p className="font-medium text-foreground">{customer.fullName}</p>
                    <p className="text-xs text-muted-foreground">{customer.phone} · Joined {customer.joiningDate}</p>
                  </div>
                  <Badge
                    className={
                      customer.status === 'active' ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20' :
                      customer.status === 'expiring' ? 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20' :
                      customer.status === 'archived' ? 'bg-secondary/40 text-muted-foreground border-border' :
                      'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20'
                    }
                  >
                    {customer.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Payments</h2>
            <Button variant="link" onClick={() => navigate("/payments")} className="text-sm h-auto p-0">View all</Button>
          </div>
          {recentPayments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No payments yet</p>
          ) : (
            <div className="space-y-4">
              {recentPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                  <div>
                    <p className="font-medium text-foreground">{payment.customerName}</p>
                    <p className="text-xs text-muted-foreground">{payment.paymentDate} · {payment.mode}</p>
                  </div>
                  <p className="text-sm font-semibold text-primary">₹{payment.amount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
