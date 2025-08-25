
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
import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function TrialBalanceView({ data }: { data: TrialBalanceRow[] }) {
    
    const totals = React.useMemo(() => {
        return data.reduce(
            (acc, row) => {
                acc.debit += row.debit;
                acc.credit += row.credit;
                return acc;
            },
            { debit: 0, credit: 0 }
        );
    }, [data]);

    const isBalanced = Math.abs(totals.debit - totals.credit) < 0.01;

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-2xl">Trial Balance</CardTitle>
                        <CardDescription>
                            A summary of all ledger balances as of today.
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline"><Printer className="mr-2 h-4 w-4" /> Print</Button>
                        <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export</Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {!isBalanced && (
                     <Alert variant="destructive" className="mb-4">
                        <AlertTitle>Totals Do Not Match!</AlertTitle>
                        <AlertDescription>
                            The sum of debits does not equal the sum of credits. The difference is {formatCurrency(Math.abs(totals.debit - totals.credit), 'INR')}.
                        </AlertDescription>
                    </Alert>
                )}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[60%]">Account</TableHead>
                                <TableHead className="text-right">Debit</TableHead>
                                <TableHead className="text-right">Credit</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell className="font-medium">{row.account}</TableCell>
                                    <TableCell className="text-right font-mono">
                                        {row.debit > 0 ? formatCurrency(row.debit, 'INR') : '-'}
                                    </TableCell>
                                    <TableCell className="text-right font-mono">
                                        {row.credit > 0 ? formatCurrency(row.credit, 'INR') : '-'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead className={cn("text-right font-mono", !isBalanced && "text-destructive")}>
                                    {formatCurrency(totals.debit, 'INR')}
                                </TableHead>
                                <TableHead className={cn("text-right font-mono", !isBalanced && "text-destructive")}>
                                    {formatCurrency(totals.credit, 'INR')}
                                </TableHead>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
