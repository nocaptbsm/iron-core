import { useState } from "react";
import { motion } from "framer-motion";
import { MoreHorizontal, FileText, Printer } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useGym } from "@/context/GymContext";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Payment, Customer } from "@/lib/mockData";
import { CustomerDetailsDialog } from "@/components/CustomerDetailsDialog";

const Payments = () => {
  const { customers, payments, addPayment } = useGym();
  const [tab, setTab] = useState<"register" | "history">("register");
  const [detailsTarget, setDetailsTarget] = useState<Customer | null>(null);
  const [form, setForm] = useState({
    customerId: "",
    amount: "",
    mode: "",
    paymentDate: format(new Date(), "yyyy-MM-dd"),
  });

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

    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text(gymSettings.gymName || "PAYMENTS REPORT", 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on: ${date}`, 105, 28, { align: "center" });

    if (gymSettings.address) {
      doc.text(gymSettings.address, 105, 34, { align: "center" });
    }
    
    if (gymSettings.phone) {
      doc.text(`Contact: ${gymSettings.phone}`, 105, 40, { align: "center" });
    }

    doc.setDrawColor(200);
    doc.line(15, 45, 195, 45);

    autoTable(doc, {
      startY: 55,
      head: [['Date', 'Customer', 'Plan', 'Mode', 'Amount']],
      body: payments.map(p => [
        p.paymentDate,
        p.customerName,
        p.plan,
        p.mode,
        `Rs. ${p.amount.toLocaleString()}`
      ]),
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 5 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      columnStyles: {
        4: { halign: 'right', fontStyle: 'bold' } 
      },
      foot: [['', '', '', 'Total:', `Rs. ${payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}`]],
      footStyles: { fillColor: [236, 240, 241], textColor: [44, 62, 80], fontStyle: 'bold' }
    });

    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
    }

    doc.save(`Payments_Report_${date.replace(/\//g, '-')}.pdf`);
    toast.success("Payments report downloaded");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerId || !form.amount || !form.mode || !form.paymentDate) {
      toast.error("Please fill all fields");
      return;
    }

    const customer = customers.find(c => c.id === form.customerId);
    if (!customer) {
      toast.error("Selected customer not found");
      return;
    }

    addPayment({
      customerId: form.customerId,
      customerName: customer.fullName,
      amount: Number(form.amount),
      mode: form.mode as Payment["mode"],
      paymentDate: form.paymentDate,
      plan: customer.subscriptionPlan,
    });
    
    toast.success("Payment registered successfully!");
    setForm({ customerId: "", amount: "", mode: "", paymentDate: format(new Date(), "yyyy-MM-dd") });
    setTab("history");
  };

  const handleSendToWhatsApp = async (payment: Payment) => {
    const customer = customers.find(c => c.id === payment.customerId);
    if (!customer) {
      toast.error("Customer not found");
      return;
    }

    let gymSettings = { gymName: "Iron Core Gym", phone: "", address: "" };
    try {
      const saved = localStorage.getItem("gym_settings");
      if (saved) {
        gymSettings = { ...gymSettings, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error(e);
    }

    const cleanPhone = customer.phone.replace(/\D/g, "");
    const dateStr = format(new Date(), "yyyyMMdd_HHmmss");
    const fileName = `Receipt_${customer.fullName.replace(/\s+/g, "_")}_${dateStr}.pdf`;

    const doc = new jsPDF();
    
    try {
      const savedSettings = localStorage.getItem("gym_settings");
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (settings.gymLogo) {
          const formatMatch = settings.gymLogo.match(/^data:image\/(\w+);base64,/);
          const format = formatMatch ? formatMatch[1].toUpperCase() : "PNG";
          const imgProps = doc.getImageProperties(settings.gymLogo);
          const width = 30;
          const height = width * (imgProps.height / imgProps.width);
          doc.addImage(settings.gymLogo, format, 20, 15, width, height);
        }
      }
    } catch (error) {
      console.error("Could not add gym logo to PDF", error);
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59); 
    doc.text(gymSettings.gymName.toUpperCase(), 105, 25, { align: "center" });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    
    let yPos = 32;
    if (gymSettings.address) {
      doc.text(gymSettings.address, 105, yPos, { align: "center" });
      yPos += 5;
    }
    if (gymSettings.phone) {
      doc.text(`Tel: ${gymSettings.phone}`, 105, yPos, { align: "center" });
      yPos += 8;
    }

    doc.setDrawColor(226, 232, 240); 
    doc.line(20, yPos, 190, yPos);
    yPos += 12;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42); 
    doc.text("PAYMENT RECEIPT", 105, yPos, { align: "center" });
    yPos += 12;

    const receiptNo = `REC-${format(new Date(), "yyyyMMdd")}-${payment.id.substring(0,4)}`;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(`Receipt No: ${receiptNo}`, 20, yPos);
    doc.text(`Date: ${payment.paymentDate}`, 190, yPos, { align: "right" });
    yPos += 15;

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(20, yPos, 170, 30, 3, 3, "F");
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("Billed To:", 25, yPos + 8);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    doc.text(customer.fullName, 25, yPos + 15);
    doc.text(`Phone: ${customer.phone}`, 25, yPos + 22);
    
    yPos += 45;

    autoTable(doc, {
      startY: yPos,
      head: [['Description', 'Payment Mode', 'Amount']],
      body: [
        [
          `Gym Subscription - ${customer.subscriptionPlan}`,
          payment.mode,
          `Rs. ${payment.amount.toLocaleString()}`
        ]
      ],
      theme: 'plain',
      headStyles: { 
        fillColor: [241, 245, 249], 
        textColor: [15, 23, 42],
        fontStyle: 'bold',
        halign: 'left'
      },
      bodyStyles: {
        textColor: [51, 65, 85],
        halign: 'left'
      },
      columnStyles: {
        2: { halign: 'right', fontStyle: 'bold', textColor: [15, 23, 42] }
      },
      didDrawCell: function(data) {
        if (data.row.index === data.table.body.length - 1 && data.row.section === 'body') {
          doc.setDrawColor(226, 232, 240);
          doc.setLineWidth(0.5);
          doc.line(
            data.cell.x, 
            data.cell.y + data.cell.height, 
            data.cell.x + data.cell.width, 
            data.cell.y + data.cell.height
          );
        }
      }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 15;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("Total Paid:", 140, finalY);
    doc.text(`Rs. ${payment.amount.toLocaleString()}`, 190, finalY, { align: "right" });

    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text("Thank you for choosing us!", 105, 280, { align: "center" });

    try {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      const pdfBlob = doc.output('blob');
      
      if (isMobile && navigator.canShare) {
        const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
        
        const messageText = `Hello ${customer.fullName},\n\nHere is your payment receipt of Rs. ${payment.amount} for your ${customer.subscriptionPlan} plan at ${gymSettings.gymName}.\n\nThank you!`;
        
        if (navigator.canShare({ files: [file], title: 'Payment Receipt', text: messageText })) {
          await navigator.share({
            files: [file],
            title: 'Payment Receipt',
            text: messageText
          });
          toast.success("Opened share dialog");
        } else {
          doc.save(fileName);
          toast.info("Receipt downloaded. You can now share it manually.");
        }
      } else {
        doc.save(fileName);
        
        const fallbackText = encodeURIComponent(`Hello ${customer.fullName},\n\nYour payment of Rs. ${payment.amount} for your ${customer.subscriptionPlan} plan at ${gymSettings.gymName} was received successfully.\n\nI have downloaded the receipt to my device and will share it with you shortly.\n\nThank you!`);
        
        if (cleanPhone) {
          window.open(`https://wa.me/${cleanPhone}?text=${fallbackText}`, "_blank");
        }
      }
    } catch (error) {
      console.error('Error sharing receipt:', error);
      doc.save(fileName);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">Payments</h1>
        <p className="text-muted-foreground text-sm mt-1">Register and track payments</p>
      </div>

      <div className="flex gap-2 print:hidden">
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
        <div className="space-y-4">
          <div className="flex justify-end print:hidden">
            <Button variant="outline" size="sm" className="gap-2" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
              Print All Payments
            </Button>
          </div>
          <div className="rounded-xl border border-border bg-card overflow-hidden print:overflow-visible print:border-none">
            <div className="overflow-x-auto print:overflow-visible">
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
                  {payments.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-border/50 hover:bg-secondary/20 transition-colors"
                    >
                      <td className="p-4 text-sm font-medium text-foreground">
                        <span 
                          className="cursor-pointer hover:underline text-primary"
                          onClick={() => {
                            const customer = customers.find(c => c.id === p.customerId);
                            if (customer) setDetailsTarget(customer);
                          }}
                        >
                          {p.customerName}
                        </span>
                      </td>
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
                            <DropdownMenuItem onClick={() => handleSendToWhatsApp(p)} className="gap-2">
                              <FileText className="h-4 w-4" /> E-Bill (PDF)
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {payments.length === 0 && (
              <div className="p-12 text-center text-muted-foreground">
                <p className="text-sm">No payments yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      <CustomerDetailsDialog
        customer={detailsTarget}
        onClose={() => setDetailsTarget(null)}
      />
    </div>
  );
};

export default Payments;
