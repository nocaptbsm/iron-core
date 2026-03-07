import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format, addMonths, addDays } from "date-fns";
import { useGym } from "@/context/GymContext";
import { Camera, X, SwitchCamera, Upload } from "lucide-react";
import { Customer } from "@/lib/mockData";

const planDurations: Record<string, number> = {
  "1 month": 1,
  "3 months": 3,
  "6 months": 6,
  "12 months": 12,
};

const AddCustomer = () => {
  const navigate = useNavigate();
  const { addCustomer } = useGym();
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    joiningDate: format(new Date(), "yyyy-MM-dd"),
    plan: "" as string,
    customDays: "",
    gender: "",
  });
  const [photo, setPhoto] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  const startCameraWithMode = useCallback(async (mode: "user" | "environment") => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: mode } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast.error("Could not access camera. Please check permissions.");
    }
  }, []);

  const startCamera = () => {
    setCameraOpen(true);
    setTimeout(() => {
      startCameraWithMode(facingMode);
    }, 100);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        if (facingMode === "user") {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(videoRef.current, 0, 0);
        setPhoto(canvas.toDataURL("image/jpeg", 0.8));
        stopCamera();
      }
    }
  };

  const flipCamera = () => {
    const newMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(newMode);
    startCameraWithMode(newMode);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.fullName || !form.phone || !form.joiningDate || !form.plan || !form.gender) {
      toast.error("Please fill all required fields");
      return;
    }

    if (form.phone.replace(/\D/g, "").length !== 12) { // 91 + 10 digits = 12
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    let expiryDate: string;
    if (form.plan === "others") {
      if (!form.customDays || parseInt(form.customDays) <= 0) {
        toast.error("Please enter a valid number of days");
        return;
      }
      expiryDate = format(addDays(new Date(form.joiningDate), parseInt(form.customDays)), "yyyy-MM-dd");
    } else {
      const months = planDurations[form.plan];
      expiryDate = format(addMonths(new Date(form.joiningDate), months), "yyyy-MM-dd");
    }

    addCustomer({
      fullName: form.fullName,
      phone: form.phone,
      address: form.address,
      joiningDate: form.joiningDate,
      subscriptionPlan: (form.plan === "others" ? `${form.customDays} days` : form.plan) as Customer["subscriptionPlan"],
      subscriptionStart: form.joiningDate,
      subscriptionEnd: expiryDate,
      photo: photo || undefined,
      gender: form.gender,
    });

    // Fetch gym name
    let gymName = "our Gym";
    try {
      const saved = localStorage.getItem("gym_settings");
      if (saved) {
        const settings = JSON.parse(saved);
        if (settings.gymName) gymName = settings.gymName;
      }
    } catch (e) {
      console.error("Failed to parse gym settings for WhatsApp message", e);
    }

    const cleanPhone = form.phone.replace(/\D/g, "");
    const planName = form.plan === "others" ? `${form.customDays} days` : form.plan;
    const message = `Hello ${form.fullName},\n\nWelcome to ${gymName}! Your subscription for ${planName} has been registered successfully. It is valid till ${expiryDate}.\n\nThank you!`;

    toast.success("Customer added successfully!");

    // Open WhatsApp in a new tab
    if (cleanPhone) {
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, "_blank");
    }

    navigate("/customers");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">Add Customer</h1>
        <p className="text-muted-foreground text-sm mt-1">Register a new gym member</p>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="rounded-xl border border-border bg-card p-6 space-y-5"
      >
        <div className="flex flex-col items-center gap-3">
          {photo ? (
            <div className="relative">
              <img src={photo} alt="Customer" className="h-28 w-28 rounded-full object-cover border-2 border-primary/20" />
              <button type="button" onClick={() => setPhoto(null)} className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="h-28 w-28 rounded-full bg-secondary/50 border border-dashed border-border flex items-center justify-center">
              <Camera className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={startCamera}>
            <Camera className="h-4 w-4" />
            {photo ? "Retake Photo" : "Capture Photo"}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" placeholder="Enter full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="bg-secondary/50 border-border" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="flex">
              <div className="flex items-center justify-center bg-secondary/80 border border-border border-r-0 rounded-l-md px-3 text-sm text-muted-foreground">
                +91
              </div>
              <Input
                id="phone"
                placeholder="XXXXX XXXXX"
                value={form.phone.replace(/^\+91\s*/, "")}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setForm({ ...form, phone: val ? `+91 ${val}` : "" });
                }}
                className="bg-secondary/50 border-border rounded-l-none"
                maxLength={10}
              />
            </div>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Address (Optional)</Label>
            <Input id="address" placeholder="Enter full address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="bg-secondary/50 border-border" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="joiningDate">Joining Date</Label>
            <Input id="joiningDate" type="date" value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} className="bg-secondary/50 border-border" />
          </div>
          <div className="space-y-2">
            <Label>Gender</Label>
            <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
              <SelectTrigger className="bg-secondary/50 border-border"><SelectValue placeholder="Select gender" /></SelectTrigger>
              <SelectContent>
                {["Male", "Female", "Other"].map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Subscription Plan</Label>
            <Select value={form.plan} onValueChange={(v) => setForm({ ...form, plan: v })}>
              <SelectTrigger className="bg-secondary/50 border-border"><SelectValue placeholder="Select plan" /></SelectTrigger>
              <SelectContent>
                {["1 month", "3 months", "6 months", "12 months", "others"].map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {form.plan === "others" && (
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="customDays">Number of Days</Label>
              <Input
                id="customDays"
                type="number"
                min="1"
                placeholder="e.g., 45"
                value={form.customDays}
                onChange={(e) => setForm({ ...form, customDays: e.target.value })}
                className="bg-secondary/50 border-border"
              />
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" className="flex-1">Register Customer</Button>
          <Button type="button" variant="outline" onClick={() => navigate("/customers")}>Cancel</Button>
        </div>
      </motion.form>

      <Dialog open={cameraOpen} onOpenChange={(open) => { if (!open) stopCamera(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Capture Photo</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-lg bg-secondary aspect-[4/3] object-cover" />
            <div className="flex gap-2 flex-wrap justify-center">
              <Button type="button" onClick={capturePhoto} className="gap-2">
                <Camera className="h-4 w-4" />
                Take Photo
              </Button>
              <Button type="button" variant="outline" onClick={flipCamera} className="gap-2">
                <SwitchCamera className="h-4 w-4" />
                Flip
              </Button>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-2">
                <Upload className="h-4 w-4" />
                Upload
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddCustomer;
