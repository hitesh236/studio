
export type BankTransaction = {
  id: string;
  date: Date;
  description: string;
  withdrawal: number | null;
  deposit: number | null;
  balance: number;
  status: 'unreconciled' | 'reconciled' | 'manual';
};

export type BookTransaction = {
  id: string;
  date: Date;
  description: string;
  debit: number;
  credit: number;
  type: 'payment' | 'receipt' | 'journal';
  status: 'unreconciled' | 'reconciled';
};

const matchingEntries = [
    { amount: 1500, date: new Date(2024, 6, 20), description: "Vendor Payment #M1" },
    { amount: 2200, date: new Date(2024, 6, 15), description: "Online Transfer from Client #M2" },
    { amount: 850, date: new Date(2024, 6, 10), description: "Vendor Payment #M3" },
];


export const generateBankTransactions = (count: number): BankTransaction[] => {
  const transactions: BankTransaction[] = [];
  let balance = 500000;

  // Add matching entries
  matchingEntries.forEach((entry, index) => {
    const isDeposit = entry.description.includes('Client');
    if (isDeposit) {
        balance += entry.amount;
    } else {
        balance -= entry.amount;
    }
     transactions.push({
      id: `bank-match-${index}`,
      date: entry.date,
      description: entry.description,
      withdrawal: isDeposit ? null : entry.amount,
      deposit: isDeposit ? entry.amount : null,
      balance,
      status: 'unreconciled',
    });
  });
  
  // Add other random entries
  for (let i = 0; i < count; i++) {
    const isDeposit = Math.random() > 0.5;
    const amount = Math.floor(Math.random() * 5000) + 100;
    if (isDeposit) {
        balance += amount;
    } else {
        balance -= amount;
    }
    transactions.push({
      id: `bank-${i}`,
      date: new Date(2024, 6, 25 - i),
      description: isDeposit ? `Online Transfer from Client #${i}` : `Vendor Payment #${i}`,
      withdrawal: isDeposit ? null : amount,
      deposit: isDeposit ? amount : null,
      balance,
      status: 'unreconciled',
    });
  }
  return transactions;
};

export const generateBookTransactions = (count: number): BookTransaction[] => {
  const transactions: BookTransaction[] = [];
  
  // Add matching entries
  matchingEntries.forEach((entry, index) => {
    const isCredit = entry.description.includes('Client');
    transactions.push({
      id: `book-match-${index}`,
      date: new Date(entry.date.getTime() + (Math.random() * 24 * 60 * 60 * 1000)), // slightly different date
      description: entry.description.replace('#M', '#B'),
      debit: isCredit ? 0 : entry.amount,
      credit: isCredit ? entry.amount : 0,
      type: isCredit ? 'receipt' : 'payment',
      status: 'unreconciled',
    });
  });

  // Add other random entries
  for (let i = 0; i < count; i++) {
    const isCredit = Math.random() > 0.5;
    const amount = Math.floor(Math.random() * 5000) + 100;
    transactions.push({
      id: `book-${i}`,
      date: new Date(2024, 6, 24 - i),
      description: isCredit ? `Payment received from Customer #${i}` : `Payment to Vendor #${i}`,
      debit: isCredit ? 0 : amount,
      credit: isCredit ? amount : 0,
      type: isCredit ? 'receipt' : 'payment',
      status: 'unreconciled',
    });
  }
  return transactions;
};
