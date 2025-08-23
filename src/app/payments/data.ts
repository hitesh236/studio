
import { staticCustomers } from '@/lib/customer-data';
import { staticVendors } from '@/lib/customer-data';
import type { SalesInvoice } from '../sales-invoices/data';
import type { PurchaseBill } from '../purchase/data';

export type PaymentVoucher = {
  id: string;
  voucherNumber: string;
  date: Date;
  partyType: 'Customer' | 'Vendor';
  partyName: string;
  paymentMode: 'Cash' | 'Bank Transfer' | 'Cheque' | 'UPI';
  amount: number;
  unallocatedAmount: number;
  allocations: {
    invoiceId: string;
    allocatedAmount: number;
  }[];
};

const customerNames = staticCustomers.map(c => c.company || `${c.firstName} ${c.lastName}`);
const vendorNames = staticVendors.map(v => v.company || `${v.firstName} ${v.lastName}`);
const paymentModes: PaymentVoucher['paymentMode'][] = ['Cash', 'Bank Transfer', 'Cheque', 'UPI'];

const getRandomElement = <T>(arr: T[] | readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

export const generatePayments = (count: number, type: 'receipt' | 'payment'): PaymentVoucher[] => {
    const vouchers: PaymentVoucher[] = [];
    const now = new Date();

    for (let i = 0; i < count; i++) {
        const partyType = type === 'receipt' ? 'Customer' : 'Vendor';
        const partyName = type === 'receipt' ? getRandomElement(customerNames) : getRandomElement(vendorNames);
        const amount = Math.floor(Math.random() * 50000) + 1000;
        const unallocatedAmount = Math.random() > 0.7 ? Math.floor(Math.random() * (amount / 2)) : 0;
        const allocatedAmount = amount - unallocatedAmount;

        vouchers.push({
            id: `PV-${1001 + i}`,
            voucherNumber: `${type === 'receipt' ? 'RCPT' : 'PYMT'}-${2024}-${101+i}`,
            date: getRandomDate(new Date(now.getFullYear(), now.getMonth() - 1, 1), now),
            partyType,
            partyName,
            paymentMode: getRandomElement(paymentModes),
            amount,
            unallocatedAmount,
            allocations: [{ invoiceId: `INV-100${i}`, allocatedAmount }]
        });
    }
    return vouchers;
};
