
import { generateData } from '@/lib/data';

export type PurchaseBillItem = {
  id: number;
  name: string;
  quantity: number;
  rate: number;
};

export type PurchaseBill = {
  id: string;
  billNumber: string;
  vendorName: string;
  billDate: Date;
  dueDate: Date;
  amount: number;
  paymentStatus: 'Outstanding' | 'Partially Paid' | 'Paid' | 'Overdue';
  amountPaid: number;
  amountDue: number;
  items: PurchaseBillItem[];
};

const vendors = generateData(20).filter(p => p.type === 'Vendor');
const vendorNames = vendors.map(v => v.company);
const itemNames = ['Office Supplies', 'Cloud Hosting Subscription', 'Marketing Services', 'Raw Material A', 'Component B'];

const getRandomElement = <T>(arr: T[] | readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

export function generatePurchaseBills(count: number): PurchaseBill[] {
  const bills: PurchaseBill[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const items: PurchaseBillItem[] = [];
    const itemCount = Math.floor(Math.random() * 3) + 1;
    let amount = 0;
    for (let j = 0; j < itemCount; j++) {
        const quantity = Math.floor(Math.random() * 10) + 1;
        const rate = (Math.floor(Math.random() * 30) + 1) * 25;
        items.push({
            id: j + 1,
            name: getRandomElement(itemNames),
            quantity,
            rate,
        });
        amount += quantity * rate;
    }
    
    const billDate = getRandomDate(new Date(now.getFullYear(), now.getMonth() - 2, 1), now);
    const dueDate = new Date(billDate);
    dueDate.setDate(dueDate.getDate() + 30);

    const paymentRandom = Math.random();
    let amountPaid: number;

    if (paymentRandom < 0.25) {
        amountPaid = amount;
    } else if (paymentRandom < 0.5) {
        amountPaid = (Math.random() * 0.8 + 0.1) * amount;
    } else {
        amountPaid = 0;
    }

    const amountDue = Math.max(0, amount - amountPaid);
    let paymentStatus: PurchaseBill['paymentStatus'];

    if (amountDue <= 0.01) {
        paymentStatus = 'Paid';
    } else {
        if (now > dueDate) {
            paymentStatus = 'Overdue';
        } else if (amountPaid > 0) {
            paymentStatus = 'Partially Paid';
        } else {
            paymentStatus = 'Outstanding';
        }
    }

    const bill: PurchaseBill = {
      id: `PB-${2000 + i}`,
      billNumber: `BILL-${2024}-${100 + i}`,
      vendorName: getRandomElement(vendorNames),
      billDate,
      dueDate,
      amount,
      paymentStatus,
      amountPaid,
      amountDue,
      items,
    };
    bills.push(bill);
  }
  return bills;
}
