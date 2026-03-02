import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Customer, Payment } from "@/lib/mockData";
import { differenceInDays, addMonths, format } from "date-fns";

interface GymContextType {
  customers: Customer[];
  payments: Payment[];
  addCustomer: (customer: Omit<Customer, "id" | "status">) => Promise<void>;
  addPayment: (payment: Omit<Payment, "id">) => Promise<void>;
  deleteCustomer: (id: string) => void;
  upgradeCustomer: (id: string, plan: Customer["subscriptionPlan"]) => void;
  getStats: () => { total: number; active: number; expiring: number; expired: number; revenue: number };
  loading: boolean;
}

const GymContext = createContext<GymContextType | undefined>(undefined);

const STORAGE_KEYS = {
  customers: "gym_customers",
  payments: "gym_payments",
};

const computeStatus = (endDate: string): Customer["status"] => {
  const end = new Date(endDate);
  const now = new Date();
  const diff = differenceInDays(end, now);
  if (diff < 0) return "expired";
  if (diff <= 3) return "expiring";
  return "active";
};

const safeParse = <T,>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const normalizeCustomer = (customer: Customer): Customer => ({
  ...customer,
  status: computeStatus(customer.subscriptionEnd),
});

const planDurations: Record<string, number> = {
  "1 month": 1,
  "3 months": 3,
  "6 months": 6,
  "12 months": 12,
};

export const GymProvider = ({ children }: { children: ReactNode }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedCustomers = safeParse<Customer[]>(window.localStorage.getItem(STORAGE_KEYS.customers), []);
    const storedPayments = safeParse<Payment[]>(window.localStorage.getItem(STORAGE_KEYS.payments), []);
    setCustomers(storedCustomers.map(normalizeCustomer));
    setPayments(storedPayments);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (loading) return;
    window.localStorage.setItem(STORAGE_KEYS.customers, JSON.stringify(customers.map(normalizeCustomer)));
  }, [customers, loading]);

  useEffect(() => {
    if (loading) return;
    window.localStorage.setItem(STORAGE_KEYS.payments, JSON.stringify(payments));
  }, [payments, loading]);

  const addCustomer = async (customer: Omit<Customer, "id" | "status">) => {
    const newCustomer: Customer = {
      ...customer,
      id: createId(),
      status: computeStatus(customer.subscriptionEnd),
    };
    setCustomers((prev) => [newCustomer, ...prev]);
  };

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    setPayments((prev) => prev.filter((p) => p.customerId !== id));
  };

  const upgradeCustomer = (id: string, plan: Customer["subscriptionPlan"]) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const months = planDurations[plan] || 1;
        const baseDate = new Date(c.subscriptionEnd) > new Date() ? new Date(c.subscriptionEnd) : new Date();
        const newEnd = format(addMonths(baseDate, months), "yyyy-MM-dd");
        return normalizeCustomer({
          ...c,
          subscriptionPlan: plan,
          subscriptionStart: format(new Date(), "yyyy-MM-dd"),
          subscriptionEnd: newEnd,
        });
      })
    );
  };

  const addPayment = async (payment: Omit<Payment, "id">) => {
    const customer = customers.find((c) => c.id === payment.customerId);
    const newPayment: Payment = {
      ...payment,
      id: createId(),
      customerName: payment.customerName || customer?.fullName || "Unknown",
    };
    setPayments((prev) => [newPayment, ...prev]);
  };

  const getStats = () => {
    const total = customers.length;
    const active = customers.filter((c) => computeStatus(c.subscriptionEnd) === "active").length;
    const expiring = customers.filter((c) => computeStatus(c.subscriptionEnd) === "expiring").length;
    const expired = customers.filter((c) => computeStatus(c.subscriptionEnd) === "expired").length;
    const revenue = payments.reduce((sum, p) => sum + p.amount, 0);
    return { total, active, expiring, expired, revenue };
  };

  return (
    <GymContext.Provider value={{ customers: customers.map(normalizeCustomer), payments, addCustomer, addPayment, deleteCustomer, upgradeCustomer, getStats, loading }}>
      {children}
    </GymContext.Provider>
  );
};

export const useGym = () => {
  const ctx = useContext(GymContext);
  if (!ctx) throw new Error("useGym must be used within GymProvider");
  return ctx;
};
