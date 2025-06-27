import { LedgerView, type Ledger } from './ledger-view';

const ledgerData: Ledger[] = [
    {
        id: 'assets',
        name: 'Assets',
        type: 'group',
        balance: 177500.00,
        children: [
            {
                id: 'current-assets',
                name: 'Current Assets',
                type: 'group',
                balance: 77500.00,
                children: [
                    { id: 'cash', name: 'Cash', type: 'ledger', balance: 15000.00 },
                    { id: 'bank-accounts', name: 'Bank Accounts', type: 'ledger', balance: 50000.00 },
                    { id: 'accounts-receivable', name: 'Accounts Receivable', type: 'ledger', balance: 12500.00 },
                ],
            },
            {
                id: 'fixed-assets',
                name: 'Fixed Assets',
                type: 'group',
                balance: 100000.00,
                children: [
                    { id: 'property', name: 'Property & Equipment', type: 'ledger', balance: 85000.00 },
                    { id: 'vehicles', name: 'Vehicles', type: 'ledger', balance: 15000.00 },
                ],
            },
        ],
    },
    {
        id: 'liabilities',
        name: 'Liabilities',
        type: 'group',
        balance: 55000.00,
        children: [
            {
                id: 'current-liabilities',
                name: 'Current Liabilities',
                type: 'group',
                balance: 30000.00,
                children: [
                    { id: 'accounts-payable', name: 'Accounts Payable', type: 'ledger', balance: 20000.00 },
                    { id: 'credit-card', name: 'Credit Card Payable', type: 'ledger', balance: 10000.00 },
                ],
            },
            {
                id: 'long-term-liabilities',
                name: 'Long-Term Liabilities',
                type: 'group',
                balance: 25000.00,
                children: [
                    { id: 'bank-loan', name: 'Bank Loan', type: 'ledger', balance: 25000.00 },
                ],
            },
        ],
    },
    {
        id: 'equity',
        name: 'Equity',
        type: 'group',
        balance: 122500.00,
        children: [
            { id: 'owners-equity', name: 'Owner\'s Equity', type: 'ledger', balance: 100000.00 },
            { id: 'retained-earnings', name: 'Retained Earnings', type: 'ledger', balance: 22500.00 },
        ],
    },
    {
        id: 'income',
        name: 'Income',
        type: 'group',
        balance: 95000.00,
        children: [
            { id: 'sales', name: 'Sales Revenue', type: 'ledger', balance: 90000.00 },
            { id: 'interest-income', name: 'Interest Income', type: 'ledger', balance: 5000.00 },
        ],
    },
    {
        id: 'expenses',
        name: 'Expenses',
        type: 'group',
        balance: 45000.00,
        children: [
            {
                id: 'cogs',
                name: 'Cost of Goods Sold',
                type: 'group',
                balance: 20000.00,
                children: [
                    { id: 'purchases', name: 'Purchases', type: 'ledger', balance: 20000.00 },
                ]
            },
            {
                id: 'operating-expenses',
                name: 'Operating Expenses',
                type: 'group',
                balance: 25000.00,
                children: [
                    { id: 'rent', name: 'Rent Expense', type: 'ledger', balance: 10000.00 },
                    { id: 'salaries', name: 'Salaries & Wages', type: 'ledger', balance: 12000.00 },
                    { id: 'utilities', name: 'Utilities Expense', type: 'ledger', balance: 3000.00 },
                ],
            },
        ],
    },
];

export default function MyAccountsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <LedgerView data={ledgerData} />
    </div>
  );
}
