
'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Button } from "@/components/ui/button";
import { Download, Printer, CreditCard } from "lucide-react";
import { InvoicePreview } from "./invoice-preview";
import { sampleInvoice, type SampleInvoice } from "./invoice-data";
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

  const invoiceDataString = searchParams.get('invoiceData');
  const invoice = React.useMemo(() => {
    if (!invoiceDataString) return sampleInvoice;
    try {
        const parsed = JSON.parse(decodeURIComponent(invoiceDataString));
        // Dates need to be converted back to Date objects
        parsed.invoiceDetails.date = new Date(parsed.invoiceDetails.date);
        parsed.invoiceDetails.dueDate = new Date(parsed.invoiceDetails.dueDate);
        return parsed as SampleInvoice;
    } catch (error) {
        console.error("Failed to parse invoice data from URL, showing sample.", error);
        return sampleInvoice;
    }
  }, [invoiceDataString]);

  const handlePrint = () => {
    window.print();
  };
  
  const handlePaymentSuccess = () => {
    setIsPaymentDialogOpen(false);
    // Here you would typically refetch or update the invoice data
  };

  const isPaid = invoice.invoiceDetails.status === 'Paid';
  const { status } = invoice.invoiceDetails;

  const getStatusVariant = (status: SampleInvoice['invoiceDetails']['status']): "default" | "secondary" | "destructive" | "outline" | "warning" => {
    switch (status) {
        case 'Paid': return 'default';
        case 'Partially Paid': return 'warning';
        case 'Unpaid': return 'destructive';
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
                        // Pass initial data to pre-fill the form
                        initialData={{
                            partyId: invoice.id, // Assuming invoice ID can map to a customer ID
                            totalAmountReceived: invoice.totals.amountDue,
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
