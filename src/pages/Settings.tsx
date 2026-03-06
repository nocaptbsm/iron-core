import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Upload, X, Building2 } from "lucide-react";
import { useRef } from "react";

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    gymName: "",
    address: "",
    phone: "",
    proprietor: "",
    gymLogo: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing settings from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("gym_settings");
    if (saved) {
      try {
        setForm(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, gymLogo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setForm({ ...form, gymLogo: "" });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulating save to API/DB but storing locally for persistence for now
    setTimeout(() => {
      localStorage.setItem("gym_settings", JSON.stringify(form));
      toast.success("Settings saved successfully!");
      setLoading(false);
    }, 600);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your gym profile and contact details.</p>
        </div>

        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSave} 
          className="rounded-xl border border-border bg-card p-6 space-y-7 shadow-sm"
        >
          {/* Logo Upload Section */}
          <div className="flex flex-col items-center sm:items-start gap-4 pb-4 border-b border-border/50">
            <Label className="text-base">Gym Logo (Optional)</Label>
            <div className="flex items-center gap-6">
              {form.gymLogo ? (
                <div className="relative group">
                  <div className="h-24 w-24 rounded-xl border border-border overflow-hidden bg-secondary/20 flex items-center justify-center">
                    <img src={form.gymLogo} alt="Gym Logo" className="w-full h-full object-contain" />
                  </div>
                  <button 
                    type="button" 
                    onClick={removeLogo} 
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="h-24 w-24 rounded-xl border border-dashed border-border/60 bg-secondary/10 flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-muted-foreground/50" />
                </div>
              )}
              
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {form.gymLogo ? "Change Logo" : "Upload Logo"}
                </Button>
                <p className="text-xs text-muted-foreground">Recommended: Square image, max 2MB.</p>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="gymName">Gym Name</Label>
              <Input 
                id="gymName" 
                placeholder="Enter Gym Name" 
                value={form.gymName} 
                onChange={handleChange} 
                className="bg-secondary/50 border-border" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input 
                id="address" 
                placeholder="Enter complete address" 
                value={form.address} 
                onChange={handleChange} 
                className="bg-secondary/50 border-border" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                placeholder="Enter phone number" 
                value={form.phone} 
                onChange={handleChange} 
                className="bg-secondary/50 border-border" 
                type="tel"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proprietor">Proprietor Name</Label>
              <Input 
                id="proprietor" 
                placeholder="Enter Owner/Proprietor Name" 
                value={form.proprietor} 
                onChange={handleChange} 
                className="bg-secondary/50 border-border" 
              />
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </motion.form>
      </div>
    </DashboardLayout>
  );
}
