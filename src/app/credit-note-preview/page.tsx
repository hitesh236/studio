
'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { CreditNotePreview } from "./credit-note-preview";
import type { SalesInvoice } from '../sales-invoices/data';
import { Separator } from '@/components/ui/separator';
import Loading from '../loading';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

const CreditNotePreviewPageContent = () => {
  const searchParams = useSearchParams();

  const creditNote = React.useMemo(() => {
    const dataString = searchParams.get('creditNoteData');
    if (!dataString) return null;
    try {
        const parsed = JSON.parse(decodeURIComponent(dataString));
        parsed.invoiceDate = new Date(parsed.invoiceDate);
        parsed.dueDate = new Date(parsed.dueDate);
        return parsed as SalesInvoice;
    } catch (error) {
        console.error("Failed to parse credit note data from URL, showing sample.", error);
        return null;
    }
  }, [searchParams]);

  const handlePrint = () => {
    window.print();
  };
  
  if (!creditNote) {
    return (
        <div className="flex h-full min-h-[calc(100vh-8rem)] items-center justify-center p-4">
            <div className="text-center">
                <h2 className="text-xl font-semibold">Could not load credit note data.</h2>
                <p className="text-muted-foreground">Please go back and try again.</p>
            </div>
        </div>
    );
  }

  return (
    <TooltipProvider>
      <div data-section="main-content" className="p-4 sm:p-6 lg:p-8 print:p-0">
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-center sm:text-left">Credit Note Preview</h1>
          </div>
          <div className="flex items-center gap-2">
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
          </div>
        </div>
        <Separator className="mb-8 print:hidden" />
        <div className="max-w-4xl mx-auto bg-card p-0 sm:p-4 md:p-8 rounded-lg shadow-sm border print:shadow-none print:border-none print:rounded-none">
          <CreditNotePreview creditNote={creditNote} />
        </div>
      </div>
    </TooltipProvider>
  );
}

export default function CreditNotePreviewPage() {
    return (
        <Suspense fallback={<Loading />}>
            <CreditNotePreviewPageContent />
        </Suspense>
    );
}

