
export type Person = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  phone: string;
  saleAmount: number;
  rating: number;
  status: "Active" | "Inactive";
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  bio: string;
  isExpanded?: boolean;
  gstin?: string;
  type: 'Customer' | 'Vendor';
  balance: number;
  lastSeen: Date;
};
