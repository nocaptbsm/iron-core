import { useState } from "react";
import { Search, Phone, Printer, Trash2, ArrowUpCircle, MoreHorizontal, FileText, User, MapPin } from "lucide-react";
import { differenceInCalendarMonths, differenceInDays } from "date-fns";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGym } from "@/context/GymContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ArchiveRestore } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { Customer } from "@/lib/mockData";
import { CustomerDetailsDialog } from "@/components/CustomerDetailsDialog";

const plans: Customer["subscriptionPlan"][] = ["1 month", "3 months", "6 months", "12 months"];

const Customers = () => {
  const { customers, deleteCustomer, archiveCustomer, upgradeCustomer } = useGym();
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Customer | null>(null);
  const [upgradeTarget, setUpgradeTarget] = useState<Customer | null>(null);
  const [detailsTarget, setDetailsTarget] = useState<Customer | null>(null);
  const [receiptTarget, setReceiptTarget] = useState<Customer | null>(null);
  const [gymName, setGymName] = useState("");

  const filtered = customers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const handlePrint = () => {
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();

    let gymSettings = { gymName: "GYM REPORT", address: "", phone: "", proprietor: "", gymLogo: "" };
    try {
      const saved = localStorage.getItem("gym_settings");
      if (saved) {
        gymSettings = { ...gymSettings, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error(e);
    }

    if (gymSettings.gymLogo) {
      try {
        const formatMatch = gymSettings.gymLogo.match(/^data:image\/(\w+);base64,/);
        const format = formatMatch ? formatMatch[1].toUpperCase() : "PNG";
        const imgProps = doc.getImageProperties(gymSettings.gymLogo);
        const width = 25;
        const height = width * (imgProps.height / imgProps.width);
        doc.addImage(gymSettings.gymLogo, format, 15, 10, width, height);
      } catch (error) {
        console.error("Could not add gym logo to PDF", error);
      }
    }

    // Header
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text(gymSettings.gymName || "CUSTOMERS REPORT", 105, 20, { align: "center" });

    let currentY = 28;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    if (gymSettings.address) {
      doc.text(gymSettings.address, 105, currentY, { align: "center" });
      currentY += 5;
    }
    if (gymSettings.phone) {
      doc.text(`Phone: ${gymSettings.phone}`, 105, currentY, { align: "center" });
      currentY += 5;
    }
    
    currentY += 10;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("All Customers List", 15, currentY);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on: ${date}`, 15, currentY + 6);
    
    currentY += 12;

    const tableData = filtered.map(c => [
      c.fullName,
      c.phone,
      c.subscriptionPlan,
      c.subscriptionEnd,
      c.status.toUpperCase()
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [["Customer Name", "Phone", "Plan", "Expires", "Status"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [41, 128, 185] },
    });

    doc.autoPrint();
    const blobURL = doc.output('bloburl');
    window.open(blobURL, '_blank');
  };

  const handleSendToWhatsApp = async () => {
    if (!receiptTarget) return;

    const gym = gymName || "GYM";
    const date = new Date().toLocaleDateString();

    // Create text receipt
    const message = `
*${gym} - E-Receipt*
Date: ${date}

*Customer Details:*
Name: ${receiptTarget.fullName}
Phone: ${receiptTarget.phone}

*Membership Info:*
Plan: ${receiptTarget.subscriptionPlan}
Status: ${receiptTarget.status.toUpperCase()}
Expires On: ${receiptTarget.subscriptionEnd}

Thank you for your business!
    `.trim();

    // Clean phone number (remove any non-digits)
    const cleanPhone = receiptTarget.phone.replace(/\\D/g, "");

    // Check if phone number is valid enough to open WhatsApp
    if (cleanPhone.length >= 10) {
      const encodedMessage = encodeURIComponent(message);
      // Use wa.me link to open WhatsApp directly with prefilled text
      window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, "_blank");
      toast.success("Opened WhatsApp to send text receipt");
    } else {
      toast.error("Invalid phone number format. Could not open WhatsApp.");
    }

    setReceiptTarget(null);
    setGymName("");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">Customers</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage your gym members</p>
          </div>
          <Button variant="outline" size="sm" className="gap-2 print:hidden" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            Print PDF
          </Button>
        </div>

        <div className="relative max-w-md print:hidden">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name or phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-card border-border" />
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden print:overflow-visible print:border-none">
          <div className="overflow-x-auto print:overflow-visible">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer</th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Contact & Info</th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Plan</th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Expires</th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider print:hidden">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((customer, i) => (
                  <motion.tr
                    key={customer.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-border/50 hover:bg-secondary/20 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {customer.photo ? (
                          <img src={customer.photo} alt={customer.fullName} className="h-9 w-9 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-xs font-semibold text-primary">
                              {customer.fullName.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        )}
                        <div>
                          <p
                            className="text-sm font-medium text-foreground cursor-pointer hover:underline"
                            onClick={() => setDetailsTarget(customer)}
                          >
                            {customer.fullName}
                          </p>
                          <div className="sm:hidden mt-1 space-y-1">
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <Phone className="h-3 w-3 shrink-0" />{customer.phone}
                            </p>
                            {customer.gender && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <User className="h-3 w-3 shrink-0" />{customer.gender}
                              </p>
                            )}
                            {customer.address && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <MapPin className="h-3 w-3 shrink-0" />
                                <span className="truncate max-w-[150px]" title={customer.address}>{customer.address}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Phone className="h-3.5 w-3.5 shrink-0" />
                          {customer.phone}
                        </div>
                        {customer.gender && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <User className="h-3.5 w-3.5 shrink-0" />
                            {customer.gender}
                          </div>
                        )}
                        {customer.address && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate max-w-[150px]" title={customer.address}>{customer.address}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell text-sm text-foreground">
                      {customer.subscriptionPlan}
                      <span className="block text-xs text-muted-foreground">
                        {(() => {
                          const end = new Date(customer.subscriptionEnd);
                          const now = new Date();
                          const days = differenceInDays(end, now);
                          if (days < 0) return "Expired";
                          const months = differenceInCalendarMonths(end, now);
                          if (months > 0) return `${months}mo left`;
                          return `${days}d left`;
                        })()}
                      </span>
                    </td>
                    <td className="p-4 hidden sm:table-cell text-sm text-muted-foreground">{customer.subscriptionEnd}</td>
                    <td className="p-4">
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
                    </td>
                    <td className="p-4 text-right print:hidden">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setReceiptTarget(customer)} className="gap-2">
                            <FileText className="h-4 w-4" /> E-Receipt
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setUpgradeTarget(customer)} className="gap-2">
                            <ArrowUpCircle className="h-4 w-4" /> Upgrade Plan
                          </DropdownMenuItem>
                          {customer.status === "expired" && (
                            <DropdownMenuItem onClick={() => setArchiveTarget(customer)} className="gap-2">
                              <ArchiveRestore className="h-4 w-4" /> Archive
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => setDeleteTarget(customer)} className="gap-2 text-destructive focus:text-destructive">
                            <Trash2 className="h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              <p className="text-sm">No customers found</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.fullName}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { if (deleteTarget) { deleteCustomer(deleteTarget.id); setDeleteTarget(null); } }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Archive Confirmation */}
      <AlertDialog open={!!archiveTarget} onOpenChange={(open) => { if (!open) setArchiveTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive <strong>{archiveTarget?.fullName}</strong>? This will remove them from the Expired lists on the Dashboard and Reminders, keeping only read-only history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (archiveTarget) { archiveCustomer(archiveTarget.id); setArchiveTarget(null); toast.success("Customer successfully archived!"); } }}>
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Upgrade Dialog */}
      <Dialog open={!!upgradeTarget} onOpenChange={(open) => { if (!open) setUpgradeTarget(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Upgrade {upgradeTarget?.fullName}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            {plans.map((plan) => (
              <Button
                key={plan}
                variant={upgradeTarget?.subscriptionPlan === plan ? "default" : "outline"}
                className="justify-start"
                onClick={() => {
                  if (upgradeTarget) {
                    upgradeCustomer(upgradeTarget.id, plan);
                    setUpgradeTarget(null);
                  }
                }}
              >
                {plan} {upgradeTarget?.subscriptionPlan === plan && "(current)"}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <CustomerDetailsDialog
        customer={detailsTarget}
        onClose={() => setDetailsTarget(null)}
      />

      {/* E-Receipt Dialog */}
      <Dialog open={!!receiptTarget} onOpenChange={(open) => { if (!open) setReceiptTarget(null); setGymName(""); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Generate E-Receipt</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="gymName">Gym Name (Optional)</Label>
              <Input
                id="gymName"
                placeholder="Enter your gym name..."
                value={gymName}
                onChange={(e) => setGymName(e.target.value)}
              />
            </div>
            <div className="text-sm text-muted-foreground border p-3 rounded-md bg-secondary/20">
              <p className="font-medium text-foreground mb-1">Receipt for: {receiptTarget?.fullName}</p>
              <p>Plan: {receiptTarget?.subscriptionPlan}</p>
              <p>Expires: {receiptTarget?.subscriptionEnd}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setReceiptTarget(null); setGymName(""); }}>
              Cancel
            </Button>
            <Button onClick={handleSendToWhatsApp} className="gap-2 bg-[#25D366] text-white hover:bg-[#128C7E]">
              <FileText className="h-4 w-4" /> Share PDF to WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Customers;
