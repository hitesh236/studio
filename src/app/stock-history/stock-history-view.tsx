
'use client';

import * as React from 'react';
import type { StockHistoryEntry } from './data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter
} from "@/components/ui/table";
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CardContent } from '@/components/ui/card';
import { SummaryCard } from '../sales-invoices/summary-card';
import { ArrowDownToLine, ArrowUpFromLine, Package } from 'lucide-react';

interface StockHistoryViewProps {
  data: StockHistoryEntry[];
}

export function StockHistoryView({ data }: StockHistoryViewProps) {
  
  const processedData = React.useMemo(() => {
    let closingStock = 0;
    return data.map(entry => {
        if (entry.type === 'IN') {
            closingStock += entry.quantity;
        } else {
            closingStock -= entry.quantity;
        }
        return { ...entry, closingStock };
    });
  }, [data]);

  const summaryStats = React.useMemo(() => {
      const totalIn = data.filter(e => e.type === 'IN').reduce((sum, e) => sum + e.quantity, 0);
      const totalOut = data.filter(e => e.type === 'OUT').reduce((sum, e) => sum + e.quantity, 0);
      const closingStock = totalIn - totalOut;
      return { totalIn, totalOut, closingStock };
  }, [data]);

  return (
    <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SummaryCard icon={ArrowDownToLine} title="Total Stock In" value={summaryStats.totalIn.toString()} variant="primary" />
            <SummaryCard icon={ArrowUpFromLine} title="Total Stock Out" value={summaryStats.totalOut.toString()} />
            <SummaryCard icon={Package} title="Closing Stock" value={summaryStats.closingStock.toString()} />
        </div>
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Closing Stock</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {processedData.map((entry) => (
                        <TableRow key={entry.id}>
                            <TableCell>{format(entry.date, 'dd-MMM-yyyy')}</TableCell>
                            <TableCell>
                                <span className={cn(
                                    "font-semibold",
                                    entry.type === 'IN' ? 'text-green-600' : 'text-destructive'
                                )}>
                                    {entry.type}
                                </span>
                            </TableCell>
                            <TableCell>{entry.reference}</TableCell>
                            <TableCell className="text-muted-foreground">{entry.notes}</TableCell>
                            <TableCell className="text-right font-mono">
                                {entry.type === 'IN' ? '+' : '-'} {entry.quantity}
                            </TableCell>
                            <TableCell className="text-right font-mono font-semibold">{entry.closingStock}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                 <TableFooter>
                    <TableRow>
                        <TableCell colSpan={5} className="text-right font-bold">Final Closing Stock</TableCell>
                        <TableCell className="text-right font-bold font-mono text-lg">{summaryStats.closingStock}</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </div>
    </CardContent>
  );
}

    