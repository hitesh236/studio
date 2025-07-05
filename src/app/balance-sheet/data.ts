
import type { Ledger } from '@/lib/ledger-data';

// Note: Balances are structured so that Total Assets === Total Liabilities & Equity

export const assetsData: Ledger = {
  id: 'assets',
  name: 'Assets',
  type: 'group',
  children: [
    {
      id: 'fixed-assets',
      name: 'Fixed Assets',
      type: 'group',
      children: [
        { id: 'ledger-land-building', name: 'Land & Building', type: 'ledger', balance: 5000000, previousBalance: 4800000 },
        { id: 'ledger-plant-machinery', name: 'Plant & Machinery', type: 'ledger', balance: 3000000, previousBalance: 2800000 },
        { id: 'ledger-furniture-fixtures', name: 'Furniture & Fixtures', type: 'ledger', balance: 500000, previousBalance: 450000 },
        { id: 'ledger-computers', name: 'Computers', type: 'ledger', balance: 300000, previousBalance: 250000 },
      ]
    },
    {
      id: 'investments',
      name: 'Investments',
      type: 'group',
      children: [
        { id: 'ledger-shares', name: 'Shares', type: 'ledger', balance: 750000, previousBalance: 700000 },
        { id: 'ledger-mutual-funds', name: 'Mutual Funds', type: 'ledger', balance: 600000, previousBalance: 550000 },
      ]
    },
    {
      id: 'current-assets',
      name: 'Current Assets',
      type: 'group',
      children: [
        { id: 'ledger-cash-in-hand', name: 'Cash-in-Hand', type: 'ledger', balance: 50000, previousBalance: 45000 },
        { id: 'ledger-bank-accounts', name: 'Bank Accounts', type: 'ledger', balance: 1250000, previousBalance: 1100000 },
        {
          id: 'sundry-debtors',
          name: 'Sundry Debtors',
          type: 'group',
          children: [
            { id: 'ledger-customer-a', name: 'e.g., Customer A', type: 'ledger', balance: 800000, previousBalance: 750000 },
          ]
        },
        { id: 'ledger-advance-to-supplier', name: 'Advance to Supplier', type: 'ledger', balance: 150000, previousBalance: 140000 },
        { id: 'ledger-gst-input-credit', name: 'GST Input Credit', type: 'ledger', balance: 75000, previousBalance: 70000 },
      ]
    },
    {
        id: 'loans-advances-asset',
        name: 'Loans & Advances (Asset)',
        type: 'group',
        children: [
            { id: 'ledger-loans-to-employees', name: 'Loans to Employees', type: 'ledger', balance: 100000, previousBalance: 90000 },
            { id: 'ledger-advance-to-others', name: 'Advance to Others', type: 'ledger', balance: 50000, previousBalance: 40000 },
            { id: 'ledger-security-deposits', name: 'Security Deposits', type: 'ledger', balance: 200000, previousBalance: 200000 },
        ]
    },
    {
        id: 'misc-expenses-asset',
        name: 'Misc. Expenses (Asset)',
        type: 'group',
        children: [
            { id: 'ledger-preliminary-expenses', name: 'Preliminary Expenses', type: 'ledger', balance: 30000, previousBalance: 25000 },
            { id: 'ledger-deferred-revenue-expenses', name: 'Deferred Revenue Expenses', type: 'ledger', balance: 20000, previousBalance: 15000 },
        ]
    }
  ]
};

export const liabilitiesData: Ledger = {
  id: 'liabilities',
  name: 'Liabilities & Equity',
  type: 'group',
  children: [
    {
      id: 'capital-account-group',
      name: 'Capital Account',
      type: 'group',
      children: [
          {
              id: 'capital-subgroup',
              name: 'Capital',
              type: 'group',
              children: [
                  { id: 'ledger-partners-capital', name: 'Partner’s Capital', type: 'ledger', balance: 9190000, previousBalance: 8500000 },
                  { id: 'ledger-drawings', name: 'Drawings', type: 'ledger', balance: -200000, previousBalance: -150000 },
              ]
          }
      ]
    },
    {
      id: 'loans-liability',
      name: 'Loans (Liability)',
      type: 'group',
      children: [
        {
          id: 'secured-loans',
          name: 'Secured Loans',
          type: 'group',
          children: [
            { id: 'ledger-bank-term-loan', name: 'e.g., Bank Term Loan', type: 'ledger', balance: 2000000, previousBalance: 2200000 },
          ]
        },
        {
          id: 'unsecured-loans',
          name: 'Unsecured Loans',
          type: 'group',
          children: [
            { id: 'ledger-loan-from-director', name: 'e.g., Loan from Director', type: 'ledger', balance: 500000, previousBalance: 500000 },
          ]
        },
        { id: 'ledger-bank-od-cc', name: 'Bank OD/CC', type: 'ledger', balance: 300000, previousBalance: 350000 },
      ]
    },
    {
      id: 'current-liabilities',
      name: 'Current Liabilities',
      type: 'group',
      children: [
        {
          id: 'sundry-creditors',
          name: 'Sundry Creditors',
          type: 'group',
          children: [
            { id: 'ledger-vendor-a', name: 'e.g., Vendor A', type: 'ledger', balance: 600000, previousBalance: 550000 },
          ]
        },
        { id: 'ledger-outstanding-expenses', name: 'Outstanding Expenses', type: 'ledger', balance: 125000, previousBalance: 110000 },
        { id: 'ledger-advance-received', name: 'Advance Received', type: 'ledger', balance: 50000, previousBalance: 40000 },
      ]
    },
    {
        id: 'duties-taxes',
        name: 'Duties & Taxes',
        type: 'group',
        children: [
            { id: 'ledger-gst-payable', name: 'GST Payable', type: 'ledger', balance: 90000, previousBalance: 85000 },
            { id: 'ledger-tds-payable', name: 'TDS Payable', type: 'ledger', balance: 40000, previousBalance: 35000 },
            { id: 'ledger-other-statutory-dues', name: 'Other Statutory Dues', type: 'ledger', balance: 10000, previousBalance: 8000 },
        ]
    },
    {
        id: 'provisions',
        name: 'Provisions',
        type: 'group',
        children: [
            { id: 'ledger-provision-for-tax', name: 'Provision for Tax', type: 'ledger', balance: 150000, previousBalance: 140000 },
            { id: 'ledger-provision-for-expenses', name: 'Provision for Expenses', type: 'ledger', balance: 20000, previousBalance: 15000 },
        ]
    }
  ]
};
