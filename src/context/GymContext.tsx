import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Customer, Payment } from "@/lib/mockData";
import { differenceInDays, addMonths, format } from "date-fns";
import { supabase } from "@/lib/supabase";

import { Session } from "@supabase/supabase-js";

interface GymContextType {
  customers: Customer[];
  payments: Payment[];
  session: Session | null;
  addCustomer: (customer: Omit<Customer, "id" | "status">) => Promise<void>;
  addPayment: (payment: Omit<Payment, "id">) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  upgradeCustomer: (id: string, plan: Customer["subscriptionPlan"]) => Promise<void>;
  getStats: () => { total: number; active: number; expiring: number; expired: number; revenue: number };
  signOut: () => Promise<void>;
  loading: boolean;
}

const GymContext = createContext<GymContextType | undefined>(undefined);

const computeStatus = (endDate: string): Customer["status"] => {
  const end = new Date(endDate);
  const now = new Date();
  const diff = differenceInDays(end, now);
  if (diff < 0) return "expired";
  if (diff <= 3) return "expiring";
  return "active";
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizeCustomer = (customer: any): Customer => ({
  id: customer.id,
  fullName: customer.full_name || customer.fullName || "",
  phone: customer.phone,
  address: customer.address || undefined,
  gender: customer.gender || undefined,
  photo: customer.photo || undefined,
  joiningDate: customer.joining_date || customer.joiningDate || "",
  subscriptionPlan: customer.subscription_plan || customer.subscriptionPlan || "1 month",
  subscriptionStart: customer.subscription_start || customer.subscriptionStart || "",
  subscriptionEnd: customer.subscription_end || customer.subscriptionEnd || "",
  status: customer.status || computeStatus(customer.subscription_end || customer.subscriptionEnd),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizePayment = (payment: any): Payment => ({
  id: payment.id,
  customerId: payment.customer_id || payment.customerId,
  customerName: payment.customer_name || payment.customerName || "Unknown",
  paymentDate: payment.payment_date || payment.paymentDate || "",
  amount: Number(payment.amount),
  plan: payment.plan || "",
  mode: payment.mode || "",
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
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSupabaseData = async (userId: string) => {
    try {
      const { data: cData, error: cErr } = await supabase.from("customers").select("*").eq("user_id", userId).order("joiningDate", { ascending: false });
      const { data: pData, error: pErr } = await supabase.from("payments").select("*").eq("user_id", userId).order("paymentDate", { ascending: false });

      if (cErr) throw cErr;
      if (pErr) throw pErr;

      setCustomers((cData || []).map(normalizeCustomer));
      setPayments((pData || []).map(normalizePayment));
    } catch (error) {
      console.error("Error fetching from Supabase:", error);
    } finally {
      setLoading(false);
    }
  };

  const runMigration = async () => {
    const localCustomers = window.localStorage.getItem("gym_customers");
    const localPayments = window.localStorage.getItem("gym_payments");

    if (!localCustomers && !localPayments) return false;

    try {
      const cList = JSON.parse(localCustomers || "[]");
      const pList = JSON.parse(localPayments || "[]");

      if (cList.length === 0 && pList.length === 0) return false;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formattedCustomers = cList.map((c: any) => ({
        id: c.id,
        full_name: c.fullName,
        phone: c.phone,
        joining_date: c.joiningDate,
        subscription_plan: c.subscriptionPlan,
        subscription_start: c.subscriptionStart,
        subscription_end: c.subscriptionEnd,
        status: computeStatus(c.subscriptionEnd),
        photo: c.photo || null,
        address: c.address || null,
        gender: c.gender || null,
        user_id: session?.user?.id
      }));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formattedPayments = pList.map((p: any) => ({
        id: p.id,
        customer_id: p.customerId,
        customer_name: p.customerName || "Unknown",
        payment_date: p.paymentDate,
        amount: Number(p.amount),
        plan: p.plan,
        mode: p.mode,
        user_id: session?.user?.id
      }));

      if (formattedCustomers.length > 0) {
        await supabase.from("customers").upsert(formattedCustomers, { onConflict: "id" });
      }
      if (formattedPayments.length > 0) {
        await supabase.from("payments").upsert(formattedPayments, { onConflict: "id" });
      }

      window.localStorage.removeItem("gym_customers");
      window.localStorage.removeItem("gym_payments");
      console.log("Migration successful");
      return true;
    } catch (error) {
      console.error("Migration failed:", error);
      return false;
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        runMigration().then(() => fetchSupabaseData(session.user.id));
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchSupabaseData(session.user.id);
      } else {
        setCustomers([]);
        setPayments([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const addCustomer = async (customer: Omit<Customer, "id" | "status">) => {
    if (!session?.user) throw new Error("Must be logged in");

    const payload = {
      full_name: customer.fullName,
      phone: customer.phone,
      joining_date: customer.joiningDate,
      subscription_plan: customer.subscriptionPlan,
      subscription_start: customer.subscriptionStart,
      subscription_end: customer.subscriptionEnd,
      status: computeStatus(customer.subscriptionEnd),
      photo: customer.photo || null,
      address: customer.address || null,
      gender: customer.gender || null,
      user_id: session.user.id
    };

    const { data, error } = await supabase.from("customers").insert([payload]).select().single();
    if (error) {
      console.error("Error adding customer:", error);
      throw new Error(error.message || "Database insert failed");
    }
    if (data) {
      setCustomers((prev) => [normalizeCustomer(data), ...prev]);
    }
  };

  const deleteCustomer = async (id: string) => {
    const { error } = await supabase.from("customers").delete().eq("id", id);
    if (!error) {
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      setPayments((prev) => prev.filter((p) => p.customerId !== id));
    } else {
      console.error("Error deleting customer:", error);
    }
  };

  const upgradeCustomer = async (id: string, plan: Customer["subscriptionPlan"]) => {
    const c = customers.find(c => c.id === id);
    if (!c) return;

    const months = planDurations[plan] || 1;
    const baseDate = new Date(c.subscriptionEnd) > new Date() ? new Date(c.subscriptionEnd) : new Date();
    const newEnd = format(addMonths(baseDate, months), "yyyy-MM-dd");
    const newStart = format(new Date(), "yyyy-MM-dd");

    const payload = {
      subscription_plan: plan,
      subscription_start: newStart,
      subscription_end: newEnd,
      status: computeStatus(newEnd)
    };

    const { data, error } = await supabase.from("customers").update(payload).eq("id", id).select().single();

    if (error) {
      console.error("Error upgrading:", error);
      return;
    }

    setCustomers((prev) =>
      prev.map((cust) => (cust.id === id && data ? normalizeCustomer(data) : cust))
    );
  };

  const addPayment = async (payment: Omit<Payment, "id">) => {
    if (!session?.user) throw new Error("Must be logged in");

    const customer = customers.find((c) => c.id === payment.customerId);
    const payload = {
      customer_id: payment.customerId,
      customer_name: payment.customerName || customer?.fullName || "Unknown",
      payment_date: payment.paymentDate,
      amount: Number(payment.amount),
      plan: payment.plan,
      mode: payment.mode,
      user_id: session.user.id
    };

    const { data, error } = await supabase.from("payments").insert([payload]).select().single();
    if (error) {
      console.error("Error adding payment:", error);
      throw error;
    }
    if (data) {
      setPayments((prev) => [normalizePayment(data), ...prev]);
    }
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
    <GymContext.Provider value={{ customers, payments, session, addCustomer, addPayment, deleteCustomer, upgradeCustomer, getStats, signOut, loading }}>
      {children}
    </GymContext.Provider>
  );
};

export const useGym = () => {
  const ctx = useContext(GymContext);
  if (!ctx) throw new Error("useGym must be used within GymProvider");
  return ctx;
};
