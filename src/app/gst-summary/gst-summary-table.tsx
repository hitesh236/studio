
'use client';

import * as React from 'react';
import type { GstSummary } from './data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { formatCurrency, cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SummaryCard } from '@/app/sales-invoices/summary-card';

interface GstSummaryTableProps {
  data: GstSummary[];
}

export function GstSummaryTable({ data }: GstSummaryTableProps) {
    
  const summaryStats = React.useMemo(() => {
    let totalTaxable = 0;
    let totalGst = 0;
    let totalItc = 0;
    
    data.forEach(summary => {
        totalTaxable += summary.gstr1.taxableValue;
        totalGst += summary.gstr1.cgst + summary.gstr1.sgst + summary.gstr1.igst;
        totalItc += summary.gstr3b.itc;
    });

    const netGstPayable = totalGst - totalItc;
    return { totalTaxable, totalGst, totalItc, netGstPayable };
  }, [data]);

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard icon={FileText} title="Total Taxable Value" value={formatCurrency(summaryStats.totalTaxable, 'INR')} variant="primary" />
            <SummaryCard icon={FileText} title="Total GST Collected" value={formatCurrency(summaryStats.totalGst, 'INR')} />
            <SummaryCard icon={Download} title="Total ITC Claimed" value={formatCurrency(summaryStats.totalItc, 'INR')} />
            <SummaryCard icon={CheckCircle} title="Net GST Payable" value={formatCurrency(summaryStats.netGstPayable, 'INR')} />
        </div>

        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle>GST Summary</CardTitle>
                        <CardDescription>A summary of your GSTR-1 and GSTR-3B filings.</CardDescription>
                    </div>
                    <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export Report</Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead rowSpan={2} className="align-middle text-center">Month</TableHead>
                                <TableHead colSpan={4} className="text-center border-l border-b">GSTR-1 (Sales)</TableHead>
                                <TableHead colSpan={5} className="text-center border-l border-b">GSTR-3B (Summary)</TableHead>
                            </TableRow>
                            <TableRow>
                                <TableHead className="text-right border-l">Taxable Value</TableHead>
                                <TableHead className="text-right">GST</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-center">Filing Date</TableHead>
                                <TableHead className="text-right border-l">Taxable Value</TableHead>
                                <TableHead className="text-right">GST</TableHead>
                                <TableHead className="text-right">ITC</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-center">Filing Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map(summary => {
                                const gstr1TotalGst = summary.gstr1.cgst + summary.gstr1.sgst + summary.gstr1.igst;
                                const gstr3bTotalGst = summary.gstr3b.cgst + summary.gstr3b.sgst + summary.gstr3b.igst;
                                return (
                                    <TableRow key={summary.id}>
                                        <TableCell className="font-medium">{summary.month} {summary.year}</TableCell>
                                        <TableCell className="text-right font-mono border-l">{formatCurrency(summary.gstr1.taxableValue, 'INR')}</TableCell>
                                        <TableCell className="text-right font-mono">{formatCurrency(gstr1TotalGst, 'INR')}</TableCell>
                                        <TableCell className="text-center"><Badge variant={summary.gstr1.status === 'Filed' ? 'default' : 'destructive'}>{summary.gstr1.status}</Badge></TableCell>
                                        <TableCell className="text-center">{format(summary.gstr1.filingDate, 'dd-MMM-yy')}</TableCell>
                                        <TableCell className="text-right font-mono border-l">{formatCurrency(summary.gstr3b.taxableValue, 'INR')}</TableCell>
                                        <TableCell className="text-right font-mono">{formatCurrency(gstr3bTotalGst, 'INR')}</TableCell>
                                        <TableCell className="text-right font-mono">{formatCurrency(summary.gstr3b.itc, 'INR')}</TableCell>
                                        <TableCell className="text-center"><Badge variant={summary.gstr3b.status === 'Filed' ? 'default' : 'destructive'}>{summary.gstr3b.status}</Badge></TableCell>
                                        <TableCell className="text-center">{format(summary.gstr3b.filingDate, 'dd-MMM-yy')}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
