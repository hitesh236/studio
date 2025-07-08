
'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import {
  Mail, Phone, MapPin, ChevronDown, ChevronUp, Plus, CreditCard, FileText, FileWarning, TrendingUp, CircleDollarSign, Scale, Download, Calendar as CalendarIcon, MoreHorizontal
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import Loading from '../loading';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';

// --- Reusable Dialog Component ---
const AddPaymentDialog = ({ customer, isOpen, onOpenChange, onPaymentAdd, type }: { customer: Person, isOpen: boolean, onOpenChange: (open: boolean) => void, onPaymentAdd: (amount: number) => void, type: 'in' | 'out' | null }) => {
    const { toast } = useToast();
    const [amount, setAmount] = React.useState('');
    const [paymentMode, setPaymentMode] = React.useState('bank');
    const [reason, setReason] = React.useState('');

    const handleSave = () => {
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            toast({
                title: 'Invalid Amount',
                description: 'Please enter a valid payment amount.',
                variant: 'destructive',
            });
            return;
        }

        toast({
            title: `Payment ${type === 'in' ? 'Received' : 'Made'}`,
            description: `Payment of ${formatCurrency(parsedAmount, 'INR')} for ${customer.company} has been recorded.`
        });
        onPaymentAdd(parsedAmount);
        onOpenChange(false);
        setAmount('');
        setReason('');
    }

    React.useEffect(() => {
        if (!isOpen) {
            setAmount('');
            setPaymentMode('bank');
            setReason('');
        }
    }, [isOpen]);

    if (!customer || !type) return null;

    const title = type === 'in' ? `Add Payment In from ${customer.company}` : `Record Payment Out for ${customer.company}`;
    const description = type === 'in'
        ? "Record a payment received from this customer. This will be an on-account payment."
        : "Record a payment made to this customer or on their behalf.";

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
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
                            placeholder="Enter amount"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="payment-mode" className="text-right">Payment Mode</Label>
                        <Select onValueChange={setPaymentMode} defaultValue={paymentMode}>
                             <SelectTrigger id="payment-mode" className="col-span-3">
                                <SelectValue placeholder="Select a mode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="bank">Bank Transfer</SelectItem>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="upi">UPI</SelectItem>
                                <SelectItem value="cheque">Cheque</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {type === 'out' && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="reason" className="text-right">Reason</Label>
                            <Textarea
                                id="reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="col-span-3"
                                placeholder="Reason for payment out (e.g., refund, advance settlement)"
                            />
                        </div>
                    )}
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
const MobileInvoiceCard = ({ invoice }: {
    invoice: SalesInvoice;
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
        <Card>
            <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                    <div>
                        <Link href="/invoice-preview" className="font-semibold hover:underline">{invoice.invoiceNumber}</Link>
                        <p className="text-sm text-muted-foreground">{format(invoice.invoiceDate, 'dd-MMM-yyyy')}</p>
                    </div>
                     <Badge variant={getStatusVariant(invoice.paymentStatus)}>{invoice.paymentStatus}</Badge>
                </div>
                <div className="flex justify-between items-baseline">
                    <p className="text-sm text-muted-foreground">Amount Due</p>
                    <p className="text-lg font-mono text-destructive">{formatCurrency(invoice.amountDue, invoice.currencyCode)}</p>
                </div>
            </CardContent>
        </Card>
    )
}

// --- Invoice Tab Component ---
const CustomerInvoiceView = ({ customerInvoices }: { customerInvoices: SalesInvoice[] }) => {
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
                                    <TableHead>Invoice #</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-right">Amount Due</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {customerInvoices.length > 0 ? customerInvoices.map(invoice => (
                                    <TableRow key={invoice.id}>
                                        <TableCell className="font-medium">
                                            <Link href="/invoice-preview" className="hover:underline">{invoice.invoiceNumber}</Link>
                                        </TableCell>
                                        <TableCell>{format(invoice.invoiceDate, 'dd-MMM-yyyy')}</TableCell>
                                        <TableCell>{format(invoice.dueDate, 'dd-MMM-yyyy')}</TableCell>
                                        <TableCell className="text-right font-mono">{formatCurrency(invoice.amountBase, 'INR')}</TableCell>
                                        <TableCell className="text-right font-mono text-destructive">{formatCurrency(invoice.amountDue, 'INR')}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={getStatusVariant(invoice.paymentStatus)}>{invoice.paymentStatus}</Badge>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24">
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
    const [dialogType, setDialogType] = React.useState<'in' | 'out' | null>(null);

    const [allCustomers, setAllCustomers] = React.useState<Person[] | null>(null);
    const [allInvoices, setAllInvoices] = React.useState<SalesInvoice[] | null>(null);
    const [allLedgerData, setAllLedgerData] = React.useState<CustomerLedgerEntry[] | null>(null);

    React.useEffect(() => {
        setAllCustomers(generateData(50));
        setAllInvoices(generateSalesInvoices(50));
        setAllLedgerData(generateCustomerLedger(25));
    }, []);

    const customer = React.useMemo(() => {
        if (!allCustomers) return null;
        if (customerId) {
            return allCustomers.find(c => c.id === customerId) || allCustomers[0];
        }
        return allCustomers[0];
    }, [customerId, allCustomers]);
    
    const customerInvoices = React.useMemo(() => {
        if (!allInvoices || !customer) return [];
        return allInvoices.filter(inv => inv.customerName === customer.company);
    }, [allInvoices, customer]);
    
    if (!customer || !allLedgerData) {
        return <Loading />;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div 
                            className="flex items-center gap-4 cursor-pointer"
                            onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                        >
                            <Avatar className="h-16 w-16">
                            <AvatarImage src="https://placehold.co/64x64.png" alt={`${customer.firstName} ${customer.lastName}`} data-ai-hint="person avatar" />
                            <AvatarFallback>{customer.firstName.charAt(0)}{customer.lastName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                            <CardTitle className="text-2xl">{`${customer.firstName} ${customer.lastName}`}</CardTitle>
                            <CardDescription>{customer.company}</CardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button onClick={() => setDialogType('in')}><Plus className="mr-2 h-4 w-4" /> Payment In</Button>
                            <Button variant="destructive" onClick={() => setDialogType('out')}><Plus className="mr-2 h-4 w-4" /> Payment out</Button>
                            <Button variant="ghost" size="icon" onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}>
                                {isDetailsExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                <span className="sr-only">{isDetailsExpanded ? 'Collapse' : 'Expand'} details</span>
                            </Button>
                        </div>
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
                <TabsList className="bg-transparent p-0 justify-start gap-2 h-auto flex-wrap">
                    <TabsTrigger value="ledger" className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:border data-[state=inactive]:border-border data-[state=inactive]:bg-transparent">Ledger</TabsTrigger>
                    <TabsTrigger value="invoice" className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:border data-[state=inactive]:border-border data-[state=inactive]:bg-transparent">Invoices</TabsTrigger>
                </TabsList>
                <TabsContent value="ledger">
                    <CustomerLedgerView customerLedgerData={allLedgerData} />
                </TabsContent>
                <TabsContent value="invoice">
                    <CustomerInvoiceView customerInvoices={customerInvoices} />
                </TabsContent>
            </Tabs>
            
            <AddPaymentDialog 
                customer={customer} 
                isOpen={dialogType !== null}
                type={dialogType}
                onOpenChange={(open) => { if (!open) setDialogType(null) }} 
                onPaymentAdd={(amount) => {
                    // You would typically handle the state update here, e.g., refetching data
                    console.log(`Payment of ${amount} added.`);
                }} 
            />
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

    
