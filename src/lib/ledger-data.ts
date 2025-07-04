
export type Ledger = {
  id: string;
  name: string;
  type: 'group' | 'ledger';
  balance?: number;
  position?: number;
  children?: Ledger[];
};

export const ledgerData: Ledger[] = [
  {
    id: 'assets',
    name: 'Assets',
    type: 'group',
    position: 1,
    children: [
        {
            id: 'current-assets',
            name: 'Current Assets',
            type: 'group',
            children: [
              { id: 'bank-accounts', name: 'Bank Accounts', type: 'group', children: [
                { id: 'ledger-hdfc', name: 'HDFC Bank', type: 'ledger' },
                { id: 'ledger-icici', name: 'ICICI Bank', type: 'ledger' },
              ] },
              { id: 'cash-in-hand', name: 'Cash-in-hand', type: 'group', children: [
                { id: 'ledger-cash', name: 'Cash', type: 'ledger' },
              ] },
              { id: 'deposits-asset', name: 'Deposits (Asset)', type: 'group', children: [] },
              { id: 'loans-advances-asset', name: 'Loans & Advances (Asset)', type: 'group', children: [] },
              { id: 'stock-in-hand', name: 'Stock-in-hand', type: 'group', children: [] },
              { id: 'sundry-debtors', name: 'Sundry Debtors', type: 'group', children: [
                { id: 'ledger-customer-a', name: 'Innovate Inc.', type: 'ledger' },
                { id: 'ledger-customer-b', name: 'Solutions Corp.', type: 'ledger' },
              ] },
            ]
        },
        {
            id: 'fixed-assets',
            name: 'Fixed Assets',
            type: 'group',
            children: [
                { id: 'ledger-furniture', name: 'Furniture & Fixtures', type: 'ledger' },
                { id: 'ledger-computers', name: 'Computers', type: 'ledger' },
            ]
        },
        {
            id: 'investments',
            name: 'Investments',
            type: 'group',
            children: []
        },
        {
            id: 'misc-expenses-asset',
            name: 'Misc. Expenses (ASSET)',
            type: 'group',
            children: []
        }
    ]
  },
  {
    id: 'liabilities',
    name: 'Liabilities',
    type: 'group',
    position: 2,
    children: [
        {
            id: 'current-liabilities',
            name: 'Current Liabilities',
            type: 'group',
            children: [
              { id: 'duties-taxes', name: 'Duties & Taxes', type: 'group', children: [
                 { id: 'ledger-gst', name: 'GST Payable', type: 'ledger' },
              ] },
              { id: 'provisions', name: 'Provisions', type: 'group', children: [] },
              { id: 'sundry-creditors', name: 'Sundry Creditors', type: 'group', children: [
                { id: 'ledger-vendor-a', name: 'Cloud Services LLC', type: 'ledger' },
                { id: 'ledger-vendor-b', name: 'Office Supplies R Us', type: 'ledger' },
              ] },
            ]
        },
        {
            id: 'loans-liability',
            name: 'Loans (Liability)',
            type: 'group',
            children: [
              { id: 'bank-od-ac', name: 'Bank OD A/c', type: 'group', children: [] },
              { id: 'secured-loans', name: 'Secured Loans', type: 'group', children: [] },
              { id: 'unsecured-loans', name: 'Unsecured Loans', type: 'group', children: [] },
            ]
        },
        {
            id: 'branch-divisions',
            name: 'Branch / Divisions',
            type: 'group',
            children: []
        },
        {
            id: 'suspense-ac',
            name: 'Suspense A/c',
            type: 'group',
            children: []
        },
    ]
  },
  {
      id: 'equity',
      name: 'Equity',
      type: 'group',
      position: 3,
      children: [
          {
            id: 'capital-account',
            name: 'Capital Account',
            type: 'group',
            children: [
                { id: 'reserves-surplus', name: 'Reserves & Surplus', type: 'group', children: [
                    { id: 'ledger-retained-earnings', name: 'Retained Earnings', type: 'ledger' },
                ] }
            ]
          }
      ]
  },
  {
      id: 'income',
      name: 'Income',
      type: 'group',
      position: 4,
      children: [
        {
            id: 'direct-incomes',
            name: 'Direct Incomes',
            type: 'group',
            children: []
        },
        {
            id: 'indirect-incomes',
            name: 'Indirect Incomes',
            type: 'group',
            children: [
                { id: 'ledger-interest-received', name: 'Interest Received', type: 'ledger' },
            ]
        },
        {
            id: 'sales-accounts',
            name: 'Sales Accounts',
            type: 'group',
            children: [
                { id: 'ledger-domestic-sales', name: 'Domestic Sales', type: 'ledger' },
                { id: 'ledger-export-sales', name: 'Export Sales', type: 'ledger' },
            ]
        },
      ]
  },
  {
      id: 'expenses',
      name: 'Expenses',
      type: 'group',
      position: 5,
      children: [
        {
            id: 'direct-expenses',
            name: 'Direct Expenses',
            type: 'group',
            children: []
        },
        {
            id: 'indirect-expenses',
            name: 'Indirect Expenses',
            type: 'group',
            children: [
                { id: 'ledger-rent', name: 'Rent Expense', type: 'ledger' },
                { id: 'ledger-salaries', name: 'Salaries Expense', type: 'ledger' },
                { id: 'ledger-office-supplies', name: 'Office Supplies', type: 'ledger' },
            ]
        },
        {
            id: 'purchase-accounts',
            name: 'Purchase Accounts',
            type: 'group',
            children: []
        },
      ]
  }
];
