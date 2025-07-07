'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Download, Printer, CreditCard } from "lucide-react";
import { InvoicePreview } from "./invoice-preview";
import { sampleInvoice, type SampleInvoice } from "./invoice-data";
import { Separator } from '@/components/ui/separator';
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
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';


const AddPaymentDialog = ({ invoice, isOpen, onOpenChange }: { invoice: typeof sampleInvoice, isOpen: boolean, onOpenChange: (open: boolean) => void }) => {
    const { toast } = useToast();
    const [amount, setAmount] = React.useState('');
    const [paymentMode, setPaymentMode] = React.useState('bank');

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

        if (parsedAmount > invoice.totals.amountDue) {
             toast({
                title: 'Invalid Amount',
                description: 'Payment cannot be more than the amount due.',
                variant: 'destructive',
            });
            return;
        }

        toast({
            title: "Payment Recorded",
            description: `Payment of ${formatCurrency(parsedAmount, 'INR')} has been recorded.`
        });
        onOpenChange(false);
        setAmount('');
    }

    React.useEffect(() => {
        if (!isOpen) {
            setAmount('');
            setPaymentMode('bank');
        } else {
            setAmount(invoice.totals.amountDue.toString());
        }
    }, [isOpen, invoice.totals.amountDue]);


    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Payment for {invoice.invoiceDetails.number}</DialogTitle>
                    <DialogDescription>
                        Current amount due is {formatCurrency(invoice.totals.amountDue, 'INR')}.
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


export default function InvoicePreviewPage() {
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = React.useState(false);

  const handlePrint = () => {
    window.print();
  };

  const isPaid = sampleInvoice.invoiceDetails.status === 'Paid';
  const { status } = sampleInvoice.invoiceDetails;

  const getStatusVariant = (status: SampleInvoice['invoiceDetails']['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case 'Paid': return 'default';
        case 'Partially Paid': return 'secondary';
        case 'Unpaid': return 'destructive';
        default: return 'outline';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 print:p-0">
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-center sm:text-left">Invoice Preview</h1>
          <Badge variant={getStatusVariant(status)} className="text-base">
            {status}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {!isPaid && (
            <Button onClick={() => setIsPaymentDialogOpen(true)}>
              <CreditCard className="mr-2 h-4 w-4" />
              Add Payment
            </Button>
          )}
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>
      <Separator className="mb-8 print:hidden" />
      <div className="max-w-4xl mx-auto bg-card p-0 sm:p-4 md:p-8 rounded-lg shadow-sm border print:shadow-none print:border-none print:rounded-none">
        <InvoicePreview invoice={sampleInvoice} />
      </div>

      <AddPaymentDialog 
            invoice={sampleInvoice}
            isOpen={isPaymentDialogOpen} 
            onOpenChange={setIsPaymentDialogOpen} 
      />
    </div>
  );
}
