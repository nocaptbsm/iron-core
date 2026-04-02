import { useState } from "react";
import { Wallet, Plus, Zap, UserCheck, Wifi, Building, Briefcase, Download, Monitor, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGym } from "@/context/GymContext";
import { ExpenseCategory, Expense } from "@/lib/mockData";
import { format } from "date-fns";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

const CATEGORIES: { name: ExpenseCategory; icon: React.ElementType; color: string }[] = [
  { name: "Electricity", icon: Zap, color: "text-amber-500" },
  { name: "Owner's", icon: Briefcase, color: "text-blue-500" },
  { name: "Wifi", icon: Wifi, color: "text-cyan-500" },
  { name: "EMI", icon: Wallet, color: "text-rose-500" },
  { name: "Rent", icon: Building, color: "text-purple-500" },
  { name: "Salary", icon: UserCheck, color: "text-green-500" },
  { name: "Software", icon: Monitor, color: "text-indigo-500" },
  { name: "Miscellaneous", icon: MoreHorizontal, color: "text-gray-400" },
];

const Expenses = () => {
  const { expenses, staff, addExpense } = useGym();
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const [form, setForm] = useState({
    amount: "",
    date: format(new Date(), "yyyy-MM-dd"),
    description: "",
    staffId: "none",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Group expenses by category
  const expensesByCategory = CATEGORIES.reduce((acc, cat) => {
    const catExpenses = expenses.filter((e) => e.category === cat.name);
    const total = catExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    // Most recent expense
    const sorted = [...catExpenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const latestDate = sorted.length > 0 ? sorted[0].date : undefined;

    acc[cat.name] = acc[cat.name] || { total: 0, latestDate: undefined, expenses: [] };
    acc[cat.name].total += total;
    acc[cat.name].latestDate = latestDate;
    acc[cat.name].expenses = sorted;
    return acc;
  }, {} as Record<ExpenseCategory, { total: number; latestDate?: string; expenses: Expense[] }>);

  const handlePrintExpenses = async () => {
    setIsGeneratingPDF(true);
    await new Promise((resolve) => setTimeout(resolve, 50)); // UI delay

    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF();
      const date = new Date().toLocaleDateString();

      let gymSettings = { gymName: "GYM REPORT" };
      try {
        const saved = localStorage.getItem("gym_settings");
        if (saved) {
          gymSettings = { ...gymSettings, ...JSON.parse(saved) };
        }
      } catch (e) {
        console.error(e);
      }

      // Header
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text(gymSettings.gymName || "EXPENSES REPORT", 190, 20, { align: "right" });

      let currentY = 28;
      
      currentY += 10;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("All Expenses", 15, currentY);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated on: ${date}`, 15, currentY + 6);

      currentY += 12;

      const sortedOverall = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const tableData = sortedOverall.map(e => {
        let staffName = "-";
        if (e.staffId) {
          const s = staff.find(st => st.id === e.staffId);
          if (s) staffName = s.fullName;
        }
        return [
          e.date,
          e.category,
          e.category === "Salary" ? staffName : e.description || "-",
          `Rs.${e.amount}`
        ];
      });

      autoTable(doc, {
        startY: currentY,
        head: [["Date", "Category", "Description / Staff", "Amount"]],
        body: tableData,
        theme: "striped",
        headStyles: { fillColor: [41, 128, 185] },
      });

      doc.save(`Expenses_Report_${date.replace(/\//g, '-')}.pdf`);
      toast.success("Expenses report downloaded");
    } catch (error) {
      console.error("Error generating report", error);
      toast.error("Failed to generate report");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleCardClick = (category: ExpenseCategory) => {
    setSelectedCategory(category);
    setIsFormOpen(true);
    setForm({
      amount: "",
      date: format(new Date(), "yyyy-MM-dd"),
      description: "",
      staffId: "none",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCategory || !form.amount || !form.date) {
      toast.error("Please fill all required fields");
      return;
    }

    if (selectedCategory === "Salary" && form.staffId === "none") {
      toast.error("Please select a staff member for Salary expenses");
      return;
    }

    setIsSubmitting(true);
    try {
      await addExpense({
        category: selectedCategory,
        amount: Number(form.amount),
        date: form.date,
        description: form.description || undefined,
        staffId: selectedCategory === "Salary" ? form.staffId : undefined,
      });

      toast.success(`${selectedCategory} expense added successfully!`);
      setIsFormOpen(false);
    } catch (error: unknown) {
      console.error(error);
      const msg = error instanceof Error ? error.message : "Failed to add expense.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">Expenses</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage and track gym expenditures</p>
        </div>
        <div className="flex gap-3 mt-4 lg:mt-0">
          <Button variant="outline" onClick={handlePrintExpenses} disabled={isGeneratingPDF} className="gap-2 w-full sm:w-auto">
            {isGeneratingPDF ? (
              <div className="h-4 w-4 rounded-full border-2 border-primary border-r-transparent animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {isGeneratingPDF ? "Generating..." : "Print / Download Report"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {CATEGORIES.map((cat, i) => {
          const stats = expensesByCategory[cat.name];
          const Icon = cat.icon;
          return (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card 
                className="overflow-hidden glass-panel border border-white/10 hover:bg-secondary/40 transition-all cursor-pointer group h-full"
                onClick={() => handleCardClick(cat.name)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-secondary/50 ${cat.color} group-hover:scale-110 transition-transform`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full h-8 w-8">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <h3 className="font-semibold text-lg text-foreground mb-1">{cat.name}</h3>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-2xl font-bold text-primary">₹{stats.total.toLocaleString()}</span>
                  </div>
                  {stats.latestDate ? (
                    <p className="text-xs text-muted-foreground">Last entry on: {stats.latestDate}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">No entries yet</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage {selectedCategory} Expenses</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
            
            {/* Form Section */}
            <div>
              <h4 className="font-semibold text-sm mb-4 border-b border-border pb-2">Add New Entry</h4>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹) *</Label>
                  <Input id="amount" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="bg-secondary/50" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input id="date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="bg-secondary/50" required />
                </div>
                
                {selectedCategory === "Salary" ? (
                  <div className="space-y-2">
                    <Label>Staff Member *</Label>
                    <Select value={form.staffId} onValueChange={(v) => setForm({ ...form, staffId: v })}>
                      <SelectTrigger className="bg-secondary/50">
                        <SelectValue placeholder="Select Staff" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">-- Select Staff --</SelectItem>
                        {staff.map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.fullName} ({s.role})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input id="description" maxLength={200} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-secondary/50" placeholder="E.g. Router replacement" />
                  </div>
                )}
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Expense"}
                </Button>
              </form>
            </div>

            {/* History Section */}
            <div>
              <h4 className="font-semibold text-sm mb-4 border-b border-border pb-2 flex items-center justify-between">
                <span>Recent History</span>
                {selectedCategory && expensesByCategory[selectedCategory].expenses.length > 0 && (
                  <span className="text-xs font-normal text-muted-foreground bg-secondary px-2 rounded-full">
                    {expensesByCategory[selectedCategory].expenses.length} total
                  </span>
                )}
              </h4>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {selectedCategory && expensesByCategory[selectedCategory].expenses.length > 0 ? (
                  expensesByCategory[selectedCategory].expenses.map((expense) => {
                    let displayName = expense.description;
                    if (selectedCategory === "Salary" && expense.staffId) {
                      const staffMember = staff.find(s => s.id === expense.staffId);
                      displayName = staffMember ? `Paid to ${staffMember.fullName}` : "Unknown Staff";
                    }
                    
                    return (
                      <div key={expense.id} className="flex justify-between items-center bg-secondary/30 p-3 rounded-lg text-sm border border-border">
                        <div>
                          <p className="font-medium text-foreground">{expense.date}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[120px]">{displayName || "No description"}</p>
                        </div>
                        <p className="font-bold text-red-500 text-base">₹{expense.amount}</p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-6 bg-secondary/10 rounded-lg border border-dashed border-border/50">
                    No entries yet.
                  </p>
                )}
              </div>
            </div>

          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Expenses;
