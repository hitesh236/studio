
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
import { cn, formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowDown, ArrowUp } from 'lucide-react';
import Link from 'next/link';

interface StockHistoryViewProps {
  data: StockHistoryEntry[];
  viewMode: 'all' | 'in' | 'out';
}

const StockTable = ({ title, data, type }: { title: string, data: StockHistoryEntry[], type: 'in' | 'out' }) => {
    const totalQuantity = data.reduce((sum, entry) => sum + entry.quantity, 0);
    const quantityHeader = type === 'in' ? 'Stock In' : 'Stock Out';

    return (
        <Card>
            <CardHeader className="p-4">
                <CardTitle className="text-xl">{title}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[40px]">#</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">{quantityHeader}</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Invoice/Ref No.</TableHead>
                                <TableHead>{type === 'in' ? 'Supplier/Client' : 'Client/Supplier'}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((entry, index) => (
                                <TableRow key={entry.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{format(entry.date, 'dd MMM, yyyy')}</TableCell>
                                    <TableCell className="text-right font-mono">{entry.quantity}</TableCell>
                                    <TableCell className="text-right font-mono">{formatCurrency(entry.price, 'INR')}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{entry.type}</Badge>
                                    </TableCell>
                                    <TableCell>
                                      <Link href="#" className="text-primary hover:underline">{entry.referenceId}</Link>
                                    </TableCell>
                                    <TableCell>{entry.supplierOrClient}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={6} className="text-right font-bold">Total Quantity</TableCell>
                                <TableCell className="text-right font-bold text-lg font-mono">{totalQuantity}</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}

const CombinedStockTable = ({ data }: { data: StockHistoryEntry[] }) => {
    let runningStock = 0;
    const avgPurchasePrice = data.find(e => e.type === 'Purchase')?.price || 750;

    const processedData = data.map(entry => {
        runningStock += entry.quantity;
        let profit = 0;
        if (entry.type === 'Invoice') {
            profit = (entry.price - avgPurchasePrice) * Math.abs(entry.quantity);
        }
        return { ...entry, runningStock, profit };
    });

    const totalIn = data.filter(e => e.quantity > 0).reduce((sum, e) => sum + e.quantity, 0);
    const totalOut = data.filter(e => e.quantity < 0).reduce((sum, e) => sum + e.quantity, 0);
    const totalProfit = processedData.reduce((sum, e) => sum + e.profit, 0);
    
    return (
        <Card>
            <CardHeader className="p-4">
                <CardTitle className="text-xl">Combined Stock Ledger</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Invoice/Ref No.</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="text-right">In</TableHead>
                                <TableHead className="text-right">Out</TableHead>
                                <TableHead className="text-right">Balance</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {processedData.map(entry => {
                                const isStockIn = entry.quantity > 0;
                                return (
                                    <TableRow key={entry.id}>
                                        <TableCell>{format(entry.date, 'dd MMM, yyyy')}</TableCell>
                                        <TableCell>
                                            <Badge variant={isStockIn ? 'secondary' : 'destructive'} className="whitespace-nowrap">
                                                {isStockIn ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                                                {entry.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                          <Link href="#" className="text-primary hover:underline">{entry.referenceId}</Link>
                                        </TableCell>
                                        <TableCell className="text-right font-mono">{formatCurrency(entry.price, 'INR')}</TableCell>
                                        <TableCell className="text-right font-mono text-green-600">{isStockIn ? entry.quantity : '-'}</TableCell>
                                        <TableCell className="text-right font-mono text-red-600">{!isStockIn ? Math.abs(entry.quantity) : '-'}</TableCell>
                                        <TableCell className="text-right font-bold font-mono">{entry.runningStock}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                         <TableFooter>
                            <TableRow>
                                <TableCell colSpan={4} className="text-right font-bold">Total</TableCell>
                                <TableCell className="text-right font-bold text-lg font-mono text-green-600">{totalIn}</TableCell>
                                <TableCell className="text-right font-bold text-lg font-mono text-red-600">{Math.abs(totalOut)}</TableCell>
                                <TableCell className="text-right font-bold text-lg font-mono">{runningStock}</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell colSpan={6} className="text-right font-bold">Estimated Profit</TableCell>
                                <TableCell className="text-right font-bold text-lg font-mono text-green-600">{formatCurrency(totalProfit, 'INR')}</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};


export function StockHistoryView({ data, viewMode }: StockHistoryViewProps) {
  
  const stockInData = React.useMemo(() => data.filter(e => e.quantity > 0), [data]);
  const stockOutData = React.useMemo(() => data.filter(e => e.quantity < 0).map(e => ({ ...e, quantity: Math.abs(e.quantity) })), [data]);

  if (viewMode === 'in') {
    return <StockTable title="Stock In" data={stockInData} type="in" />;
  }

  if (viewMode === 'out') {
    return <StockTable title="Stock Out" data={stockOutData} type="out" />;
  }

  return <CombinedStockTable data={data} />;
}
