
'use client';

import * as React from 'react';
import type { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import {
  UserCircle,
  Mail,
  Phone,
  MapPin,
  Download,
  Calendar as CalendarIcon,
  ArrowRightLeft,
  Wallet,
} from 'lucide-react';

import { generateData, Person } from "@/lib/data";
import { generateJournalEntries } from "@/app/journal-entries/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { SummaryCard } from '@/app/sales-invoices/summary-card';

// Generate data once
const customer: Person = generateData(1)[0];
const allJournalEntries = generateJournalEntries(100);
let runningBalance = 0;
const customerLedgerData = allJournalEntries
    .filter(entry => 
        entry.lines.some(line => line.account === 'Accounts Receivable') &&
        (entry.description.toLowerCase().includes('sales') || entry.description.toLowerCase().includes('payment') || entry.description.toLowerCase().includes('received cash'))
    )
    .sort((a,b) => a.date.getTime() - b.date.getTime())
    .slice(0, 25)
    .map(entry => {
        const arLine = entry.lines.find(l => l.account === 'Accounts Receivable');
        runningBalance += (arLine?.debit ?? 0) - (arLine?.credit ?? 0);
        return {
            date: entry.date,
            particulars: entry.description,
            debit: arLine?.debit ?? 0,
            credit: arLine?.credit ?? 0,
            balance: runningBalance,
        };
    });

export default function CustomerPortfolioPage() {
  const [filter, setFilter] = React.useState('');
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();

  // Calculate totals for summary cards based on the full dataset
  const totalDebit = customerLedgerData.reduce((acc, entry) => acc + entry.debit, 0);
  const totalCredit = customerLedgerData.reduce((acc, entry) => acc + entry.credit, 0);
  const finalBalance = totalDebit - totalCredit;

  // Filtered ledger based on state
  const filteredLedger = React.useMemo(() => {
    let results = customerLedgerData;

    if (filter) {
      const lowercasedFilter = filter.toLowerCase();
      results = results.filter(entry =>
        entry.particulars.toLowerCase().includes(lowercasedFilter)
      );
    }
    
    if (dateRange?.from) {
      results = results.filter(entry => entry.date >= dateRange.from!);
    }
    if (dateRange?.to) {
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      results = results.filter(entry => entry.date <= toDate);
    }

    return results;
  }, [filter, dateRange]);


  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <UserCircle className="h-12 w-12 text-muted-foreground" />
            <div>
              <CardTitle className="text-2xl">{`${customer.firstName} ${customer.lastName}`}</CardTitle>
              <CardDescription>{customer.company}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4 text-sm">
            <div className="flex items-start gap-3">
              <Mail className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <p className="text-muted-foreground">{customer.email}</p>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <p className="text-muted-foreground">{customer.phone}</p>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <p className="text-muted-foreground">
                  {customer.address.city}, {customer.address.state}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          icon={ArrowRightLeft}
          title="Total Debits"
          value={formatCurrency(totalDebit, 'INR')}
          variant="primary"
        />
        <SummaryCard
          icon={ArrowRightLeft}
          title="Total Credits"
          value={formatCurrency(totalCredit, 'INR')}
        />
        <SummaryCard
          icon={Wallet}
          title="Closing Balance"
          value={`${formatCurrency(Math.abs(finalBalance), 'INR')} ${finalBalance >= 0 ? 'Dr' : 'Cr'}`}
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Customer Ledger</CardTitle>
              <CardDescription>Detailed transaction history for this customer.</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 w-full sm:w-auto">
              <Input
                placeholder="Filter particulars..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full sm:w-48"
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button id="date" variant={"outline"} className="w-full sm:w-[260px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Particulars</TableHead>
                  <TableHead className="text-right">Debit (Dr)</TableHead>
                  <TableHead className="text-right">Credit (Cr)</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLedger.length > 0 ? (
                  filteredLedger.map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell>{format(entry.date, 'dd-MMM-yyyy')}</TableCell>
                      <TableCell>{entry.particulars}</TableCell>
                      <TableCell className="text-right font-mono text-primary">
                        {entry.debit > 0 ? formatCurrency(entry.debit, 'INR') : '-'}
                      </TableCell>
                      <TableCell className="text-right font-mono text-destructive">
                        {entry.credit > 0 ? formatCurrency(entry.credit, 'INR') : '-'}
                      </TableCell>
                      <TableCell className={cn("text-right font-mono", entry.balance < 0 ? 'text-destructive' : '')}>
                        {formatCurrency(Math.abs(entry.balance), 'INR')} {entry.balance >= 0 ? 'Dr' : 'Cr'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                      No ledger entries found for the selected filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
