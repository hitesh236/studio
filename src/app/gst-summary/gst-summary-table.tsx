
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
import { Separator } from '@/components/ui/separator';

interface GstSummaryTableProps {
  data: GstSummary[];
}

const MobileGstSummaryCard = ({ summary }: { summary: GstSummary }) => {
    const reportData = summary.gstr1;
    const totalTax = reportData.cgst + reportData.sgst + reportData.igst;

    return (
        <Card>
            <CardHeader className="p-4 flex flex-row items-start justify-between">
                <div>
                    <CardTitle className="text-base">{summary.month} {summary.year}</CardTitle>
                    <CardDescription>Filing Date: {format(reportData.filingDate, 'dd-MMM-yy')}</CardDescription>
                </div>
                <Badge variant={reportData.status === 'Filed' ? 'default' : 'destructive'}>{reportData.status}</Badge>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <Separator className="mb-4" />
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Taxable Value</span>
                        <span className="font-mono">{formatCurrency(reportData.taxableValue, 'INR')}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Tax</span>
                        <span className="font-mono font-semibold">{formatCurrency(totalTax, 'INR')}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

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
                        <CardTitle>GST Filing Summary</CardTitle>
                        <CardDescription>A monthly overview of your GSTR-1 and GSTR-3B filings.</CardDescription>
                    </div>
                    <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export Report</Button>
                </div>
            </CardHeader>
            <CardContent>
                {/* Desktop Table View */}
                <div className="hidden md:block rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead rowSpan={2} className="text-center align-middle">Month</TableHead>
                                <TableHead colSpan={4} className="text-center border-b">GSTR-1</TableHead>
                                <TableHead colSpan={5} className="text-center border-l">GSTR-3B</TableHead>
                            </TableRow>
                            <TableRow>
                                <TableHead className="text-right">Taxable Value</TableHead>
                                <TableHead className="text-right">Total Tax</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-center border-r">Filing Date</TableHead>

                                <TableHead className="text-right">Taxable Value</TableHead>
                                <TableHead className="text-right">Total Tax</TableHead>
                                <TableHead className="text-right">ITC</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-center">Filing Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map(summary => {
                                const gstr1TotalTax = summary.gstr1.cgst + summary.gstr1.sgst + summary.gstr1.igst;
                                const gstr3bTotalTax = summary.gstr3b.cgst + summary.gstr3b.sgst + summary.gstr3b.igst;
                                return (
                                    <TableRow key={summary.id}>
                                        <TableCell className="font-medium text-center">{summary.month} {summary.year}</TableCell>
                                        
                                        <TableCell className="text-right font-mono">{formatCurrency(summary.gstr1.taxableValue, 'INR')}</TableCell>
                                        <TableCell className="text-right font-mono">{formatCurrency(gstr1TotalTax, 'INR')}</TableCell>
                                        <TableCell className="text-center"><Badge variant={summary.gstr1.status === 'Filed' ? 'default' : 'destructive'}>{summary.gstr1.status}</Badge></TableCell>
                                        <TableCell className="text-center border-r">{format(summary.gstr1.filingDate, 'dd-MMM-yy')}</TableCell>

                                        <TableCell className="text-right font-mono">{formatCurrency(summary.gstr3b.taxableValue, 'INR')}</TableCell>
                                        <TableCell className="text-right font-mono">{formatCurrency(gstr3bTotalTax, 'INR')}</TableCell>
                                        <TableCell className="text-right font-mono">{formatCurrency(summary.gstr3b.itc, 'INR')}</TableCell>
                                        <TableCell className="text-center"><Badge variant={summary.gstr3b.status === 'Filed' ? 'default' : 'destructive'}>{summary.gstr3b.status}</Badge></TableCell>
                                        <TableCell className="text-center">{format(summary.gstr3b.filingDate, 'dd-MMM-yy')}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
                {/* Mobile Card View */}
                 <div className="md:hidden space-y-4">
                    {data.length > 0 ? data.map(summary => (
                        <MobileGstSummaryCard key={summary.id} summary={summary} />
                    )) : (
                        <div className="text-center text-muted-foreground py-12">No data found.</div>
                    )}
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
