
import { DollarSign, Wallet, TrendingDown, TrendingUp, Landmark, FileText, FileWarning, CheckCircle2 } from "lucide-react";

export const kpiData = [
  {
    title: "Total Revenue",
    value: "₹45,231.89",
    description: "+20.1% from last month",
    icon: DollarSign,
    variant: "primary"
  },
  {
    title: "Total Payables",
    value: "₹12,871.20",
    description: "+15.3% from last month",
    icon: Wallet,
  },
  {
    title: "Total Receivables",
    value: "₹23,150.75",
    description: "+5.7% from last month",
    icon: TrendingUp,
  },
  {
    title: "Net Profit",
    value: "₹10,543.12",
    description: "+18.2% from last month",
    icon: TrendingUp,
  },
];

export const chartData = {
    incomeExpense: [
        { month: "Jan", income: 4000, expense: 2400 },
        { month: "Feb", income: 3000, expense: 1398 },
        { month: "Mar", income: 5000, expense: 9800 },
        { month: "Apr", income: 4780, expense: 3908 },
        { month: "May", income: 3890, expense: 4800 },
        { month: "Jun", income: 4390, expense: 3800 },
    ],
    cashFlow: [
        { date: "01/07", cashIn: 4000, cashOut: 2400 },
        { date: "02/07", cashIn: 3000, cashOut: 1398 },
        { date: "03/07", cashIn: 2000, cashOut: 5800 },
        { date: "04/07", cashIn: 2780, cashOut: 3908 },
        { date: "05/07", cashIn: 1890, cashOut: 4800 },
        { date: "06/07", cashIn: 2390, cashOut: 3800 },
        { date: "07/07", cashIn: 3490, cashOut: 4300 },
    ],
};

export const recentInvoices = [
    { id: 'INV-001', customer: 'Global Tech Inc.', amount: 250.00, status: 'Paid' },
    { id: 'INV-002', customer: 'Innovate Solutions', amount: 150.75, status: 'Overdue' },
    { id: 'INV-003', customer: 'Synergy Co.', amount: 350.00, status: 'Outstanding' },
    { id: 'INV-004', customer: 'Apex Enterprises', amount: 450.50, status: 'Partially Paid' },
    { id: 'INV-005', customer: 'Starlight Ltd.', amount: 550.00, status: 'Outstanding' },
];

export const upcomingBills = [
    { id: 'BILL-101', vendor: 'Cloud Services LLC', amount: 99.99, dueDate: '2024-08-01' },
    { id: 'BILL-102', vendor: 'Office Supplies R Us', amount: 45.50, dueDate: '2024-08-05' },
    { id: 'BILL-103', vendor: 'Marketing Wizards', amount: 1200.00, dueDate: '2024-08-10' },
    { id: 'BILL-104', vendor: 'Rent A-Car', amount: 350.00, dueDate: '2024-08-12' },
];

export const bankAccounts = [
    { id: 'BANK-01', name: 'HDFC Bank - 1234', balance: 45231.89 },
    { id: 'BANK-02', name: 'ICICI Bank - 5678', balance: 12871.20 },
    { id: 'BANK-03', name: 'Cash in Hand', balance: 5350.00 },
];
