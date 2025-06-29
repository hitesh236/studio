
'use client';

import * as React from 'react';
import type { Gstr3bData } from '../gst-summary/data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency, cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface Gstr3bTableProps {
  data: Gstr3bData;
}

const MobileSummaryCard = ({ title, data, currency = 'INR' }: {
    title: string,
    data: { taxableValue: number, igst: number, cgst: number, sgst: number },
    currency?: string
}) => {
    return (
        <Card>
            <CardHeader className="p-4">
                <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-sm">
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Taxable Value</span>
                        <span className="font-mono">{formatCurrency(data.taxableValue, currency)}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">IGST</span>
                        <span className="font-mono">{formatCurrency(data.igst, currency)}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">CGST</span>
                        <span className="font-mono">{formatCurrency(data.cgst, currency)}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">SGST</span>
                        <span className="font-mono">{formatCurrency(data.sgst, currency)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};


export function Gstr3bTable({ data }: Gstr3bTableProps) {
  const totalItc = Object.values(data.itcAvailable).reduce((acc, val) => acc + val, 0);

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle>3.1 Details of Outward Supplies and inward supplies liable to reverse charge</CardTitle>
                    </div>
                    <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export</Button>
                </div>
            </CardHeader>
            <CardContent>
                {/* Desktop Table View */}
                <div className="hidden md:block rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nature of Supplies</TableHead>
                                <TableHead className="text-right">Taxable Value</TableHead>
                                <TableHead className="text-right">IGST</TableHead>
                                <TableHead className="text-right">CGST</TableHead>
                                <TableHead className="text-right">SGST</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-medium">(a) Outward taxable supplies (other than zero rated, nil rated and exempted)</TableCell>
                                <TableCell className="text-right font-mono">{formatCurrency(data.outwardSupplies.taxableValue, 'INR')}</TableCell>
                                <TableCell className="text-right font-mono">{formatCurrency(data.outwardSupplies.igst, 'INR')}</TableCell>
                                <TableCell className="text-right font-mono">{formatCurrency(data.outwardSupplies.cgst, 'INR')}</TableCell>
                                <TableCell className="text-right font-mono">{formatCurrency(data.outwardSupplies.sgst, 'INR')}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">(d) Inward supplies (liable to reverse charge)</TableCell>
                                <TableCell className="text-right font-mono">{formatCurrency(data.inwardSuppliesRCM.taxableValue, 'INR')}</TableCell>
                                <TableCell className="text-right font-mono">{formatCurrency(data.inwardSuppliesRCM.igst, 'INR')}</TableCell>
                                <TableCell className="text-right font-mono">{formatCurrency(data.inwardSuppliesRCM.cgst, 'INR')}</TableCell>
                                <TableCell className="text-right font-mono">{formatCurrency(data.inwardSuppliesRCM.sgst, 'INR')}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                    <MobileSummaryCard title="Outward Taxable Supplies" data={data.outwardSupplies} />
                    <MobileSummaryCard title="Inward Supplies (RCM)" data={data.inwardSuppliesRCM} />
                </div>
            </CardContent>
        </Card>
        
        <Separator />
        
        <Card>
            <CardHeader>
                 <CardTitle>4. Eligible ITC</CardTitle>
            </CardHeader>
             <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Details</TableHead>
                                <TableHead className="text-right">Amount (INR)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>(A) ITC Available (whether in full or part)</TableCell>
                                <TableCell />
                            </TableRow>
                            <TableRow>
                                <TableCell className="pl-8">(1) Import of goods</TableCell>
                                <TableCell className="text-right font-mono">{formatCurrency(data.itcAvailable.importGoods, 'INR')}</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell className="pl-8">(2) Import of services</TableCell>
                                <TableCell className="text-right font-mono">{formatCurrency(data.itcAvailable.importServices, 'INR')}</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell className="pl-8">(3) Inward supplies liable to reverse charge (other than 1 & 2 above)</TableCell>
                                <TableCell className="text-right font-mono">{formatCurrency(data.itcAvailable.inwardRCM, 'INR')}</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell className="pl-8">(4) Inward supplies from ISD</TableCell>
                                <TableCell className="text-right font-mono">{formatCurrency(data.itcAvailable.inwardISD, 'INR')}</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell className="pl-8">(5) All other ITC</TableCell>
                                <TableCell className="text-right font-mono">{formatCurrency(data.itcAvailable.allOther, 'INR')}</TableCell>
                            </TableRow>
                             <TableRow className="font-bold bg-muted/50">
                                <TableCell>Total ITC Available</TableCell>
                                <TableCell className="text-right font-mono">{formatCurrency(totalItc, 'INR')}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
