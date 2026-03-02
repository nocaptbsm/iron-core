import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useGym } from "@/context/GymContext";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const Payments = () => {
  const { customers, payments, addPayment } = useGym();
  const [tab, setTab] = useState<"register" | "history">("register");
  const [form, setForm] = useState({
    customerId: "",
    amount: "",
    mode: "",
    paymentDate: format(new Date(), "yyyy-MM-dd"),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerId || !form.amount || !form.mode) {
      toast.error("Please fill all fields");
      return;
    }
    const customer = customers.find((c) => c.id === form.customerId);
    await addPayment({
      customerId: form.customerId,
      customerName: customer?.fullName || "Unknown",
      paymentDate: form.paymentDate,
      amount: Number(form.amount),
      plan: customer?.subscriptionPlan || "N/A",
      mode: form.mode as any,
    });
    toast.success(`Payment of ₹${form.amount} registered for ${customer?.fullName}`);
    setForm({ customerId: "", amount: "", mode: "", paymentDate: format(new Date(), "yyyy-MM-dd") });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">Payments</h1>
          <p className="text-muted-foreground text-sm mt-1">Register and track payments</p>
        </div>

        <div className="flex gap-2">
          <Button variant={tab === "register" ? "default" : "outline"} size="sm" onClick={() => setTab("register")}>Register Payment</Button>
          <Button variant={tab === "history" ? "default" : "outline"} size="sm" onClick={() => setTab("history")}>Payment History</Button>
        </div>

        {tab === "register" ? (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="max-w-2xl rounded-xl border border-border bg-card p-6 space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2 sm:col-span-2">
                <Label>Select Customer</Label>
                <Select value={form.customerId} onValueChange={(v) => setForm({ ...form, customerId: v })}>
                  <SelectTrigger className="bg-secondary/50 border-border">
                    <SelectValue placeholder="Choose customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.length === 0 ? (
                      <SelectItem value="none" disabled>No customers — add one first</SelectItem>
                    ) : (
                      customers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.fullName} — {c.phone}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Payment Date</Label>
                <Input type="date" value={form.paymentDate} onChange={(e) => setForm({ ...form, paymentDate: e.target.value })} className="bg-secondary/50 border-border" />
              </div>
              <div className="space-y-2">
                <Label>Amount (₹)</Label>
                <Input type="number" placeholder="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="bg-secondary/50 border-border" />
              </div>
              <div className="space-y-2">
                <Label>Mode of Payment</Label>
                <Select value={form.mode} onValueChange={(v) => setForm({ ...form, mode: v })}>
                  <SelectTrigger className="bg-secondary/50 border-border"><SelectValue placeholder="Select mode" /></SelectTrigger>
                  <SelectContent>
                    {["Cash", "UPI", "Card"].map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" className="w-full">Register Payment</Button>
          </motion.form>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-card overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer</th>
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Date</th>
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Plan</th>
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Mode</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p, i) => (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-border/50 hover:bg-secondary/20 transition-colors"
                    >
                      <td className="p-4 text-sm font-medium text-foreground">{p.customerName}</td>
                      <td className="p-4 text-sm text-muted-foreground hidden sm:table-cell">{p.paymentDate}</td>
                      <td className="p-4 text-sm text-foreground hidden md:table-cell">{p.plan}</td>
                      <td className="p-4 text-sm font-semibold text-primary">₹{p.amount.toLocaleString()}</td>
                      <td className="p-4 hidden sm:table-cell">
                        <Badge variant="outline" className="text-xs">{p.mode}</Badge>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            {payments.length === 0 && (
              <div className="p-12 text-center text-muted-foreground">
                <p className="text-sm">No payments yet</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Payments;
