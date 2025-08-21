
'use client';

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, cn } from "@/lib/utils";
import { bankAccounts } from "./data";
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import type { SalesInvoice } from "../sales-invoices/data";
import type { PurchaseBill } from "../purchase/data";
import * as React from 'react';

interface InfoTabsProps {
    salesData: SalesInvoice[];
    purchaseData: PurchaseBill[];
}

// Mobile Card Components
const MobileInvoiceCard = ({ invoice }: { invoice: SalesInvoice }) => {
    const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        switch (status) {
          case 'Paid': return 'default';
          case 'Partially Paid': return 'secondary';
          case 'Overdue': return 'destructive';
          default: return 'outline';
        }
    };
    return (
        <Link href="/invoice-preview" className="block">
            <Card className="hover:border-primary">
                <CardHeader className="p-4 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-base">{invoice.invoiceNumber}</CardTitle>
                        <CardDescription>{invoice.customerName}</CardDescription>
                    </div>
                    <Badge variant={getStatusVariant(invoice.paymentStatus)}>{invoice.paymentStatus}</Badge>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <div className="flex justify-between items-baseline">
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="text-lg font-mono">{formatCurrency(invoice.amountBase, 'INR')}</p>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
};

const MobileBillCard = ({ bill }: { bill: PurchaseBill }) => {
    return (
        <Card>
            <CardHeader className="p-4">
                <CardTitle className="text-base">{bill.vendorName}</CardTitle>
                <CardDescription>Bill #{bill.billNumber}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                 <div className="flex justify-between items-baseline">
                    <p className="text-sm text-muted-foreground">Due: {format(bill.dueDate, 'dd-MMM-yyyy')}</p>
                    <p className="text-lg font-mono">{formatCurrency(bill.amount, 'INR')}</p>
                </div>
            </CardContent>
        </Card>
    );
};

const MobileAccountCard = ({ account }: { account: typeof bankAccounts[0] }) => {
    return (
        <Card>
            <CardHeader className="p-4">
                <CardTitle className="text-base">{account.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="flex justify-between items-baseline">
                    <p className="text-sm text-muted-foreground">Balance</p>
                    <p className="text-lg font-mono">{formatCurrency(account.balance, 'INR')}</p>
                </div>
            </CardContent>
        </Card>
    )
};

export function InfoTabs({ salesData, purchaseData }: InfoTabsProps) {
  const router = useRouter();

  const recentInvoices = React.useMemo(() => {
    return salesData.sort((a,b) => b.invoiceDate.getTime() - a.invoiceDate.getTime()).slice(0, 5);
  }, [salesData]);

  const upcomingBills = React.useMemo(() => {
    return purchaseData
      .filter(bill => bill.paymentStatus !== 'Paid' && bill.dueDate > new Date())
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
      .slice(0, 5);
  }, [purchaseData]);

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Paid': return 'default';
      case 'Partially Paid': return 'secondary';
      case 'Overdue': return 'destructive';
      default: return 'outline';
    }
  };
  
  const triggerClasses = "rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:border data-[state=inactive]:border-border data-[state=inactive]:bg-transparent";

  return (
    <Card>
        <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>A quick look at your recent financial activities.</CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="invoices">
                <TabsList className="bg-transparent p-0 justify-start gap-2 h-auto flex-wrap">
                    <TabsTrigger value="invoices" className={triggerClasses}>Recent Invoices</TabsTrigger>
                    <TabsTrigger value="bills" className={triggerClasses}>Upcoming Bills</TabsTrigger>
                    <TabsTrigger value="banks" className={triggerClasses}>Bank Accounts</TabsTrigger>
                </TabsList>
                <TabsContent value="invoices">
                    {/* Desktop Table View */}
                    <div className="hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice #</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentInvoices.map(invoice => (
                                    <TableRow key={invoice.id} className="group hover:bg-muted/50 cursor-pointer" onClick={() => router.push('/invoice-preview')}>
                                        <TableCell className="font-medium">
                                            <Link href="/invoice-preview" className="hover:underline group-hover:text-primary">
                                                {invoice.invoiceNumber}
                                            </Link>
                                        </TableCell>
                                        <TableCell>{invoice.customerName}</TableCell>
                                        <TableCell className="text-right font-mono">{formatCurrency(invoice.amountBase, 'INR')}</TableCell>
                                        <TableCell className="text-center"><Badge variant={getStatusVariant(invoice.paymentStatus)}>{invoice.paymentStatus}</Badge></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4 mt-4">
                        {recentInvoices.map(invoice => <MobileInvoiceCard key={invoice.id} invoice={invoice} />)}
                    </div>
                </TabsContent>
                <TabsContent value="bills">
                     {/* Desktop Table View */}
                    <div className="hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Bill #</TableHead>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {upcomingBills.map(bill => (
                                    <TableRow key={bill.id}>
                                        <TableCell className="font-medium">{bill.billNumber}</TableCell>
                                        <TableCell>{bill.vendorName}</TableCell>
                                        <TableCell>{format(bill.dueDate, 'dd-MMM-yyyy')}</TableCell>
                                        <TableCell className="text-right font-mono">{formatCurrency(bill.amount, 'INR')}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4 mt-4">
                        {upcomingBills.map(bill => <MobileBillCard key={bill.id} bill={bill} />)}
                    </div>
                </TabsContent>
                <TabsContent value="banks">
                     {/* Desktop Table View */}
                    <div className="hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Account Name</TableHead>
                                    <TableHead className="text-right">Balance</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {bankAccounts.map(account => (
                                    <TableRow key={account.id}>
                                        <TableCell className="font-medium">{account.name}</TableCell>
                                        <TableCell className="text-right font-mono">{formatCurrency(account.balance, 'INR')}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4 mt-4">
                        {bankAccounts.map(account => <MobileAccountCard key={account.id} account={account} />)}
                    </div>
                </TabsContent>
            </Tabs>
        </CardContent>
    </Card>
  );
}
