
'use client';

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import { bankAccounts, recentInvoices, upcomingBills } from "./data";
import { format, parseISO } from 'date-fns';

export function InfoTabs() {
  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Paid': return 'default';
      case 'Partially Paid': return 'secondary';
      case 'Overdue': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <Card>
        <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>A quick look at your recent financial activities.</CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="invoices">
                <TabsList>
                    <TabsTrigger value="invoices" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Recent Invoices</TabsTrigger>
                    <TabsTrigger value="bills" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Upcoming Bills</TabsTrigger>
                    <TabsTrigger value="banks" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Bank Accounts</TabsTrigger>
                </TabsList>
                <TabsContent value="invoices">
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
                                <TableRow key={invoice.id}>
                                    <TableCell className="font-medium">{invoice.id}</TableCell>
                                    <TableCell>{invoice.customer}</TableCell>
                                    <TableCell className="text-right font-mono">{formatCurrency(invoice.amount, 'INR')}</TableCell>
                                    <TableCell className="text-center"><Badge variant={getStatusVariant(invoice.status)}>{invoice.status}</Badge></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TabsContent>
                <TabsContent value="bills">
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
                                    <TableCell className="font-medium">{bill.id}</TableCell>
                                    <TableCell>{bill.vendor}</TableCell>
                                    <TableCell>{format(parseISO(bill.dueDate), 'dd-MMM-yyyy')}</TableCell>
                                    <TableCell className="text-right font-mono">{formatCurrency(bill.amount, 'INR')}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TabsContent>
                <TabsContent value="banks">
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
                </TabsContent>
            </Tabs>
        </CardContent>
    </Card>
  );
}
