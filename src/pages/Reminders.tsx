import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Bell, Send, MessageSquare, Copy, Check, Search } from "lucide-react";
import { toast } from "sonner";
import { useGym } from "@/context/GymContext";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const defaultTemplate = `Hi {name}! 👋

Your gym subscription is {status}. 
Plan: {plan}
End Date: {endDate}

Please renew your subscription to continue your fitness journey! 💪

— IronCore`;

const Reminders = () => {
  const { customers } = useGym();
  const [selectOpen, setSelectOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [copied, setCopied] = useState(false);

  const expiring = customers.filter((c) => c.status === "expiring");
  const expired = customers.filter((c) => c.status === "expired");

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  const filledMessage = selectedCustomer
    ? defaultTemplate
      .replace("{name}", selectedCustomer.fullName)
      .replace("{status}", selectedCustomer.status)
      .replace("{plan}", selectedCustomer.subscriptionPlan)
      .replace("{endDate}", selectedCustomer.subscriptionEnd)
    : "";

  const filteredCustomers = customers.filter((c) =>
    c.fullName.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(filledMessage);
    setCopied(true);
    toast.success("Message copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const openSelectDialog = () => {
    setSelectedCustomerId(null);
    setCustomerSearch("");
    setSelectOpen(true);
  };

  const getWhatsAppLink = (c: typeof customers[0]) => {
    const message = defaultTemplate
      .replace("{name}", c.fullName)
      .replace("{status}", c.status)
      .replace("{plan}", c.subscriptionPlan)
      .replace("{endDate}", c.subscriptionEnd);
    const phone = c.phone.replace(/\D/g, "");
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  const sendQuickReminder = (c: typeof customers[0]) => {
    window.open(getWhatsAppLink(c), "_blank");
    toast.success(`WhatsApp reminder opened for ${c.fullName}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">Reminders</h1>
            <p className="text-muted-foreground text-sm mt-1">Send subscription reminders to members</p>
          </div>
          <Button onClick={openSelectDialog} className="gap-2">
            <Send className="h-4 w-4" />
            Send Reminder
          </Button>
        </div>

        {/* Expiring & Expired sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-warning/20 bg-warning/5 p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-4 w-4 text-warning" />
              <h2 className="font-display font-semibold text-foreground">Expiring Soon ({expiring.length})</h2>
            </div>
            {expiring.length === 0 ? (
              <p className="text-sm text-muted-foreground">No expiring subscriptions</p>
            ) : (
              <div className="space-y-3">
                {expiring.map((c) => (
                  <div key={c.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{c.fullName}</p>
                      <p className="text-xs text-muted-foreground">{c.phone} · Expires {c.subscriptionEnd}</p>
                    </div>
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs border-warning/30 text-warning hover:bg-warning/10" onClick={() => sendQuickReminder(c)}>
                      <Send className="h-3 w-3" /> Send
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-destructive/20 bg-destructive/5 p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-4 w-4 text-destructive" />
              <h2 className="font-display font-semibold text-foreground">Expired ({expired.length})</h2>
            </div>
            {expired.length === 0 ? (
              <p className="text-sm text-muted-foreground">No expired subscriptions</p>
            ) : (
              <div className="space-y-3">
                {expired.map((c) => (
                  <div key={c.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{c.fullName}</p>
                      <p className="text-xs text-muted-foreground">{c.phone} · Expired {c.subscriptionEnd}</p>
                    </div>
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => sendQuickReminder(c)}>
                      <Send className="h-3 w-3" /> Send
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Send Reminder Dialog */}
      <Dialog open={selectOpen} onOpenChange={setSelectOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Send Reminder
            </DialogTitle>
          </DialogHeader>

          {!selectedCustomer ? (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customer..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="max-h-60 overflow-y-auto space-y-1">
                {filteredCustomers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No customers found</p>
                ) : (
                  filteredCustomers.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCustomerId(c.id)}
                      className="w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-left hover:bg-accent transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{c.fullName}</p>
                        <p className="text-xs text-muted-foreground">{c.phone}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${c.status === "active" ? "bg-primary/10 text-primary" :
                        c.status === "expiring" ? "bg-warning/10 text-warning" :
                          "bg-destructive/10 text-destructive"
                        }`}>
                        {c.status}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg bg-secondary/50 p-4">
                <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                  {filledMessage}
                </pre>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => {
                    const phone = selectedCustomer.phone.replace(/\D/g, "");
                    const text = encodeURIComponent(filledMessage);
                    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
                  }}
                  className="w-full gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white"
                >
                  <MessageSquare className="h-4 w-4" />
                  Send via WhatsApp
                </Button>
                <div className="flex gap-2">
                  <Button onClick={handleCopy} className="flex-1 gap-2" variant="outline">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied!" : "Copy Message"}
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedCustomerId(null)}>
                    Back
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Reminders;
