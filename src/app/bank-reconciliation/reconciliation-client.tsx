
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
import { Upload, GitCompareArrows, AlertTriangle, Scale, Settings, ArrowUp, ArrowDown, Calendar as CalendarIcon, X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { BankTransaction, BookTransaction } from './data';
import type { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';

type SortConfig = {
    key: keyof BankTransaction | keyof BookTransaction | null;
    direction: 'ascending' | 'descending';
};

interface ReconciliationClientProps {
  initialBankTransactions: BankTransaction[];
  initialBookTransactions: BookTransaction[];
}

const TransactionTable = ({
    title,
    transactions,
    selected,
    onSelect,
    type,
    onManualAdd,
    sortConfig,
    requestSort,
}: {
    title: string;
    transactions: (BankTransaction | BookTransaction)[];
    selected: Set<string>;
    onSelect: (id: string) => void;
    type: 'bank' | 'book';
    onManualAdd?: () => void;
    sortConfig: SortConfig;
    requestSort: (key: keyof BankTransaction | keyof BookTransaction) => void;
}) => {
    
    const getSortableHeader = (label: string, key: keyof BankTransaction | keyof BookTransaction) => {
        const isSorted = sortConfig.key === key;
        return (
             <Button variant="ghost" onClick={() => requestSort(key)} className="w-full justify-start p-0 hover:bg-transparent">
                {label}
                {isSorted ? (
                  sortConfig.direction === 'ascending' ? (
                    <ArrowUp className="ml-2 h-4 w-4" />
                  ) : (
                    <ArrowDown className="ml-2 h-4 w-4" />
                  )
                ) : null}
            </Button>
        )
    };
    
    return (
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
                        <TableHead>{getSortableHeader('Date', 'date')}</TableHead>
                        <TableHead>{getSortableHeader('Description', 'description')}</TableHead>
                        <TableHead className="text-right">{getSortableHeader(type === 'bank' ? 'Withdrawal' : 'Debit', type === 'bank' ? 'withdrawal' : 'debit')}</TableHead>
                        <TableHead className="text-right">{getSortableHeader(type === 'bank' ? 'Deposit' : 'Credit', type === 'bank' ? 'deposit' : 'credit')}</TableHead>
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
)};

export function ReconciliationClient({ initialBankTransactions, initialBookTransactions }: ReconciliationClientProps) {
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [bankTransactions, setBankTransactions] = React.useState<BankTransaction[]>(initialBankTransactions);
  const [bookTransactions, setBookTransactions] = React.useState<BookTransaction[]>(initialBookTransactions);
  const [selectedBank, setSelectedBank] = React.useState<Set<string>>(new Set());
  const [selectedBook, setSelectedBook] = React.useState<Set<string>>(new Set());
  
  const [date, setDate] = React.useState<DateRange | undefined>();
  const [isFullWidth, setIsFullWidth] = React.useState(false);
  const [bankSortConfig, setBankSortConfig] = React.useState<SortConfig>({ key: 'date', direction: 'descending' });
  const [bookSortConfig, setBookSortConfig] = React.useState<SortConfig>({ key: 'date', direction: 'descending' });


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
  
  const requestSort = (key: keyof BankTransaction | keyof BookTransaction, table: 'bank' | 'book') => {
    const sortConfig = table === 'bank' ? bankSortConfig : bookSortConfig;
    const setSortConfig = table === 'bank' ? setBankSortConfig : setBookSortConfig;
    
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
        direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const sortedAndFilteredTransactions = React.useMemo(() => {
    const filterAndSort = (
      transactions: (BankTransaction | BookTransaction)[],
      sortConfig: SortConfig
    ) => {
      let filtered = transactions.filter(tx => {
        if (!date?.from) return true;
        const toDate = date.to ? new Date(date.to.setHours(23, 59, 59, 999)) : new Date(date.from.setHours(23, 59, 59, 999));
        return tx.date >= date.from && tx.date <= toDate;
      });

      if (sortConfig.key) {
        filtered.sort((a, b) => {
            const aVal = a[sortConfig.key as keyof typeof a];
            const bVal = b[sortConfig.key as keyof typeof b];

            if (aVal === null || aVal === undefined) return 1;
            if (bVal === null || bVal === undefined) return -1;
            
            let comparison = 0;
            if (aVal instanceof Date && bVal instanceof Date) {
                comparison = aVal.getTime() - bVal.getTime();
            } else if (typeof aVal === 'string' && typeof bVal === 'string') {
                comparison = aVal.localeCompare(bVal);
            } else if (typeof aVal === 'number' && typeof bVal === 'number') {
                comparison = aVal - bVal;
            }

            return sortConfig.direction === 'ascending' ? comparison : -comparison;
        });
      }
      return filtered;
    };
    
    return {
      bank: filterAndSort(bankTransactions, bankSortConfig) as BankTransaction[],
      book: filterAndSort(bookTransactions, bookSortConfig) as BookTransaction[],
    };
  }, [bankTransactions, bookTransactions, bankSortConfig, bookSortConfig, date]);


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

  const reconciliationContent = (
     <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <TransactionTable
                title="Bank Statement"
                transactions={sortedAndFilteredTransactions.bank}
                selected={selectedBank}
                onSelect={(id) => setSelectedBank(prev => {
                    const newSet = new Set(prev);
                    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
                    return newSet;
                })}
                type="bank"
                onManualAdd={() => fileInputRef.current?.click()}
                sortConfig={bankSortConfig}
                requestSort={(key) => requestSort(key, 'bank')}
            />
            <TransactionTable
                title="Book Entries (Bank Ledger)"
                transactions={sortedAndFilteredTransactions.book}
                selected={selectedBook}
                onSelect={(id) => setSelectedBook(prev => {
                    const newSet = new Set(prev);
                    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
                    return newSet;
                })}
                type="book"
                sortConfig={bookSortConfig}
                requestSort={(key) => requestSort(key, 'book')}
            />
            <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleFileUpload} />
        </div>
        <Card>
            <CardHeader><CardTitle>Reconciliation Summary</CardTitle></CardHeader>
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
                <Button onClick={handleReconcile} disabled={selectedBank.size === 0 || selectedBook.size === 0 || Math.abs(totals.difference) > 0.01}>
                    <Scale className="mr-2 h-4 w-4" /> Reconcile
                </Button>
            </CardFooter>
        </Card>
     </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
               <div>
                  <CardTitle className="text-2xl">Bank Reconciliation</CardTitle>
                  <CardDescription>Match your bank statement with your books to ensure everything is in order.</CardDescription>
               </div>
               <div className="flex items-center gap-2">
                  <Popover>
                      <PopoverTrigger asChild>
                          <Button id="date" variant="outline" className={cn("w-full sm:w-[260px] justify-start text-left font-normal", !date && "text-muted-foreground")}>
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {date?.from ? (date.to ? <>{format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}</> : format(date.from, "LLL dd, y")) : <span>Filter by date</span>}
                          </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                          <Calendar initialFocus mode="range" defaultMonth={date?.from} selected={date} onSelect={setDate} numberOfMonths={2} />
                      </PopoverContent>
                  </Popover>
                  <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon">
                              <Settings className="h-4 w-4" />
                              <span className="sr-only">View Options</span>
                          </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => setIsFullWidth(true)}>
                              Full Screen View
                          </DropdownMenuItem>
                      </DropdownMenuContent>
                  </DropdownMenu>
              </div>
            </div>
          </CardHeader>
        </Card>
      
      {reconciliationContent}

      <Dialog open={isFullWidth} onOpenChange={setIsFullWidth}>
        <DialogContent className="max-w-full w-full h-full p-4 sm:p-6 flex flex-col">
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="absolute top-4 right-4 z-10">
              <X className="h-6 w-6" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>
          <div className="flex-1 overflow-y-auto pt-8">
            {reconciliationContent}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

    