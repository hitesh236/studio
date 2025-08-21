
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

import { staticCustomers, staticVendors } from './customer-data';

export function generateData(count: number = 20): Person[] {
    const allPeople = [...staticCustomers, ...staticVendors];
    
    // If you need more than the static data, you could generate more dynamically here.
    // For now, we'll just return the static data combined.
    return allPeople;
}
