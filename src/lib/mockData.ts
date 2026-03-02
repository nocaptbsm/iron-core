export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  joiningDate: string;
  subscriptionPlan: '1 month' | '3 months' | '6 months' | '12 months';
  subscriptionStart: string;
  subscriptionEnd: string;
  status: 'active' | 'expiring' | 'expired';
  photo?: string;
}

export interface Payment {
  id: string;
  customerId: string;
  customerName: string;
  paymentDate: string;
  amount: number;
  plan: string;
  mode: 'Cash' | 'UPI' | 'Card';
}

export const mockCustomers: Customer[] = [];

export const mockPayments: Payment[] = [];

export const getStats = () => {
  const total = mockCustomers.length;
  const active = mockCustomers.filter(c => c.status === 'active').length;
  const expiring = mockCustomers.filter(c => c.status === 'expiring').length;
  const expired = mockCustomers.filter(c => c.status === 'expired').length;
  const revenue = mockPayments.reduce((sum, p) => sum + p.amount, 0);
  return { total, active, expiring, expired, revenue };
};
