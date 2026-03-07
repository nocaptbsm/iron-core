import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGym } from "@/context/GymContext";
import { Customer } from "@/lib/mockData";

interface CustomerDetailsDialogProps {
  customer: Customer | null;
  onClose: () => void;
}

export function CustomerDetailsDialog({ customer, onClose }: CustomerDetailsDialogProps) {
  const { payments } = useGym();
  const [isImageExpanded, setIsImageExpanded] = useState(false);

  return (
    <>
      <Dialog open={!!customer} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {customer && (
            <div className="space-y-6 pt-4">
              <div className="flex items-start gap-4">
                {customer.photo ? (
                  <button onClick={() => setIsImageExpanded(true)} className="shrink-0 relative group">
                    <img 
                      src={customer.photo} 
                      alt={customer.fullName} 
                      className="h-20 w-20 rounded-full object-cover border-2 border-primary/20 group-hover:opacity-80 transition-opacity" 
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                      <span className="bg-black/50 text-white text-xs px-2 py-1 rounded">View</span>
                    </div>
                  </button>
                ) : (
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-2xl font-bold text-primary">
                      {customer.fullName.split(" ").map((n) => n[0]).join("")}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-foreground">{customer.fullName}</h3>
                  <p className="text-sm text-muted-foreground">{customer.phone}</p>
                  <div className="mt-2 flex gap-2">
                    <Badge 
                      className={
                        customer.status === 'active' ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20' :
                        customer.status === 'expiring' ? 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20' :
                        customer.status === 'archived' ? 'bg-secondary/40 text-muted-foreground border-border' :
                        'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20'
                      }
                    >
                      {customer.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Gender</p>
                  <p className="font-medium">{customer.gender || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Joining Date</p>
                  <p className="font-medium">{customer.joiningDate}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Address</p>
                  <p className="font-medium">{customer.address || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Plan</p>
                  <p className="font-medium">{customer.subscriptionPlan}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Plan Ends</p>
                  <p className="font-medium">{customer.subscriptionEnd}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-3 border-b border-border pb-1">Payment History</h4>
                <div className="space-y-3">
                  {payments.filter(p => p.customerId === customer.id).length > 0 ? (
                    payments.filter(p => p.customerId === customer.id).map((payment) => (
                      <div key={payment.id} className="flex justify-between items-center bg-secondary/30 p-3 rounded-lg text-sm border border-border">
                        <div>
                          <p className="font-medium text-foreground">{payment.plan}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{payment.paymentDate} • {payment.mode}</p>
                        </div>
                        <p className="font-bold text-primary text-base">₹{payment.amount}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4 bg-secondary/10 rounded-lg border border-dashed border-border/50">
                      No payment history found.
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
          {customer?.photo && (
            <img 
              src={customer.photo} 
              alt={customer.fullName} 
              className="max-w-full max-h-[85vh] rounded-lg object-contain shadow-2xl" 
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
