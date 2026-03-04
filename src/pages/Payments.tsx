import { useState } from "react";
import { motion } from "framer-motion";
import { MoreHorizontal, FileText } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useGym } from "@/context/GymContext";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Payment } from "@/lib/mockData";

const Payments = () => {
  const { customers, payments, addPayment } = useGym();
  const [tab, setTab] = useState<"register" | "history">("register");
  const [form, setForm] = useState({
    customerId: "",
    amount: "",
    mode: "",
    paymentDate: format(new Date(), "yyyy-MM-dd"),
  });
  const [receiptTarget, setReceiptTarget] = useState<Payment | null>(null);
  const [gymName, setGymName] = useState("");

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
      mode: form.mode as Payment["mode"],
    });
    toast.success(`Payment of ₹${form.amount} registered for ${customer?.fullName}`);
    setForm({ customerId: "", amount: "", mode: "", paymentDate: format(new Date(), "yyyy-MM-dd") });
  };

  const handleSendToWhatsApp = async () => {
    if (!receiptTarget) return;

    const customer = customers.find((c) => c.id === receiptTarget.customerId);
    const phone = customer?.phone || "";

    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();

    // Header
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text(gymName || "GYM RECEIPT", 105, 20, { align: "center" });

    // Subheader
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${date}`, 15, 35);
    doc.text(`Receipt ID: #${Math.floor(Math.random() * 10000)}`, 15, 42);

    // Customer details
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Customer Details:", 15, 55);
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${receiptTarget.customerName}`, 15, 62);
    if (phone) doc.text(`Phone: ${phone}`, 15, 69);

    // Table data
    const tableData = [
      [
        "Payment Processed",
        receiptTarget.plan,
        receiptTarget.paymentDate,
        `Rs. ${receiptTarget.amount.toLocaleString()}`,
        receiptTarget.mode
      ],
    ];

    autoTable(doc, {
      startY: phone ? 85 : 75,
      head: [["Description", "Plan", "Payment Date", "Amount", "Mode"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [41, 128, 185] },
    });

    // Footer
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const finalY = (doc as any).lastAutoTable.finalY || 120;
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text("Thank you for your business!", 105, finalY + 20, { align: "center" });

    const fileName = `${receiptTarget.customerName.replace(/\s+/g, "_")}_PaymentReceipt.pdf`;
    const pdfBlob = doc.output('blob');
    const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Gym Receipt',
          text: `Hi ${receiptTarget.customerName}, here is your payment receipt!`,
        });
      } else {
        doc.save(fileName);
        if (phone) {
          const cleanPhone = phone.replace(/\D/g, "");
          const fallbackText = encodeURIComponent(`Hi ${receiptTarget.customerName},\n\nI have just downloaded your gym receipt. Please find the attached PDF!`);
          window.open(`https://wa.me/${cleanPhone}?text=${fallbackText}`, "_blank");
        }
      }
    } catch (error) {
      console.error('Error sharing receipt:', error);
      doc.save(fileName);
    }

    setReceiptTarget(null);
    setGymName("");
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
                    <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider print:hidden">Action</th>
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
                      <td className="p-4 text-right print:hidden">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setReceiptTarget(p)} className="gap-2">
                              <FileText className="h-4 w-4" /> E-Bill (PDF)
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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

      {/* E-Receipt Dialog */}
      <Dialog open={!!receiptTarget} onOpenChange={(open) => { if (!open) setReceiptTarget(null); setGymName(""); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Generate E-Bill</DialogTitle>
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
              <p className="font-medium text-foreground mb-1">Receipt for: {receiptTarget?.customerName}</p>
              <p>Amount: ₹{receiptTarget?.amount?.toLocaleString()}</p>
              <p>Plan: {receiptTarget?.plan}</p>
              <p>Date: {receiptTarget?.paymentDate}</p>
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

export default Payments;
