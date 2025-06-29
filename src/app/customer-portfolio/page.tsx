
'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import {
  Mail, Phone, MapPin, ChevronDown, ChevronUp, ChevronRight, Plus, CreditCard, FileText, FileWarning, TrendingUp, CircleDollarSign, Scale, Download, Calendar as CalendarIcon, MoreHorizontal
} from 'lucide-react';
import type { DateRange } from 'react-day-picker';

import { generateData, Person } from "@/lib/data";
import { generateSalesInvoices, SalesInvoice } from "@/app/sales-invoices/data";
import { generateCustomerLedger, CustomerLedgerEntry } from '@/lib/customer-ledger-data';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import Loading from '../loading';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

// --- Reusable Dialog Component ---
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
            if (!open) onPaymentAdd();
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

// --- Mobile Ledger Card ---
const MobileLedgerCard = ({ entry }: { entry: { id: string; date: Date; description: string; ref: string; debit: number; credit: number; balance: number } }) => {
    const balanceType = entry.balance >= 0 ? 'Dr' : 'Cr';
    return (
        <Card>
            <CardHeader className="p-4">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{entry.description}</CardTitle>
                    <span className="text-sm font-mono text-muted-foreground">{format(entry.date, 'dd-MMM-yy')}</span>
                </div>
                <CardDescription>Ref: {entry.ref}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <Separator className="mb-4" />
                <div className="flex justify-between items-center text-sm">
                    <div className="space-y-1">
                        <p className="text-muted-foreground">Debit</p>
                        <p className="font-mono text-primary">{entry.debit > 0 ? formatCurrency(entry.debit, 'INR') : '-'}</p>
                    </div>
                    <div className="space-y-1 text-right">
                        <p className="text-muted-foreground">Credit</p>
                        <p className="font-mono text-destructive">{entry.credit > 0 ? formatCurrency(entry.credit, 'INR') : '-'}</p>
                    </div>
                    <div className="space-y-1 text-right">
                        <p className="text-muted-foreground">Balance</p>
                        <p className="font-mono">{formatCurrency(Math.abs(entry.balance), 'INR')} {balanceType}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

// --- Ledger Tab Component ---
const CustomerLedgerView = ({ customerLedgerData }: { customerLedgerData: CustomerLedgerEntry[] }) => {
    const [filter, setFilter] = React.useState('');
    const [date, setDate] = React.useState<DateRange | undefined>({ from: undefined, to: undefined });

    const filteredLedgerData = React.useMemo(() => {
        return customerLedgerData.filter(entry => {
            const matchesFilter = filter ? entry.description.toLowerCase().includes(filter.toLowerCase()) : true;
            const matchesDate =
                (!date?.from || entry.date >= date.from) &&
                (!date?.to || new Date(entry.date.setHours(23, 59, 59, 999)) >= date.to);
            return matchesFilter && matchesDate;
        });
    }, [filter, date, customerLedgerData]);
    
    const processedLedgerData = React.useMemo(() => {
        let runningBalance = 0;
        return filteredLedgerData.map(entry => {
            runningBalance += entry.debit - entry.credit;
            return { ...entry, balance: runningBalance };
        });
    }, [filteredLedgerData]);

    const ledgerSummary = React.useMemo(() => {
        let totalDebit = 0;
        let totalCredit = 0;
        processedLedgerData.forEach(entry => {
            totalDebit += entry.debit;
            totalCredit += entry.credit;
        });
        const closingBalance = totalDebit - totalCredit;
        return { totalDebit, totalCredit, closingBalance };
    }, [processedLedgerData]);

    return (
        <div className="space-y-6 mt-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <SummaryCard icon={TrendingUp} title="Total Debits" value={formatCurrency(ledgerSummary.totalDebit, 'INR')} variant="primary" />
                <SummaryCard icon={CircleDollarSign} title="Total Credits" value={formatCurrency(ledgerSummary.totalCredit, 'INR')} />
                <SummaryCard icon={Scale} title="Closing Balance" value={formatCurrency(ledgerSummary.closingBalance, 'INR')} />
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <CardTitle>Customer Ledger</CardTitle>
                            <CardDescription>A detailed view of all transactions.</CardDescription>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                             <Input
                                placeholder="Filter description..."
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="w-full sm:w-[250px]"
                            />
                            <Popover>
                                <PopoverTrigger asChild>
                                <Button id="date" variant={"outline"} className={cn("w-full sm:w-auto justify-start text-left font-normal", !date && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date?.from ? (date.to ? <>{format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}</> : format(date.from, "LLL dd, y")) : <span>Pick a date</span>}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="end">
                                    <Calendar initialFocus mode="range" defaultMonth={date?.from} selected={date} onSelect={setDate} numberOfMonths={2} />
                                </PopoverContent>
                            </Popover>
                            <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export</Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Desktop Table View */}
                    <div className="hidden md:block rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Ref #</TableHead>
                                    <TableHead className="text-right">Debit</TableHead>
                                    <TableHead className="text-right">Credit</TableHead>
                                    <TableHead className="text-right">Balance</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {processedLedgerData.map(entry => {
                                    const balanceType = entry.balance >= 0 ? 'Dr' : 'Cr';
                                    return (
                                        <TableRow key={entry.id}>
                                            <TableCell>{format(entry.date, 'dd-MMM-yy')}</TableCell>
                                            <TableCell>{entry.description}</TableCell>
                                            <TableCell>{entry.ref}</TableCell>
                                            <TableCell className="text-right font-mono text-primary">{entry.debit > 0 ? formatCurrency(entry.debit, 'INR') : '-'}</TableCell>
                                            <TableCell className="text-right font-mono text-destructive">{entry.credit > 0 ? formatCurrency(entry.credit, 'INR') : '-'}</TableCell>
                                            <TableCell className="text-right font-mono">{formatCurrency(Math.abs(entry.balance), 'INR')} {balanceType}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                            <TableFooter>
                                <TableRow>
                                    <TableCell colSpan={3} className="text-right font-bold">Closing Balance</TableCell>
                                    <TableCell className="text-right font-mono font-bold">{formatCurrency(ledgerSummary.totalDebit, 'INR')}</TableCell>
                                    <TableCell className="text-right font-mono font-bold">{formatCurrency(ledgerSummary.totalCredit, 'INR')}</TableCell>
                                    <TableCell className="text-right font-mono font-bold">{formatCurrency(Math.abs(ledgerSummary.closingBalance), 'INR')} {ledgerSummary.closingBalance >= 0 ? 'Dr' : 'Cr'}</TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </div>
                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                        {processedLedgerData.length > 0 ? processedLedgerData.map(entry => (
                            <MobileLedgerCard key={entry.id} entry={entry} />
                        )) : (
                             <div className="text-center text-muted-foreground py-12">No ledger entries found.</div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

// --- Mobile Invoice Card ---
const MobileInvoiceCard = ({ invoice, isExpanded, onExpand, onAddPaymentClick }: {
    invoice: SalesInvoice;
    isExpanded: boolean;
    onExpand: () => void;
    onAddPaymentClick: (invoice: SalesInvoice) => void;
}) => {
    const getStatusVariant = (status: SalesInvoice['paymentStatus']) => {
        switch (status) {
            case 'Paid': return 'default';
            case 'Partially Paid': return 'secondary';
            case 'Overdue': return 'destructive';
            default: return 'outline';
        }
    };
    return (
        <Card onClick={onExpand} className="cursor-pointer">
            <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-semibold">{invoice.invoiceNumber}</p>
                        <p className="text-sm text-muted-foreground">{format(invoice.invoiceDate, 'dd-MMM-yyyy')}</p>
                    </div>
                     <Badge variant={getStatusVariant(invoice.paymentStatus)}>{invoice.paymentStatus}</Badge>
                </div>
                <div className="flex justify-between items-baseline">
                    <p className="text-sm text-muted-foreground">Amount Due</p>
                    <p className="text-lg font-mono text-destructive">{formatCurrency(invoice.amountDue, invoice.currencyCode)}</p>
                </div>
                {isExpanded && (
                    <div className="space-y-4 pt-4">
                        <Separator />
                        <h4 className="font-semibold text-sm">Invoice Items</h4>
                        <div className="space-y-2">
                             {invoice.items.map(item => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <p className="text-muted-foreground">{item.name} (x{item.quantity})</p>
                                    <p className="font-mono">{formatCurrency(item.quantity * item.rate, invoice.currencyCode)}</p>
                                </div>
                            ))}
                        </div>
                        <Separator />
                        <Button
                            className="w-full"
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddPaymentClick(invoice);
                            }}
                            disabled={invoice.paymentStatus === 'Paid'}
                        >
                            <Plus className="mr-2 h-4 w-4" /> Add Payment
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

// --- Invoice Tab Component ---
const CustomerInvoiceView = ({ customerInvoices, onAddPaymentClick }: { customerInvoices: SalesInvoice[], onAddPaymentClick: (invoice: SalesInvoice) => void }) => {
    const [expandedRows, setExpandedRows] = React.useState<Set<string>>(new Set());

    const toggleRowExpansion = (id: string) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    const summaryStats = React.useMemo(() => {
        const totalBilled = customerInvoices.reduce((acc, inv) => acc + inv.amountBase, 0);
        const totalPaid = customerInvoices.reduce((acc, inv) => acc + inv.amountPaid, 0);
        const totalDue = totalBilled - totalPaid;
        return { totalBilled, totalPaid, totalDue };
    }, [customerInvoices]);

    const getStatusVariant = (status: SalesInvoice['paymentStatus']) => {
        switch (status) {
            case 'Paid': return 'default';
            case 'Partially Paid': return 'secondary';
            case 'Overdue': return 'destructive';
            default: return 'outline';
        }
    };
    
    return (
        <div className="space-y-6 mt-4">
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
                    {/* Desktop Table View */}
                    <div className="hidden md:block rounded-md border">
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
                                                        onAddPaymentClick(invoice);
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
                     {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                        {customerInvoices.length > 0 ? customerInvoices.map(invoice => (
                            <MobileInvoiceCard 
                                key={invoice.id} 
                                invoice={invoice}
                                isExpanded={expandedRows.has(invoice.id)}
                                onExpand={() => toggleRowExpansion(invoice.id)}
                                onAddPaymentClick={onAddPaymentClick}
                            />
                        )) : (
                             <div className="text-center text-muted-foreground py-12">No invoices found.</div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// --- Content Component ---
const CustomerPortfolioContent = () => {
    const searchParams = useSearchParams();
    const customerId = searchParams.get('id');
    const [isDetailsExpanded, setIsDetailsExpanded] = React.useState(false);

    const allCustomers = React.useMemo(() => generateData(50), []);
    const allInvoices = React.useMemo(() => generateSalesInvoices(50), []);
    const allLedgerData = React.useMemo(() => generateCustomerLedger(25), []);

    const customer = React.useMemo(() => {
        if (customerId) {
            return allCustomers.find(c => c.id === customerId) || allCustomers[0];
        }
        return allCustomers[0];
    }, [customerId, allCustomers]);
    
    const customerInvoices = React.useMemo(() => allInvoices.filter(inv => inv.customerName === customer.company), [allInvoices, customer.company]);

    const [paymentInvoice, setPaymentInvoice] = React.useState<SalesInvoice | null>(null);

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                            <AvatarImage src="https://placehold.co/64x64.png" alt={`${customer.firstName} ${customer.lastName}`} data-ai-hint="person avatar" />
                            <AvatarFallback>{customer.firstName.charAt(0)}{customer.lastName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                            <CardTitle className="text-2xl">{`${customer.firstName} ${customer.lastName}`}</CardTitle>
                            <CardDescription>{customer.company}</CardDescription>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}>
                            {isDetailsExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                            <span className="sr-only">{isDetailsExpanded ? 'Collapse' : 'Expand'} details</span>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4 text-sm">
                        <div className="flex items-start gap-3">
                        <FileText className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                        <p className="text-muted-foreground">GSTIN: {customer.gstin}</p>
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
                    {isDetailsExpanded && (
                        <>
                            <Separator className="my-4" />
                            <div className="space-y-4 text-sm">
                                <div>
                                    <h4 className="font-semibold mb-1">Full Address</h4>
                                    <p className="text-muted-foreground">{`${customer.address.street}, ${customer.address.city}, ${customer.address.state} - ${customer.address.zip}`}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Bio</h4>
                                    <p className="text-muted-foreground italic">{customer.bio}</p>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <Tabs defaultValue="ledger">
                <TabsList>
                    <TabsTrigger value="ledger">Ledger</TabsTrigger>
                    <TabsTrigger value="invoice">Invoices</TabsTrigger>
                </TabsList>
                <TabsContent value="ledger">
                    <CustomerLedgerView customerLedgerData={allLedgerData} />
                </TabsContent>
                <TabsContent value="invoice">
                    <CustomerInvoiceView customerInvoices={customerInvoices} onAddPaymentClick={setPaymentInvoice} />
                </TabsContent>
            </Tabs>
            
            <AddPaymentDialog invoice={paymentInvoice} onPaymentAdd={() => setPaymentInvoice(null)} />
        </div>
    );
}


// --- Main Page Component ---
export default function CustomerPortfolioPage() {
    return (
        <Suspense fallback={<Loading />}>
            <CustomerPortfolioContent />
        </Suspense>
    );
}
