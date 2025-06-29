
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
import { Download, FileText, CheckCircle, Landmark, FileWarning } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SummaryCard } from '@/app/sales-invoices/summary-card';

interface GstSummaryTableProps {
  data: GstSummary[];
}

export function GstSummaryTable({ data }: GstSummaryTableProps) {
    
  const summaryStats = React.useMemo(() => {
    let totalTaxable = 0;
    let totalGst = 0;
    let filedCount = 0;
    
    data.forEach(summary => {
        // Using GSTR-1 data for this summary as a representative report
        totalTaxable += summary.gstr1.taxableValue;
        totalGst += summary.gstr1.cgst + summary.gstr1.sgst + summary.gstr1.igst;
        if (summary.gstr1.status === 'Filed') {
            filedCount++;
        }
    });

    const pendingCount = data.length - filedCount;
    return { totalTaxable, totalGst, filedCount, pendingCount };
  }, [data]);

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard icon={FileText} title="Total Taxable Value" value={formatCurrency(summaryStats.totalTaxable, 'INR')} variant="primary" />
            <SummaryCard icon={Landmark} title="Total GST Collected" value={formatCurrency(summaryStats.totalGst, 'INR')} />
            <SummaryCard icon={CheckCircle} title="Reports Filed" value={`${summaryStats.filedCount}`} />
            <SummaryCard icon={FileWarning} title="Reports Pending" value={`${summaryStats.pendingCount}`} />
        </div>

        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle>Generated Report</CardTitle>
                        <CardDescription>A detailed view of the generated report data.</CardDescription>
                    </div>
                    <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export Report</Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Month</TableHead>
                                <TableHead className="text-right">Taxable Value</TableHead>
                                <TableHead className="text-right">CGST</TableHead>
                                <TableHead className="text-right">SGST</TableHead>
                                <TableHead className="text-right">IGST</TableHead>
                                <TableHead className="text-right">Total Tax</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-center">Filing Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map(summary => {
                                // For simplicity, we'll use GSTR-1 data as the basis for the "single report"
                                const reportData = summary.gstr1; 
                                const totalTax = reportData.cgst + reportData.sgst + reportData.igst;
                                return (
                                    <TableRow key={summary.id}>
                                        <TableCell className="font-medium">{summary.month} {summary.year}</TableCell>
                                        <TableCell className="text-right font-mono">{formatCurrency(reportData.taxableValue, 'INR')}</TableCell>
                                        <TableCell className="text-right font-mono">{formatCurrency(reportData.cgst, 'INR')}</TableCell>
                                        <TableCell className="text-right font-mono">{formatCurrency(reportData.sgst, 'INR')}</TableCell>
                                        <TableCell className="text-right font-mono">{formatCurrency(reportData.igst, 'INR')}</TableCell>
                                        <TableCell className="text-right font-mono font-bold">{formatCurrency(totalTax, 'INR')}</TableCell>
                                        <TableCell className="text-center"><Badge variant={reportData.status === 'Filed' ? 'default' : 'destructive'}>{reportData.status}</Badge></TableCell>
                                        <TableCell className="text-center">{format(reportData.filingDate, 'dd-MMM-yy')}</TableCell>
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
