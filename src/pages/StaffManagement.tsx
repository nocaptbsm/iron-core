import { useState, useRef, useCallback, useEffect } from "react";
import { Search, Phone, Plus, UsersIcon, Camera, SwitchCamera, Upload, X } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useGym } from "@/context/GymContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Staff } from "@/lib/mockData";
import { format } from "date-fns";
import { toast } from "sonner";
import { StaffDetailsDialog } from "@/components/StaffDetailsDialog";

const StaffManagement = () => {
  const { staff, addStaff } = useGym();
  const [search, setSearch] = useState("");
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [detailsTarget, setDetailsTarget] = useState<Staff | null>(null);

  const [form, setForm] = useState({
    fullName: "",
    role: "",
    phone: "",
    salary: "",
    joiningDate: format(new Date(), "yyyy-MM-dd"),
    address: "",
    idProof: "",
  });
  const [photo, setPhoto] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Camera States
  const [cameraOpen, setCameraOpen] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = staff.filter(
    (s) =>
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search) ||
      s.role.toLowerCase().includes(search.toLowerCase())
  );

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const compressImage = (dataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const MAX_WIDTH = 600;

        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.4)); // High compression
        } else {
          resolve(dataUrl);
        }
      };
      img.src = dataUrl;
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        if (typeof reader.result === 'string') {
          const compressed = await compressImage(reader.result);
          setPhoto(compressed);
        }
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
      const video = videoRef.current;

      const MAX_WIDTH = 600;
      let width = video.videoWidth;
      let height = video.videoHeight;

      if (width > MAX_WIDTH) {
        height = Math.round((height * MAX_WIDTH) / width);
        width = MAX_WIDTH;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        if (facingMode === "user") {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, width, height);
        setPhoto(canvas.toDataURL("image/jpeg", 0.4));
        stopCamera();
      }
    }
  };

  const flipCamera = () => {
    const newMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(newMode);
    startCameraWithMode(newMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.fullName || !form.role || !form.phone || !form.salary || !form.joiningDate) {
      toast.error("Please fill all required primary fields");
      return;
    }

    if (form.phone.replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid phone number (min 10 digits)");
      return;
    }

    setIsSubmitting(true);
    try {
      await addStaff({
        fullName: form.fullName,
        role: form.role,
        phone: form.phone,
        salary: Number(form.salary),
        joiningDate: form.joiningDate,
        address: form.address || undefined,
        idProof: form.idProof || undefined,
        photo: photo || undefined,
      });

      toast.success("Staff member added successfully!");
      setIsAddStaffOpen(false);
      setForm({
        fullName: "",
        role: "",
        phone: "",
        salary: "",
        joiningDate: format(new Date(), "yyyy-MM-dd"),
        address: "",
        idProof: "",
      });
      setPhoto(null);
    } catch (error: unknown) {
      console.error(error);
      const msg = error instanceof Error ? error.message : "Failed to add staff member.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">Staff Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage gym trainers and helpers</p>
        </div>
        <div className="flex gap-3 mt-4 lg:mt-0">
          <Button onClick={() => setIsAddStaffOpen(true)} className="gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Add Staff
          </Button>
        </div>
      </div>

      <div className="relative max-w-md print:hidden">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search by name, role, or phone..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="pl-10 bg-card border-border" 
        />
      </div>

      <div className="glass-panel rounded-xl border border-white/10 overflow-hidden print:border-none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Staff Details</th>
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Contact</th>
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Joined</th>
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Salary</th>
                <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((member, i) => (
                <motion.tr
                  key={member.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-border/50 hover:bg-secondary/20 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {member.photo ? (
                        <img src={member.photo} alt={member.fullName} className="h-10 w-10 rounded-full object-cover shrink-0 border border-border" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-border">
                          <UsersIcon className="h-5 w-5 text-primary" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-foreground">{member.fullName}</p>
                        <p className="text-xs text-primary font-medium">{member.role}</p>
                        <div className="sm:hidden mt-1 space-y-1">
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Phone className="h-3 w-3 shrink-0" />{member.phone}
                          </p>
                          <p className="text-xs text-green-500 font-medium">₹{member.salary.toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    <div className="flex items-center gap-1.5 text-sm text-foreground">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      {member.phone}
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell text-sm text-muted-foreground">
                    {member.joiningDate}
                  </td>
                  <td className="p-4 hidden sm:table-cell text-sm font-medium text-green-500">
                    ₹{member.salary.toLocaleString('en-IN')}
                  </td>
                  <td className="p-4 text-right">
                    <Button variant="outline" size="sm" onClick={() => setDetailsTarget(member)} className="gap-2 text-xs">
                      View ID Card
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">
            <p className="text-sm">No staff found</p>
          </div>
        )}
      </div>

      <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Staff Member</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 mt-2">
            <div className="flex flex-col items-center gap-3">
              {photo ? (
                <div className="relative">
                  <img src={photo} alt="Staff" className="h-28 w-28 rounded-full object-cover border-2 border-primary/20" />
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
                <Label htmlFor="fullName">Full Name *</Label>
                <Input id="fullName" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="bg-secondary/50" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role / Designation *</Label>
                <Input id="role" placeholder="e.g. Trainer, Manager, Cleaner" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="bg-secondary/50" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-secondary/50" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary">Salary (₹) *</Label>
                <Input id="salary" type="number" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} className="bg-secondary/50" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="joiningDate">Joining Date *</Label>
                <Input id="joiningDate" type="date" value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} className="bg-secondary/50" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="idProof">ID Proof Number (Aadhar/PAN)</Label>
                <Input id="idProof" maxLength={50} value={form.idProof} onChange={(e) => setForm({ ...form, idProof: e.target.value })} className="bg-secondary/50" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" maxLength={500} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="bg-secondary/50" />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-border mt-4">
              <Button type="button" variant="outline" onClick={() => {
                stopCamera();
                setIsAddStaffOpen(false);
              }}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Staff"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <StaffDetailsDialog staffMember={detailsTarget} onClose={() => setDetailsTarget(null)} />

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

export default StaffManagement;
