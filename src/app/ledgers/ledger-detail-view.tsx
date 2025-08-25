
'use client';

import * as React from 'react';
import { format, parse, isValid } from 'date-fns';
import { Calendar as CalendarIcon, Download, TrendingUp, CircleDollarSign, Scale, Banknote } from 'lucide-react';
import type { DateRange } from 'react-day-picker';

import { cn, formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { SummaryCard } from '@/app/sales-invoices/summary-card';
import { Label } from '@/components/ui/label';

export type LedgerTransaction = {
    id: string;
    accountId: string;
    date: Date;
    description: string;
    ref: string;
    debit: number;
    credit: number;
};

// Mobile Card Component
const MobileLedgerCard = ({ entry }: { entry: { id: string; date: Date; description: string; ref: string; debit: number; credit: number; balance: number } }) => {
    const balanceType = entry.balance >= 0 ? 'Dr' : 'Cr';
    return (
        <Card>
            <CardHeader className="p-4">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{entry.description}</CardTitle>
                    <span className="text-sm font-mono text-muted-foreground">{format(entry.date, 'dd-MMM-yy')}</span>
                </div>
                <CardDescription>Ref: {entry.ref}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <Separator className="mb-4" />
                <div className="flex justify-between items-center text-sm">
                    <div className="space-y-1">
                        <p className="text-muted-foreground">Debit</p>
                        <p className="font-mono text-primary">{entry.debit > 0 ? formatCurrency(entry.debit, 'INR') : '-'}</p>
                    </div>
                    <div className="space-y-1 text-right">
                        <p className="text-muted-foreground">Credit</p>
                        <p className="font-mono text-destructive">{entry.credit > 0 ? formatCurrency(entry.credit, 'INR') : '-'}</p>
                    </div>
                    <div className="space-y-1 text-right">
                        <p className="text-muted-foreground">Balance</p>
                        <p className="font-mono">{formatCurrency(Math.abs(entry.balance), 'INR')} {balanceType}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export function LedgerDetailView({ ledgerTransactions, openingBalance }: { ledgerTransactions: LedgerTransaction[], openingBalance: number }) {
    const [filter, setFilter] = React.useState('');
    const [date, setDate] = React.useState<DateRange | undefined>({ from: new Date(new Date().getFullYear(), 0, 1), to: new Date() });

    const filteredLedgerData = React.useMemo(() => {
        return ledgerTransactions.filter(entry => {
            const matchesFilter = filter ? entry.description.toLowerCase().includes(filter.toLowerCase()) : true;
            const matchesDate =
                (!date?.from || entry.date >= date.from) &&
                (!date?.to || new Date(entry.date.setHours(23, 59, 59, 999)) >= date.to);
            return matchesFilter && matchesDate;
        }).sort((a, b) => a.date.getTime() - b.date.getTime());
    }, [filter, date, ledgerTransactions]);

    const processedLedgerData = React.useMemo(() => {
        let runningBalance = openingBalance;
        const chronologicallyProcessed = filteredLedgerData.map(entry => {
            runningBalance += entry.debit - entry.credit;
            return { ...entry, balance: runningBalance };
        });
        return chronologicallyProcessed.reverse();
    }, [filteredLedgerData, openingBalance]);

    const ledgerSummary = React.useMemo(() => {
        let totalDebit = 0;
        let totalCredit = 0;
        processedLedgerData.forEach(entry => {
            totalDebit += entry.debit;
            totalCredit += entry.credit;
        });
        const closingBalance = openingBalance + totalDebit - totalCredit;
        return { totalDebit, totalCredit, closingBalance };
    }, [processedLedgerData, openingBalance]);
    
    const handleDateInputChange = (field: 'from' | 'to', value: string) => {
        const parsedDate = parse(value, 'yyyy-MM-dd', new Date());
        if (isValid(parsedDate)) {
            setDate(prev => ({ ...prev, [field]: parsedDate }));
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryCard icon={Banknote} title="Opening Balance" value={formatCurrency(openingBalance, 'INR')} variant="primary" />
                <SummaryCard icon={TrendingUp} title="Total Debits" value={formatCurrency(ledgerSummary.totalDebit, 'INR')} />
                <SummaryCard icon={CircleDollarSign} title="Total Credits" value={formatCurrency(ledgerSummary.totalCredit, 'INR')} />
                <SummaryCard icon={Scale} title="Closing Balance" value={formatCurrency(ledgerSummary.closingBalance, 'INR')} />
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Filter by particulars..."
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="w-full sm:w-[300px]"
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                            <Popover>
                                <PopoverTrigger asChild>
                                <Button id="date" variant={"outline"} className={cn("w-full sm:w-auto justify-start text-left font-normal", !date && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date?.from ? (date.to ? <>{format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}</> : format(date.from, "LLL dd, y")) : <span>Pick a date</span>}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="end">
                                     <div className="flex items-center gap-2 p-4 border-b">
                                        <div className="space-y-1">
                                            <Label htmlFor="date-from" className="text-xs">From</Label>
                                            <Input
                                                id="date-from"
                                                type="text"
                                                placeholder="YYYY-MM-DD"
                                                defaultValue={date?.from ? format(date.from, 'yyyy-MM-dd') : ''}
                                                onBlur={(e) => handleDateInputChange('from', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="date-to" className="text-xs">To</Label>
                                            <Input
                                                id="date-to"
                                                type="text"
                                                placeholder="YYYY-MM-DD"
                                                defaultValue={date?.to ? format(date.to, 'yyyy-MM-dd') : ''}
                                                onBlur={(e) => handleDateInputChange('to', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <Calendar initialFocus mode="range" defaultMonth={date?.from} selected={date} onSelect={setDate} numberOfMonths={2} />
                                </PopoverContent>
                            </Popover>
                            <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export</Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Desktop Table View */}
                    <div className="hidden md:block rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="whitespace-nowrap">Date</TableHead>
                                    <TableHead className="whitespace-nowrap">Particulars</TableHead>
                                    <TableHead className="whitespace-nowrap">Voucher No.</TableHead>
                                    <TableHead className="text-right whitespace-nowrap">Debit</TableHead>
                                    <TableHead className="text-right whitespace-nowrap">Credit</TableHead>
                                    <TableHead className="text-right whitespace-nowrap">Balance</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {processedLedgerData.length > 0 ? processedLedgerData.map(entry => {
                                    const balanceType = entry.balance >= 0 ? 'Dr' : 'Cr';
                                    return (
                                        <TableRow key={entry.id}>
                                            <TableCell className="whitespace-nowrap">{format(entry.date, 'dd-MMM-yy')}</TableCell>
                                            <TableCell>{entry.description}</TableCell>
                                            <TableCell className="whitespace-nowrap">{entry.ref}</TableCell>
                                            <TableCell className="text-right font-mono text-primary">{entry.debit > 0 ? formatCurrency(entry.debit, 'INR') : '-'}</TableCell>
                                            <TableCell className="text-right font-mono text-destructive">{entry.credit > 0 ? formatCurrency(entry.credit, 'INR') : '-'}</TableCell>
                                            <TableCell className="text-right font-mono">{formatCurrency(Math.abs(entry.balance), 'INR')} {balanceType}</TableCell>
                                        </TableRow>
                                    );
                                }) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24">No transactions found for the selected criteria.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                             <TableFooter>
                                <TableRow>
                                    <TableCell colSpan={3} className="text-right font-bold">Closing Balance</TableCell>
                                    <TableCell className="text-right font-mono font-bold">{formatCurrency(ledgerSummary.totalDebit, 'INR')}</TableCell>
                                    <TableCell className="text-right font-mono font-bold">{formatCurrency(ledgerSummary.totalCredit, 'INR')}</TableCell>
                                    <TableCell className="text-right font-mono font-bold">{formatCurrency(Math.abs(ledgerSummary.closingBalance), 'INR')} {ledgerSummary.closingBalance >= 0 ? 'Dr' : 'Cr'}</TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </div>
                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                        {processedLedgerData.length > 0 ? processedLedgerData.map(entry => (
                            <MobileLedgerCard key={entry.id} entry={entry} />
                        )) : (
                             <div className="text-center text-muted-foreground py-12">No transactions found.</div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
