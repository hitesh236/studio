
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

interface StockHistoryViewProps {
  data: StockHistoryEntry[];
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
                                <TableHead>Code</TableHead>
                                <TableHead>{type === 'in' ? 'Supplier/Client' : 'Client/Supplier'}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((entry, index) => (
                                <TableRow key={entry.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{format(entry.date, 'dd MMM, yyyy')}</TableCell>
                                    <TableCell className="text-right font-mono">{entry.quantity}</TableCell>
                                    <TableCell className="text-right font-mono">{formatCurrency(entry.price, 'USD')}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{entry.type}</Badge>
                                    </TableCell>
                                    <TableCell>{entry.code}</TableCell>
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

export function StockHistoryView({ data }: StockHistoryViewProps) {
  
  const stockInData = React.useMemo(() => data.filter(e => e.quantity > 0), [data]);
  const stockOutData = React.useMemo(() => data.filter(e => e.quantity < 0), [data]);

  return (
    <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StockTable title="Stock In" data={stockInData} type="in" />
            <StockTable title="Stock Out" data={stockOutData} type="out" />
        </div>
    </CardContent>
  );
}
