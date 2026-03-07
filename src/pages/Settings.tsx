import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Upload, X, Building2 } from "lucide-react";

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    gymName: "",
    address: "",
    phone: "",
    proprietor: "",
  });

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

  const handleSave = async () => {
    setLoading(true);
    try {
      localStorage.setItem("gym_settings", JSON.stringify(form));
      window.dispatchEvent(new Event("gym_settings_updated"));
      toast.success("Settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your gym profile and contact details.</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex flex-col gap-4 pb-6 border-b border-border">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Gym Information
            </h2>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="phone">Contact Number</Label>
                <Input
                  id="phone"
                  placeholder="Support phone number"
                  value={form.phone}
                  onChange={handleChange}
                  className="bg-secondary/50 border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="proprietor">Proprietor Name</Label>
                <Input
                  id="proprietor"
                  placeholder="Manager / Owner name"
                  value={form.proprietor}
                  onChange={handleChange}
                  className="bg-secondary/50 border-border"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          onClick={handleSave}
          disabled={loading}
          className="w-full sm:w-auto min-w-[140px] gap-2"
        >
          {loading ? (
            <div className="h-4 w-4 rounded-full border-2 border-primary-foreground border-r-transparent animate-spin" />
          ) : (
            <>
              Save Profile Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
