
'use client';

import * as React from 'react';
import type { PurchaseBill } from "./data";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import Link from 'next/link';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { formatCurrency } from '@/lib/utils';
import { SummaryCard } from '@/app/sales-invoices/summary-card';
import { FileWarning, CircleDollarSign, TrendingDown } from 'lucide-react';


const MobileBillCard = ({ bill }: { bill: PurchaseBill }) => (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
        <div className="flex justify-between items-start">
            <div>
                <p className="font-semibold">{bill.vendorName}</p>
                <p className="text-sm text-muted-foreground">{bill.billNumber}</p>
            </div>
            <p className="font-bold font-mono text-lg">{formatCurrency(bill.amount, 'INR')}</p>
        </div>
        <div className="flex justify-between items-center text-sm mt-4">
            <Badge variant="outline">{bill.paymentStatus}</Badge>
            <p className="text-muted-foreground">Due: {format(bill.dueDate, "dd MMM, yyyy")}</p>
        </div>
    </div>
);


export function PurchaseBillsTable({ data }: { data: PurchaseBill[] }) {
  const [bills, setBills] = useState<PurchaseBill[]>(data);

  const summaryStats = useMemo(() => {
    const totalPayable = bills.reduce((acc, bill) => acc + bill.amountDue, 0);
    const overdueAmount = bills.filter(b => b.paymentStatus === 'Overdue').reduce((acc, bill) => acc + bill.amountDue, 0);
    const dueThisMonth = bills.filter(b => b.dueDate.getMonth() === new Date().getMonth()).reduce((acc, bill) => acc + bill.amountDue, 0);
    return { totalPayable, overdueAmount, dueThisMonth };
  }, [bills]);

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SummaryCard
                title="Total Payables"
                value={formatCurrency(summaryStats.totalPayable, 'INR')}
                icon={CircleDollarSign}
                variant="primary"
            />
            <SummaryCard
                title="Overdue Payables"
                value={formatCurrency(summaryStats.overdueAmount, 'INR')}
                icon={FileWarning}
            />
            <SummaryCard
                title="Due This Month"
                value={formatCurrency(summaryStats.dueThisMonth, 'INR')}
                icon={TrendingDown}
            />
        </div>
        
        {/* Desktop Table View */}
        <div className="hidden md:block rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Bill #</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Bill Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount Due</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {bills.map(bill => (
                        <TableRow key={bill.id}>
                            <TableCell className="font-medium">
                               <Link href="#" className="hover:underline">{bill.billNumber}</Link>
                            </TableCell>
                            <TableCell>{bill.vendorName}</TableCell>
                            <TableCell>{format(bill.billDate, 'dd MMM, yyyy')}</TableCell>
                            <TableCell>{format(bill.dueDate, 'dd MMM, yyyy')}</TableCell>
                            <TableCell className="text-right font-mono">{formatCurrency(bill.amount, 'INR')}</TableCell>
                            <TableCell>
                                <Badge variant={bill.paymentStatus === 'Overdue' ? 'destructive' : bill.paymentStatus === 'Paid' ? 'default' : 'outline'}>
                                    {bill.paymentStatus}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right font-mono text-destructive">{formatCurrency(bill.amountDue, 'INR')}</TableCell>
                            <TableCell className="text-center">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem>View Bill</DropdownMenuItem>
                                        <DropdownMenuItem>Record Payment</DropdownMenuItem>
                                        <DropdownMenuItem>Create Purchase Return</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
            {bills.map(bill => (
                <MobileBillCard key={bill.id} bill={bill} />
            ))}
        </div>
    </div>
  );
}
