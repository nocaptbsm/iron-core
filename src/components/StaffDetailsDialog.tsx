import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGym } from "@/context/GymContext";
import { Staff } from "@/lib/mockData";
import { Phone, MapPin, BadgeInfo } from "lucide-react";

interface StaffDetailsDialogProps {
  staffMember: Staff | null;
  onClose: () => void;
}

export function StaffDetailsDialog({ staffMember, onClose }: StaffDetailsDialogProps) {
  const { expenses } = useGym();
  const [isImageExpanded, setIsImageExpanded] = useState(false);

  // Filter expenses implicitly by finding expenses which have this staff as staffId
  const salaryHistory = expenses.filter(
    (e) => e.category === 'Salary' && e.staffId === staffMember?.id
  );

  return (
    <>
      <Dialog open={!!staffMember} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Staff ID Card</DialogTitle>
          </DialogHeader>
          {staffMember && (
            <div className="space-y-6 pt-4">
              <div className="flex items-start gap-4">
                {staffMember.photo ? (
                  <button onClick={() => setIsImageExpanded(true)} className="shrink-0 relative group">
                    <img 
                      src={staffMember.photo} 
                      alt={staffMember.fullName} 
                      className="h-20 w-20 rounded-full object-cover border-2 border-primary/20 group-hover:opacity-80 transition-opacity" 
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                      <span className="bg-black/50 text-white text-xs px-2 py-1 rounded">View</span>
                    </div>
                  </button>
                ) : (
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-2xl font-bold text-primary">
                      {staffMember.fullName.split(" ").map((n) => n[0]).join("")}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-foreground">{staffMember.fullName}</h3>
                  <div className="text-sm font-medium text-primary bg-primary/10 inline-flex px-2 py-0.5 rounded-full mt-1 border border-primary/20">
                    {staffMember.role}
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground space-y-1">
                    <p className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {staffMember.phone}</p>
                    {staffMember.idProof && (
                      <p className="flex items-center gap-1.5"><BadgeInfo className="h-3 w-3" /> {staffMember.idProof}</p>
                    )}
                    {staffMember.address && (
                      <p className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {staffMember.address}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm bg-secondary/20 p-4 rounded-xl border border-white/5">
                <div>
                  <p className="text-muted-foreground">Joining Date</p>
                  <p className="font-medium">{staffMember.joiningDate}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Monthly Salary</p>
                  <p className="font-medium text-green-500">₹{staffMember.salary.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-3 border-b border-border pb-1">Salary Payment History</h4>
                <div className="space-y-3">
                  {salaryHistory.length > 0 ? (
                    salaryHistory.map((expense) => (
                      <div key={expense.id} className="flex justify-between items-center bg-secondary/30 p-3 rounded-lg text-sm border border-border">
                        <div>
                          <p className="font-medium text-foreground">{expense.date}</p>
                          {expense.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">{expense.description}</p>
                          )}
                        </div>
                        <p className="font-bold text-green-500 text-base">₹{expense.amount.toLocaleString('en-IN')}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4 bg-secondary/10 rounded-lg border border-dashed border-border/50">
                      No salary payments recorded yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isImageExpanded} onOpenChange={setIsImageExpanded}>
        <DialogContent className="max-w-2xl bg-transparent border-none shadow-none overflow-hidden flex justify-center p-0">
          <DialogTitle className="sr-only">Expanded View</DialogTitle>
          {staffMember?.photo && (
            <img 
              src={staffMember.photo} 
              alt={staffMember.fullName} 
              className="max-w-full max-h-[85vh] rounded-lg object-contain shadow-2xl" 
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
