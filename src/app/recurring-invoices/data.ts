
import { staticCustomers } from '@/lib/customer-data';

export type RecurringInvoiceItem = {
  id: number;
  name: string;
  quantity: number;
  rate: number;
};

export type RecurringInvoice = {
  id: string;
  customerName: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate?: Date;
  nextInvoiceDate: Date;
  status: 'Active' | 'Paused' | 'Finished';
  amount: number;
  items: RecurringInvoiceItem[];
};

const customerNames = staticCustomers.map(c => c.company || `${c.firstName} ${c.lastName}`);
const frequencies: RecurringInvoice['frequency'][] = ['daily', 'weekly', 'monthly', 'yearly'];
const itemNames = ['Monthly Retainer', 'Service Subscription', 'Annual Maintenance', 'Hosting Plan'];

const getRandomElement = <T>(arr: T[] | readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

export function generateRecurringInvoices(count: number): RecurringInvoice[] {
  const invoices: RecurringInvoice[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const items: RecurringInvoiceItem[] = [];
    const itemCount = Math.floor(Math.random() * 2) + 1;
    let amount = 0;
    for (let j = 0; j < itemCount; j++) {
      const quantity = 1;
      const rate = (Math.floor(Math.random() * 40) + 1) * 250;
      items.push({ id: j + 1, name: getRandomElement(itemNames), quantity, rate });
      amount += quantity * rate;
    }

    const startDate = getRandomDate(new Date(now.getFullYear() - 1, now.getMonth(), 1), now);
    const hasEndDate = Math.random() > 0.5;
    const endDate = hasEndDate ? getRandomDate(new Date(now.getFullYear() + 1, 0, 1), new Date(now.getFullYear() + 2, 0, 1)) : undefined;

    const nextInvoiceDate = new Date(now);
    nextInvoiceDate.setDate(now.getDate() + Math.floor(Math.random() * 30));

    let status: RecurringInvoice['status'] = 'Active';
    const randomStatus = Math.random();
    if (endDate && endDate < now) {
      status = 'Finished';
    } else if (randomStatus < 0.2) {
      status = 'Paused';
    }

    const invoice: RecurringInvoice = {
      id: `RECUR-${1000 + i}`,
      customerName: getRandomElement(customerNames),
      frequency: getRandomElement(frequencies),
      startDate,
      endDate,
      nextInvoiceDate,
      status,
      amount,
      items,
    };
    invoices.push(invoice);
  }
  return invoices;
}
