
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
    id: 'branch-divisions',
    name: 'Branch / Divisions',
    type: 'group',
    position: 1,
    children: []
  },
  {
    id: 'capital-account',
    name: 'Capital Account',
    type: 'group',
    position: 2,
    children: [
        { id: 'reserves-surplus', name: 'Reserves & Surplus', type: 'group', children: [] }
    ]
  },
  {
    id: 'current-assets',
    name: 'Current Assets',
    type: 'group',
    position: 3,
    children: [
      { id: 'bank-accounts', name: 'Bank Accounts', type: 'group', children: [] },
      { id: 'cash-in-hand', name: 'Cash-in-hand', type: 'group', children: [] },
      { id: 'deposits-asset', name: 'Deposits (Asset)', type: 'group', children: [] },
      { id: 'loans-advances-asset', name: 'Loans & Advances (Asset)', type: 'group', children: [] },
      { id: 'stock-in-hand', name: 'Stock-in-hand', type: 'group', children: [] },
      { id: 'sundry-debtors', name: 'Sundry Debtors', type: 'group', children: [] },
    ]
  },
  {
    id: 'current-liabilities',
    name: 'Current Liabilities',
    type: 'group',
    position: 4,
    children: [
      { id: 'duties-taxes', name: 'Duties & Taxes', type: 'group', children: [] },
      { id: 'provisions', name: 'Provisions', type: 'group', children: [] },
      { id: 'sundry-creditors', name: 'Sundry Creditors', type: 'group', children: [] },
    ]
  },
  {
    id: 'direct-expenses',
    name: 'Direct Expenses',
    type: 'group',
    position: 5,
    children: []
  },
  {
    id: 'direct-incomes',
    name: 'Direct Incomes',
    type: 'group',
    position: 6,
    children: []
  },
  {
    id: 'fixed-assets',
    name: 'Fixed Assets',
    type: 'group',
    position: 7,
    children: []
  },
  {
    id: 'indirect-expenses',
    name: 'Indirect Expenses',
    type: 'group',
    position: 8,
    children: []
  },
  {
    id: 'indirect-incomes',
    name: 'Indirect Incomes',
    type: 'group',
    position: 9,
    children: []
  },
  {
    id: 'investments',
    name: 'Investments',
    type: 'group',
    position: 10,
    children: []
  },
  {
    id: 'loans-liability',
    name: 'Loans (Liability)',
    type: 'group',
    position: 11,
    children: [
      { id: 'bank-od-ac', name: 'Bank OD A/c', type: 'group', children: [] },
      { id: 'secured-loans', name: 'Secured Loans', type: 'group', children: [] },
      { id: 'unsecured-loans', name: 'Unsecured Loans', type: 'group', children: [] },
    ]
  },
  {
    id: 'misc-expenses-asset',
    name: 'Misc. Expenses (ASSET)',
    type: 'group',
    position: 12,
    children: []
  },
  {
    id: 'purchase-accounts',
    name: 'Purchase Accounts',
    type: 'group',
    position: 13,
    children: []
  },
  {
    id: 'sales-accounts',
    name: 'Sales Accounts',
    type: 'group',
    position: 14,
    children: []
  },
  {
    id: 'suspense-ac',
    name: 'Suspense A/c',
    type: 'group',
    position: 15,
    children: []
  },
];
