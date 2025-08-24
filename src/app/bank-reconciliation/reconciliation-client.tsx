
'use client';

import * as React from 'react';
import Papa from 'papaparse';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { formatCurrency, cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Upload, GitCompareArrows, AlertTriangle, Scale } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { BankTransaction, BookTransaction } from './data';

interface ReconciliationClientProps {
  initialBankTransactions: BankTransaction[];
  initialBookTransactions: BookTransaction[];
}

const TransactionTable = ({ title, transactions, selected, onSelect, type, onManualAdd }: {
    title: string;
    transactions: (BankTransaction | BookTransaction)[];
    selected: Set<string>;
    onSelect: (id: string) => void;
    type: 'bank' | 'book';
    onManualAdd?: () => void;
}) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{title}</CardTitle>
            {type === 'bank' && (
                <Button variant="outline" size="sm" onClick={onManualAdd}>
                    <Upload className="mr-2 h-4 w-4" /> Import Statement
                </Button>
            )}
        </CardHeader>
        <CardContent className="h-[400px] overflow-y-auto">
             <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                        <TableHead className="w-10"></TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Withdrawal</TableHead>
                        <TableHead className="text-right">Deposit</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.map(tx => (
                        <TableRow
                            key={tx.id}
                            data-state={selected.has(tx.id) ? 'selected' : undefined}
                        >
                            <TableCell>
                                <Checkbox
                                    checked={selected.has(tx.id)}
                                    onCheckedChange={() => onSelect(tx.id)}
                                />
                            </TableCell>
                            <TableCell>{format(tx.date, 'dd-MMM-yy')}</TableCell>
                            <TableCell>{tx.description}</TableCell>
                            <TableCell className="text-right text-destructive font-mono">
                                {'withdrawal' in tx ? formatCurrency(tx.withdrawal || 0, 'INR') : formatCurrency(tx.debit, 'INR')}
                            </TableCell>
                            <TableCell className="text-right text-green-600 font-mono">
                               {'deposit' in tx ? formatCurrency(tx.deposit || 0, 'INR') : formatCurrency(tx.credit, 'INR')}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
);

export function ReconciliationClient({ initialBankTransactions, initialBookTransactions }: ReconciliationClientProps) {
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [bankTransactions, setBankTransactions] = React.useState<BankTransaction[]>(initialBankTransactions);
  const [bookTransactions, setBookTransactions] = React.useState<BookTransaction[]>(initialBookTransactions);
  const [selectedBank, setSelectedBank] = React.useState<Set<string>>(new Set());
  const [selectedBook, setSelectedBook] = React.useState<Set<string>>(new Set());

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const parsedData = results.data.map((row: any, index: number) => ({
            id: `csv-${index}`,
            date: new Date(row.Date),
            description: row.Description,
            withdrawal: row.Withdrawal ? parseFloat(row.Withdrawal) : null,
            deposit: row.Deposit ? parseFloat(row.Deposit) : null,
            balance: parseFloat(row.Balance),
            status: 'unreconciled',
          })) as BankTransaction[];
          setBankTransactions(parsedData);
          toast({ title: 'Statement Uploaded', description: `${parsedData.length} transactions imported successfully.`});
        },
        error: (error: any) => {
          toast({ variant: 'destructive', title: 'Upload Error', description: error.message });
        },
      });
    }
  };

  const totals = React.useMemo(() => {
    const bankTotal = Array.from(selectedBank).reduce((sum, id) => {
        const tx = bankTransactions.find(t => t.id === id);
        return sum + (tx?.deposit || 0) - (tx?.withdrawal || 0);
    }, 0);

    const bookTotal = Array.from(selectedBook).reduce((sum, id) => {
        const tx = bookTransactions.find(t => t.id === id);
        return sum + (tx?.credit || 0) - (tx?.debit || 0);
    }, 0);

    return { bankTotal, bookTotal, difference: bankTotal - bookTotal };
  }, [selectedBank, selectedBook, bankTransactions, bookTransactions]);

  const handleReconcile = () => {
    // In a real app, this would update the status of the transactions
    setBankTransactions(prev => prev.filter(tx => !selectedBank.has(tx.id)));
    setBookTransactions(prev => prev.filter(tx => !selectedBook.has(tx.id)));
    setSelectedBank(new Set());
    setSelectedBook(new Set());
    toast({ title: 'Reconciled!', description: `${selectedBank.size} bank and ${selectedBook.size} book transactions have been reconciled.`});
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Bank Reconciliation</CardTitle>
          <CardDescription>Match your bank statement with your books to ensure everything is in order.</CardDescription>
        </CardHeader>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TransactionTable
            title="Bank Statement"
            transactions={bankTransactions}
            selected={selectedBank}
            onSelect={(id) => setSelectedBank(prev => {
                const newSet = new Set(prev);
                newSet.has(id) ? newSet.delete(id) : newSet.add(id);
                return newSet;
            })}
            type="bank"
            onManualAdd={() => fileInputRef.current?.click()}
        />
        <TransactionTable
            title="Book Entries (Bank Ledger)"
            transactions={bookTransactions}
            selected={selectedBook}
            onSelect={(id) => setSelectedBook(prev => {
                const newSet = new Set(prev);
                newSet.has(id) ? newSet.delete(id) : newSet.add(id);
                return newSet;
            })}
            type="book"
        />
        <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleFileUpload} />
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Reconciliation Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Bank Transactions Total</p>
                <p className="text-2xl font-bold font-mono">{formatCurrency(totals.bankTotal, 'INR')}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Book Transactions Total</p>
                <p className="text-2xl font-bold font-mono">{formatCurrency(totals.bookTotal, 'INR')}</p>
            </div>
             <div className={cn("p-4 rounded-lg", Math.abs(totals.difference) > 0.01 ? 'bg-destructive/20' : 'bg-green-500/20')}>
                <p className="text-sm text-muted-foreground">Difference</p>
                <p className="text-2xl font-bold font-mono">{formatCurrency(totals.difference, 'INR')}</p>
            </div>
        </CardContent>
        <CardFooter className="flex justify-end">
            <Button
                onClick={handleReconcile}
                disabled={selectedBank.size === 0 || selectedBook.size === 0 || Math.abs(totals.difference) > 0.01}
            >
                <Scale className="mr-2 h-4 w-4" /> Reconcile
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
