
'use client';

import * as React from 'react';
import {
  UserCircle, Mail, Phone, MapPin, ChevronDown, ChevronRight, Plus, CreditCard, FileText, FileWarning
} from 'lucide-react';

import { generateData, Person } from "@/lib/data";
import { generateSalesInvoices, SalesInvoice, SalesInvoiceItem } from "@/app/sales-invoices/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SummaryCard } from '@/app/sales-invoices/summary-card';

// Generate data once
const customer: Person = { ...generateData(1)[0], company: "Solutions Corp." };
const allInvoices = generateSalesInvoices(50);
const customerInvoices = allInvoices.filter(inv => inv.customerName === customer.company);

const AddPaymentDialog = ({ invoice, onPaymentAdd }: { invoice: SalesInvoice | null, onPaymentAdd: () => void }) => {
    const { toast } = useToast();
    const [amount, setAmount] = React.useState(invoice?.amountDue.toString() ?? '0');
    const [isOpen, setIsOpen] = React.useState(false);

    React.useEffect(() => {
        if (invoice) {
            setAmount(invoice.amountDue.toFixed(2));
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    }, [invoice]);

    if (!invoice) return null;

    const handleSave = () => {
        toast({
            title: "Payment Recorded",
            description: `Payment of ${formatCurrency(parseFloat(amount), invoice.currencyCode)} for invoice ${invoice.invoiceNumber} has been recorded.`
        });
        onPaymentAdd();
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) onPaymentAdd(); // This will set the selected invoice to null, closing the dialog
        }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Payment for {invoice.invoiceNumber}</DialogTitle>
                    <DialogDescription>
                        Record a payment received from {invoice.customerName}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">Amount</Label>
                        <Input
                            id="amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleSave}>Save Payment</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


export default function CustomerPortfolioPage() {
    const [expandedRows, setExpandedRows] = React.useState<Set<string>>(new Set());
    const [paymentInvoice, setPaymentInvoice] = React.useState<SalesInvoice | null>(null);

    const toggleRowExpansion = (id: string) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const summaryStats = React.useMemo(() => {
        const totalBilled = customerInvoices.reduce((acc, inv) => acc + inv.amountBase, 0);
        const totalPaid = customerInvoices.reduce((acc, inv) => acc + inv.amountPaid, 0);
        const totalDue = totalBilled - totalPaid;
        return { totalBilled, totalPaid, totalDue };
    }, []);

    const getStatusVariant = (status: SalesInvoice['paymentStatus']) => {
        switch (status) {
            case 'Paid': return 'default';
            case 'Partially Paid': return 'secondary';
            case 'Overdue': return 'destructive';
            case 'Outstanding': return 'outline';
            default: return 'outline';
        }
    };
    
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <UserCircle className="h-12 w-12 text-muted-foreground" />
            <div>
              <CardTitle className="text-2xl">{`${customer.firstName} ${customer.lastName}`}</CardTitle>
              <CardDescription>{customer.company}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4 text-sm">
            <div className="flex items-start gap-3">
              <Mail className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <p className="text-muted-foreground">{customer.email}</p>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <p className="text-muted-foreground">{customer.phone}</p>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <p className="text-muted-foreground">{customer.address.city}, {customer.address.state}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard icon={FileText} title="Total Billed" value={formatCurrency(summaryStats.totalBilled, 'INR')} variant="primary" />
        <SummaryCard icon={CreditCard} title="Total Received" value={formatCurrency(summaryStats.totalPaid, 'INR')} />
        <SummaryCard icon={FileWarning} title="Total Due" value={formatCurrency(summaryStats.totalDue, 'INR')} />
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Invoice History</CardTitle>
            <CardDescription>A list of all invoices for this customer.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12"></TableHead>
                            <TableHead>Invoice #</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Amount Due</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {customerInvoices.length > 0 ? customerInvoices.map(invoice => (
                            <React.Fragment key={invoice.id}>
                                <TableRow onClick={() => toggleRowExpansion(invoice.id)} className="cursor-pointer">
                                    <TableCell>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            {expandedRows.has(invoice.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                        </Button>
                                    </TableCell>
                                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                                    <TableCell>{format(invoice.invoiceDate, 'dd-MMM-yyyy')}</TableCell>
                                    <TableCell>{format(invoice.dueDate, 'dd-MMM-yyyy')}</TableCell>
                                    <TableCell className="text-right font-mono">{formatCurrency(invoice.amountBase, 'INR')}</TableCell>
                                    <TableCell className="text-right font-mono text-destructive">{formatCurrency(invoice.amountDue, 'INR')}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={getStatusVariant(invoice.paymentStatus)}>{invoice.paymentStatus}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setPaymentInvoice(invoice);
                                            }}
                                            disabled={invoice.paymentStatus === 'Paid'}
                                        >
                                            <Plus className="mr-2 h-4 w-4" /> Add Payment
                                        </Button>
                                    </TableCell>
                                </TableRow>
                                {expandedRows.has(invoice.id) && (
                                    <TableRow>
                                        <TableCell colSpan={8} className="p-0">
                                            <div className="p-4 bg-muted/50">
                                                <h4 className="font-semibold mb-2">Invoice Items</h4>
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Item</TableHead>
                                                            <TableHead className="text-right">Quantity</TableHead>
                                                            <TableHead className="text-right">Rate</TableHead>
                                                            <TableHead className="text-right">Amount ({invoice.currencyCode})</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {invoice.items.map(item => (
                                                            <TableRow key={item.id}>
                                                                <TableCell>{item.name}</TableCell>
                                                                <TableCell className="text-right">{item.quantity}</TableCell>
                                                                <TableCell className="text-right font-mono">{formatCurrency(item.rate, invoice.currencyCode)}</TableCell>
                                                                <TableCell className="text-right font-mono">{formatCurrency(item.quantity * item.rate, invoice.currencyCode)}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </React.Fragment>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center h-24">
                                    No invoices found for this customer.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
      
      <AddPaymentDialog invoice={paymentInvoice} onPaymentAdd={() => setPaymentInvoice(null)} />
    </div>
  );
}
