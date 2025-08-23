
'use client';

import * as React from 'react';
import type { Gstr1Data } from '../gst-summary/data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter
} from '@/components/ui/table';
import { formatCurrency, cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface Gstr1TableProps {
  data: Gstr1Data;
}

const MobileB2BCard = ({ invoice }: { invoice: Gstr1Data['b2b'][0] }) => {
    return (
        <Card>
            <CardHeader className="p-4">
                <CardTitle className="text-base">{invoice.gstin}</CardTitle>
                <CardDescription>Invoice Value: {formatCurrency(invoice.invoiceValue, 'INR')}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-sm">
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Taxable Value</span>
                        <span className="font-mono">{formatCurrency(invoice.taxableValue, 'INR')}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Rate</span>
                        <span className="font-mono">{invoice.rate}%</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax Amount</span>
                        <span className="font-mono font-semibold">{formatCurrency(invoice.igst + invoice.cgst + invoice.sgst, 'INR')}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};


export function Gstr1Table({ data }: Gstr1TableProps) {
    
  const b2bTotals = React.useMemo(() => {
    return data.b2b.reduce((acc, curr) => {
        acc.invoiceValue += curr.invoiceValue;
        acc.taxableValue += curr.taxableValue;
        acc.igst += curr.igst;
        acc.cgst += curr.cgst;
        acc.sgst += curr.sgst;
        return acc;
    }, { invoiceValue: 0, taxableValue: 0, igst: 0, cgst: 0, sgst: 0 });
  }, [data.b2b]);

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle>B2B Invoices (4A, 4B, 4C, 6B, 6C)</CardTitle>
                        <CardDescription>Details of supplies made to registered persons.</CardDescription>
                    </div>
                    <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export B2B</Button>
                </div>
            </CardHeader>
            <CardContent>
                {/* Desktop Table View */}
                <div className="hidden md:block rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>GSTIN/UIN</TableHead>
                                <TableHead className="text-right">Invoice Value</TableHead>
                                <TableHead className="text-right">Taxable Value</TableHead>
                                <TableHead className="text-right">Rate (%)</TableHead>
                                <TableHead className="text-right">IGST</TableHead>
                                <TableHead className="text-right">CGST</TableHead>
                                <TableHead className="text-right">SGST</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.b2b.map((invoice, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{invoice.gstin}</TableCell>
                                    <TableCell className="text-right font-mono">{formatCurrency(invoice.invoiceValue, 'INR')}</TableCell>
                                    <TableCell className="text-right font-mono">{formatCurrency(invoice.taxableValue, 'INR')}</TableCell>
                                    <TableCell className="text-right">{invoice.rate}%</TableCell>
                                    <TableCell className="text-right font-mono">{formatCurrency(invoice.igst, 'INR')}</TableCell>
                                    <TableCell className="text-right font-mono">{formatCurrency(invoice.cgst, 'INR')}</TableCell>
                                    <TableCell className="text-right font-mono">{formatCurrency(invoice.sgst, 'INR')}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                         <TableFooter>
                            <TableRow>
                                <TableHead>Total</TableHead>
                                <TableHead className="text-right font-mono">{formatCurrency(b2bTotals.invoiceValue, 'INR')}</TableHead>
                                <TableHead className="text-right font-mono">{formatCurrency(b2bTotals.taxableValue, 'INR')}</TableHead>
                                <TableHead />
                                <TableHead className="text-right font-mono">{formatCurrency(b2bTotals.igst, 'INR')}</TableHead>
                                <TableHead className="text-right font-mono">{formatCurrency(b2bTotals.cgst, 'INR')}</TableHead>
                                <TableHead className="text-right font-mono">{formatCurrency(b2bTotals.sgst, 'INR')}</TableHead>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
                 {/* Mobile Card View */}
                 <div className="md:hidden space-y-4">
                    {data.b2b.length > 0 ? data.b2b.map((invoice, i) => (
                        <MobileB2BCard key={i} invoice={invoice} />
                    )) : (
                        <div className="text-center text-muted-foreground py-12">No B2B invoices found.</div>
                    )}
                </div>
            </CardContent>
        </Card>
        
        <Separator />
        
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle>B2C (Large) Invoices (5A, 5B)</CardTitle>
                        <CardDescription>Details of inter-state supplies to unregistered persons where invoice value is more than Rs 2.5 lakh.</CardDescription>
                    </div>
                </div>
            </CardHeader>
             <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Place of Supply (State Code)</TableHead>
                                <TableHead className="text-right">Invoice Value</TableHead>
                                <TableHead className="text-right">Taxable Value</TableHead>
                                <TableHead className="text-right">Rate (%)</TableHead>
                                <TableHead className="text-right">IGST</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.b2cLarge.map((invoice, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{invoice.pos}</TableCell>
                                    <TableCell className="text-right font-mono">{formatCurrency(invoice.invoiceValue, 'INR')}</TableCell>
                                    <TableCell className="text-right font-mono">{formatCurrency(invoice.taxableValue, 'INR')}</TableCell>
                                    <TableCell className="text-right">{invoice.rate}%</TableCell>
                                    <TableCell className="text-right font-mono">{formatCurrency(invoice.igst, 'INR')}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
