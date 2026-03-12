const fs = require('fs');

let content = fs.readFileSync('src/pages/Payments.tsx', 'utf8');

// 1. Remove static imports
content = content.replace('import jsPDF from "jspdf";\n', '');
content = content.replace('import autoTable from "jspdf-autotable";\n', '');

// 2. Add loading state
content = content.replace(
  'const [detailsTarget, setDetailsTarget] = useState<Customer | null>(null);',
  'const [detailsTarget, setDetailsTarget] = useState<Customer | null>(null);\n  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);'
);

// 3. Fix handlePrint
const printOriginal = `  const handlePrint = () => {
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();`;

const printReplacement = `  const handlePrint = async () => {
    setIsGeneratingPDF(true);
    await new Promise(r => setTimeout(r, 50));
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");
      const doc = new jsPDF();
      const date = new Date().toLocaleDateString();`;

content = content.replace(printOriginal, printReplacement);

// Fix handlePrint try/catch/finally closure
const printEndOriginal = `    doc.save(\`Payments_Report_\${date.replace(/\\//g, '-')}.pdf\`);
    toast.success("Payments report downloaded");
  };`;

const printEndReplacement = `    doc.save(\`Payments_Report_\${date.replace(/\\//g, '-')}.pdf\`);
    toast.success("Payments report downloaded");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate report.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };`;
content = content.replace(printEndOriginal, printEndReplacement);

// 4. Update WhatsApp Buttons UI
content = content.replace(
  '<Button variant="outline" size="sm" className="gap-2" onClick={handlePrint}>',
  '<Button variant="outline" size="sm" className="gap-2" onClick={handlePrint} disabled={isGeneratingPDF}>\n              {isGeneratingPDF ? <div className="h-4 w-4 rounded-full border-2 border-primary border-r-transparent animate-spin" /> : '
);
content = content.replace(
  '<Printer className="h-4 w-4" />\n              Print All Payments',
  '<Printer className="h-4 w-4" />}\n              {isGeneratingPDF ? "Generating..." : "Print All Payments"}'
);

// 5. Update Dropdown Menu E-Bill UI
content = content.replace(
  '<DropdownMenuItem onClick={() => handleSendToWhatsApp(p)} className="gap-2">',
  '<DropdownMenuItem onClick={() => handleSendToWhatsApp(p)} className="gap-2" disabled={isGeneratingPDF}>'
);
content = content.replace(
  '<FileText className="h-4 w-4" /> E-Bill (PDF)',
  '{isGeneratingPDF ? <div className="h-4 w-4 rounded-full border-2 border-current border-r-transparent animate-spin" /> : <FileText className="h-4 w-4" />}\n                              {isGeneratingPDF ? "Generating..." : "E-Bill (PDF)"}'
);

fs.writeFileSync('src/pages/Payments.tsx', content);
