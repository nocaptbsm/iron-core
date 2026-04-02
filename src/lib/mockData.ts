export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  joiningDate: string;
  subscriptionPlan: '1 month' | '3 months' | '6 months' | '12 months' | 'others';
  subscriptionStart: string;
  subscriptionEnd: string;
  status: 'active' | 'expiring' | 'expired' | 'archived';
  isArchived?: boolean | null;
  photo?: string;
  address?: string;
  gender?: string;
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

export interface Staff {
  id: string;
  fullName: string;
  role: string;
  phone: string;
  salary: number;
  joiningDate: string;
  address?: string;
  idProof?: string;
  photo?: string;
}

export type ExpenseCategory = 'Electricity' | "Owner's" | 'Wifi' | 'EMI' | 'Rent' | 'Salary' | 'Software' | 'Miscellaneous';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  description?: string;
  staffId?: string; // Links to Staff member if category is 'Salary'
}


