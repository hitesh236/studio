
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
            name: 'Income (Direct)',
            type: 'group',
            children: [
                {
                    id: 'revenue-from-operations',
                    name: 'Revenue from Operations',
                    type: 'group',
                    children: [
                        { id: 'ledger-domestic-sales', name: 'Domestic Sales', type: 'ledger', balance: 1250000 },
                        { id: 'ledger-export-sales', name: 'Export Sales', type: 'ledger', balance: 350000 },
                    ]
                },
                { id: 'ledger-other-direct', name: 'Other Direct Income', type: 'ledger', balance: 25000 }
            ]
        },
        {
            id: 'indirect-incomes',
            name: 'Income (Indirect)',
            type: 'group',
            children: [
                { id: 'ledger-interest-received', name: 'Interest Received', type: 'ledger', balance: 15000 },
                { id: 'ledger-commission', name: 'Commission Received', type: 'ledger', balance: 45000 },
                { id: 'ledger-dividend', name: 'Dividend Received', type: 'ledger', balance: 20000 },
                { id: 'ledger-gain-sale-asset', name: 'Gain on Sale of Asset', type: 'ledger', balance: 5000 },
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
            name: 'Expenses (Direct)',
            type: 'group',
            children: [
                {
                    id: 'cogs',
                    name: 'Cost of Goods Sold',
                    type: 'group',
                    children: [
                         { id: 'ledger-opening-stock', name: 'Opening Stock', type: 'ledger', balance: 150000 },
                         { id: 'ledger-purchases', name: 'Purchases', type: 'ledger', balance: 650000 },
                         { id: 'ledger-closing-stock', name: 'Closing Stock', type: 'ledger', balance: -200000 },
                    ]
                },
                {
                    id: 'factory-overheads',
                    name: 'Factory Overheads',
                    type: 'group',
                    children: [
                        { id: 'ledger-factory-rent', name: 'Factory Rent', type: 'ledger', balance: 50000 },
                        { id: 'ledger-wages', name: 'Wages', type: 'ledger', balance: 100000 },
                    ]
                },
                { id: 'ledger-other-direct-expenses', name: 'Other Direct Expenses', type: 'ledger', balance: 15000 },
            ]
        },
        {
            id: 'indirect-expenses',
            name: 'Expenses (Indirect)',
            type: 'group',
            children: [
                {
                    id: 'operating-expenses',
                    name: 'Operating Expenses',
                    type: 'group',
                    children: [
                        { id: 'ledger-salaries', name: 'Salaries & Wages', type: 'ledger', balance: 450000 },
                        { id: 'ledger-rent', name: 'Rent & Rates', type: 'ledger', balance: 120000 },
                        { id: 'ledger-office-supplies', name: 'Printing & Stationery', type: 'ledger', balance: 35000 },
                        { id: 'ledger-internet', name: 'Telephone & Internet', type: 'ledger', balance: 25000 },
                        { id: 'ledger-misc-operating-exp', name: 'Miscellaneous Operating Expenses', type: 'ledger', balance: 11500 },
                    ]
                },
                {
                    id: 'financial-expenses',
                    name: 'Financial Expenses',
                    type: 'group',
                    children: [
                        { id: 'ledger-bank-charges', name: 'Bank Charges', type: 'ledger', balance: 5000 },
                        { id: 'ledger-interest-loans', name: 'Interest on Loans', type: 'ledger', balance: 60000 },
                    ]
                },
                {
                    id: 'selling-expenses',
                    name: 'Selling & Distribution',
                    type: 'group',
                    children: [
                        { id: 'ledger-advertising', name: 'Advertising & Marketing', type: 'ledger', balance: 75000 },
                        { id: 'ledger-freight-outward', name: 'Freight Outward', type: 'ledger', balance: 30000 },
                        { id: 'ledger-sales-commission', name: 'Sales Commission', type: 'ledger', balance: 50000 },
                    ]
                },
                {
                    id: 'depreciation',
                    name: 'Depreciation & Amortization',
                    type: 'group',
                    children: [
                        { id: 'ledger-dep-computers', name: 'Depreciation on Computers', type: 'ledger', balance: 40000 },
                        { id: 'ledger-dep-furniture', name: 'Depreciation on Furniture', type: 'ledger', balance: 20000 },
                    ]
                },
                { id: 'ledger-other-indirect-expenses', name: 'Other Indirect Expenses', type: 'ledger', balance: 7500 },
            ]
        },
      ]
  }
];
