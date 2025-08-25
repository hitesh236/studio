
'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, cn } from '@/lib/utils';
import type { TrialBalanceRow } from './data';
import { generateTrialBalanceData } from './data';
import { Button } from '@/components/ui/button';
import { Printer, Download, Calendar as CalendarIcon, ChevronDown, ChevronRight } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

const formatBalance = (amount: number) => {
    if (amount === 0) return '-';
    const formatted = formatCurrency(Math.abs(amount), 'INR');
    return `${formatted} ${amount > 0 ? 'Dr' : 'Cr'}`;
};

export function TrialBalanceView({ initialData }: { initialData: TrialBalanceRow[] }) {
    const [data, setData] = React.useState(initialData);
    const [date, setDate] = React.useState<DateRange | undefined>({
      from: new Date(new Date().getFullYear(), 0, 1),
      to: new Date(),
    });
    
    // In a real app, this would be a server fetch. Here we regenerate the data.
    React.useEffect(() => {
        if(date?.from && date?.to) {
            setData(generateTrialBalanceData({from: date.from, to: date.to}));
        }
    }, [date]);
    
    const totals = React.useMemo(() => {
        return data.reduce(
            (acc, row) => {
                if (!row.isGroup) {
                    acc.debit += row.debit;
                    acc.credit += row.credit;
                }
                return acc;
            },
            { debit: 0, credit: 0 }
        );
    }, [data]);

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-2xl">Trial Balance</CardTitle>
                        <CardDescription>
                             For the period {date?.from ? format(date.from, 'LLL dd, y') : ''} to {date?.to ? format(date.to, 'LLL dd, y') : ''}
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                            <Button id="date" variant="outline" className={cn("w-full sm:w-[260px] justify-start text-left font-normal", !date && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date?.from ? (date.to ? <>{format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}</> : format(date.from, "LLL dd, y")) : <span>Pick a date</span>}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <Calendar initialFocus mode="range" defaultMonth={date?.from} selected={date} onSelect={setDate} numberOfMonths={2} />
                            </PopoverContent>
                        </Popover>
                        <Button variant="outline"><Printer className="mr-2 h-4 w-4" /> Print</Button>
                        <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export</Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[40%]" rowSpan={2}>Particulars</TableHead>
                                <TableHead className="text-right" rowSpan={2}>Opening Balance</TableHead>
                                <TableHead className="text-center border-b" colSpan={2}>Transactions</TableHead>
                                <TableHead className="text-right" rowSpan={2}>Closing Balance</TableHead>
                            </TableRow>
                            <TableRow>
                                <TableHead className="text-right">Debit</TableHead>
                                <TableHead className="text-right">Credit</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((row) => (
                                <TableRow key={row.id} className={cn(row.isGroup && 'bg-muted/50 font-bold')}>
                                    <TableCell style={{ paddingLeft: `${row.level * 1.5 + 1}rem` }}>
                                       {row.account}
                                    </TableCell>
                                    <TableCell className="text-right font-mono">{formatBalance(row.openingBalance)}</TableCell>
                                    <TableCell className="text-right font-mono">{row.debit > 0 ? formatCurrency(row.debit, 'INR') : '-'}</TableCell>
                                    <TableCell className="text-right font-mono">{row.credit > 0 ? formatCurrency(row.credit, 'INR') : '-'}</TableCell>
                                    <TableCell className="text-right font-mono">{formatBalance(row.closingBalance)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow className="font-bold text-base">
                                <TableCell colSpan={2} className="text-right">Grand Total</TableCell>
                                <TableCell className="text-right font-mono">{formatCurrency(totals.debit, 'INR')}</TableCell>
                                <TableCell className="text-right font-mono">{formatCurrency(totals.credit, 'INR')}</TableCell>
                                <TableCell />
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
                {Math.abs(totals.debit - totals.credit) > 0.01 && (
                     <Alert variant="destructive" className="mt-4">
                        <AlertTitle>Totals Do Not Match!</AlertTitle>
                        <AlertDescription>
                            The sum of debits does not equal the sum of credits. The difference is {formatCurrency(Math.abs(totals.debit - totals.credit), 'INR')}.
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
}
