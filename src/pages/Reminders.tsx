import { useState } from "react";
import { motion } from "framer-motion";
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
import { Customer } from "@/lib/mockData";
import { CustomerDetailsDialog } from "@/components/CustomerDetailsDialog";

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
  const [detailsTarget, setDetailsTarget] = useState<Customer | null>(null);

  const expiring = customers.filter((c) => c.status === "expiring");
  const expired = customers.filter((c) => c.status === "expired");

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  const filledMessage = selectedCustomer
    ? defaultTemplate
      .replace("{name}", selectedCustomer.fullName)
      .replace("{status}", selectedCustomer.status)
      .replace("{plan}", selectedCustomer.subscriptionPlan)
      .replace("{endDate}", selectedCustomer.subscriptionEnd)
    : defaultTemplate;

  const handleCopy = () => {
    navigator.clipboard.writeText(filledMessage);
    setCopied(true);
    toast.success("Message copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = (phone: string, message: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone) {
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, "_blank");
      toast.success("Opening WhatsApp...");
    } else {
      toast.error("Invalid phone number");
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.status !== 'archived' && (
      c.fullName.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone.includes(customerSearch)
    )
  );

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
                      onClick={() => handleWhatsApp(customer.phone, defaultTemplate
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
                      onClick={() => handleWhatsApp(customer.phone, defaultTemplate
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

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Custom Message</h2>
            <p className="text-xs text-muted-foreground mt-1">Send a customized message to any customer</p>
          </div>
          <Button onClick={() => setSelectOpen(true)} className="gap-2 w-full sm:w-auto">
            <Send className="h-4 w-4" />
            Send Custom Message
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          
          <div className="flex-1 space-y-3">
            <h3 className="text-sm font-medium text-foreground">Template Preview</h3>
            <div className="rounded-lg bg-secondary/50 p-4 font-mono text-sm whitespace-pre-wrap text-muted-foreground border border-border">
              {defaultTemplate}
            </div>
            <p className="text-xs text-muted-foreground">Variables: {"{name}"}, {"{status}"}, {"{plan}"}, {"{endDate}"}</p>
          </div>
        </div>
      </div>

      {/* Customer Selection Dialog */}
      <Dialog open={selectOpen} onOpenChange={setSelectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedCustomerId ? "Review Message" : "Select Customer"}</DialogTitle>
          </DialogHeader>
          
          {!selectedCustomerId ? (
            <div className="space-y-4 py-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="pl-9"
                  autoFocus
                />
              </div>
              <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                {filteredCustomers.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-4">No customers found</p>
                ) : (
                  filteredCustomers.map((customer) => (
                    <div 
                      key={customer.id}
                      onClick={() => setSelectedCustomerId(customer.id)}
                      className="p-3 rounded-lg border border-border hover:bg-secondary/50 cursor-pointer transition-colors flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium text-foreground">{customer.fullName}</p>
                        <p className="text-xs text-muted-foreground">{customer.phone}</p>
                      </div>
                      <div className={`px-2 py-1 rounded text-[10px] font-medium uppercase
                        ${customer.status === 'active' ? 'bg-primary/10 text-primary' : 
                          customer.status === 'expiring' ? 'bg-warning/10 text-warning' : 
                          'bg-destructive/10 text-destructive'}`}
                      >
                        {customer.status}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="p-3 rounded-lg bg-secondary/30 border border-border flex justify-between items-center">
                <div>
                  <p className="text-xs text-muted-foreground">Sending to:</p>
                  <p className="font-medium text-foreground">{selectedCustomer?.fullName}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedCustomerId(null)} className="h-8 text-xs">
                  Change
                </Button>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium uppercase px-1">Message Preview</p>
                <div className="p-4 rounded-xl bg-card border border-border shadow-sm text-sm whitespace-pre-wrap">
                  {filledMessage}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  className="w-full gap-2" 
                  onClick={() => {
                    if (selectedCustomer) {
                      handleWhatsApp(selectedCustomer.phone, filledMessage);
                      setSelectOpen(false);
                      setSelectedCustomerId(null);
                    }
                  }}
                >
                  <MessageSquare className="h-4 w-4" />
                  Open in WhatsApp
                </Button>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button 
                    variant="outline" 
                    className="flex-1 gap-2"
                    onClick={handleCopy}
                  >
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
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
      
      <CustomerDetailsDialog
        customer={detailsTarget}
        onClose={() => setDetailsTarget(null)}
      />
    </div>
  );
};

export default Reminders;
