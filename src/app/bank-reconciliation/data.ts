
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

export const generateBankTransactions = (count: number): BankTransaction[] => {
  const transactions: BankTransaction[] = [];
  let balance = 500000;
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
