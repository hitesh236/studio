
'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Button } from "@/components/ui/button";
import { Download, Printer, CreditCard } from "lucide-react";
import { InvoicePreview } from "./invoice-preview";
import { sampleInvoice, type SampleInvoice } from "./invoice-data";
import type { SalesInvoice } from '../sales-invoices/data';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Loading from '../loading';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { PaymentForm } from '../payments/payment-form';

const InvoicePreviewPageContent = () => {
  const searchParams = useSearchParams();
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = React.useState(false);

  const invoice = React.useMemo(() => {
    const invoiceDataString = searchParams.get('invoiceData');
    if (!invoiceDataString) return null;
    try {
        const parsed = JSON.parse(decodeURIComponent(invoiceDataString));
        // Dates need to be converted back to Date objects
        parsed.invoiceDate = new Date(parsed.invoiceDate);
        parsed.dueDate = new Date(parsed.dueDate);
        return parsed as SalesInvoice;
    } catch (error) {
        console.error("Failed to parse invoice data from URL, showing sample.", error);
        return null;
    }
  }, [searchParams]);

  const handlePrint = () => {
    window.print();
  };
  
  const handlePaymentSuccess = () => {
    setIsPaymentDialogOpen(false);
    // Here you would typically refetch or update the invoice data
  };

  if (!invoice) {
    return (
        <div className="flex h-full min-h-[calc(100vh-8rem)] items-center justify-center p-4">
            <div className="text-center">
                <h2 className="text-xl font-semibold">Could not load invoice data.</h2>
                <p className="text-muted-foreground">Please go back and try again.</p>
            </div>
        </div>
    );
  }

  const isPaid = invoice.paymentStatus === 'Paid';
  const { status } = { status: invoice.paymentStatus };

  const getStatusVariant = (status: SalesInvoice['paymentStatus']): "default" | "secondary" | "destructive" | "outline" | "warning" => {
    switch (status) {
        case 'Paid': return 'default';
        case 'Partially Paid': return 'warning';
        case 'Unpaid': return 'destructive';
        case 'Outstanding': return 'outline';
        case 'Overdue': return 'destructive';
        default: return 'outline';
    }
  };

  return (
    <TooltipProvider>
      <div data-section="main-content" className="p-4 sm:p-6 lg:p-8 print:p-0">
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-center sm:text-left">Invoice Preview</h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusVariant(status)} className={cn(status === 'Partially Paid' && 'text-xs')}>
              {status}
            </Badge>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={handlePrint}>
                        <Printer className="h-4 w-4" />
                        <span className="sr-only">Print</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Print</p>
                </TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="outline" size="icon">
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download PDF</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Download PDF</p>
                </TooltipContent>
            </Tooltip>
            {!isPaid && (
              <Button onClick={() => setIsPaymentDialogOpen(true)}>
                <CreditCard className="mr-2 h-4 w-4" />
                Add Payment
              </Button>
            )}
          </div>
        </div>
        <Separator className="mb-8 print:hidden" />
        <div className="max-w-4xl mx-auto bg-card p-0 sm:p-4 md:p-8 rounded-lg shadow-sm border print:shadow-none print:border-none print:rounded-none">
          <InvoicePreview invoice={invoice} />
        </div>

        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
            <DialogContent className="max-w-4xl p-0">
                <div className="max-h-[90vh] overflow-y-auto p-6">
                    <PaymentForm 
                        type="receipt" 
                        onSuccess={handlePaymentSuccess}
                        initialData={{
                            partyId: invoice.customerName, // Pass customer name to match against party list
                            totalAmountReceived: invoice.amountDue,
                        }}
                    />
                </div>
            </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}

export default function InvoicePreviewPage() {
    return (
        <Suspense fallback={<Loading />}>
            <InvoicePreviewPageContent />
        </Suspense>
    );
}
