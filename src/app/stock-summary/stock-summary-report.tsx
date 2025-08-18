
'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Download, Printer } from 'lucide-react';
import type { DateRange } from 'react-day-picker';

import { cn, formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import type { StockSummaryRow } from './data';

interface StockSummaryReportProps {
  data: StockSummaryRow[];
}

const companyDetails = {
    name: 'Hicks Inc.',
    address: '123 Business Rd, Financial District, Mumbai, Maharashtra, 400001',
};

export function StockSummaryReport({ data }: StockSummaryReportProps) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(2025, 7, 11), // August 11, 2025
    to: new Date(2025, 7, 18),   // August 18, 2025
  });

  const totals = React.useMemo(() => {
    return data.reduce(
      (acc, row) => {
        acc.openingQty += row.openingStock.quantity;
        acc.openingAmt += row.openingStock.amount;
        acc.importQty += row.importInPeriod.quantity;
        acc.importAmt += row.importInPeriod.amount;
        acc.exportQty += row.exportInPeriod.quantity;
        acc.exportAmt += row.exportInPeriod.amount;
        acc.closingQty += row.closingStock.quantity;
        acc.closingAmt += row.closingStock.amount;
        return acc;
      },
      {
        openingQty: 0,
        openingAmt: 0,
        importQty: 0,
        importAmt: 0,
        exportQty: 0,
        exportAmt: 0,
        closingQty: 0,
        closingAmt: 0,
      }
    );
  }, [data]);

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="text-center">
          <CardTitle className="text-2xl">STOCK SUMMARY REPORT</CardTitle>
          <CardDescription>
            From date : {date?.from ? format(date.from, 'MMMM, dd yyyy') : ''}
            <br />
            To date : {date?.to ? format(date.to, 'MMMM, dd yyyy') : ''}
          </CardDescription>
        </div>
        <div className="flex justify-between items-center text-sm">
            <div>
                <p><strong className="w-24 inline-block">Company name</strong> {companyDetails.name}</p>
                <p><strong className="w-24 inline-block">Address</strong> {companyDetails.address}</p>
            </div>
            <div className="flex gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                    <Button id="date" variant="outline" className={cn('w-[260px] justify-start text-left font-normal', !date && 'text-muted-foreground')}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (date.to ? <>{format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}</> : format(date.from, 'LLL dd, y')) : <span>Pick a date</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                    <Calendar initialFocus mode="range" defaultMonth={date?.from} selected={date} onSelect={setDate} numberOfMonths={2} />
                    </PopoverContent>
                </Popover>
                <Button variant="outline" size="icon"><Printer className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon"><Download className="h-4 w-4" /></Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead rowSpan={2} className="text-center align-middle">Order</TableHead>
                <TableHead rowSpan={2} className="text-center align-middle">Commodity Code</TableHead>
                <TableHead rowSpan={2} className="text-center align-middle">Commodity Name</TableHead>
                <TableHead rowSpan={2} className="text-center align-middle">Unit Name</TableHead>
                <TableHead colSpan={2} className="text-center">Opening Stock</TableHead>
                <TableHead colSpan={2} className="text-center">Import In Period</TableHead>
                <TableHead colSpan={2} className="text-center">Export In Period</TableHead>
                <TableHead colSpan={2} className="text-center">Closing Stock</TableHead>
              </TableRow>
              <TableRow>
                <TableHead className="text-right">quantity</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">quantity</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">quantity</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">quantity</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.order}>
                  <TableCell className="text-center">{row.order}</TableCell>
                  <TableCell>{row.commodityCode}</TableCell>
                  <TableCell>{row.commodityName}</TableCell>
                  <TableCell>{row.unitName}</TableCell>
                  <TableCell className="text-right font-mono">{row.openingStock.quantity}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(row.openingStock.amount, 'INR')}</TableCell>
                  <TableCell className="text-right font-mono">{row.importInPeriod.quantity}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(row.importInPeriod.amount, 'INR')}</TableCell>
                  <TableCell className="text-right font-mono">{row.exportInPeriod.quantity}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(row.exportInPeriod.amount, 'INR')}</TableCell>
                  <TableCell className="text-right font-mono">{row.closingStock.quantity}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(row.closingStock.amount, 'INR')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
                <TableRow>
                    <TableCell colSpan={4} className="text-right font-bold">Total :</TableCell>
                    <TableCell className="text-right font-bold font-mono">{totals.openingQty}</TableCell>
                    <TableCell className="text-right font-bold font-mono">{formatCurrency(totals.openingAmt, 'INR')}</TableCell>
                    <TableCell className="text-right font-bold font-mono">{totals.importQty}</TableCell>
                    <TableCell className="text-right font-bold font-mono">{formatCurrency(totals.importAmt, 'INR')}</TableCell>
                    <TableCell className="text-right font-bold font-mono">{totals.exportQty}</TableCell>
                    <TableCell className="text-right font-bold font-mono">{formatCurrency(totals.exportAmt, 'INR')}</TableCell>
                    <TableCell className="text-right font-bold font-mono">{totals.closingQty}</TableCell>
                    <TableCell className="text-right font-bold font-mono">{formatCurrency(totals.closingAmt, 'INR')}</TableCell>
                </TableRow>
            </TableFooter>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
