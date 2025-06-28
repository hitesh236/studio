
'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Download, Printer, Globe } from "lucide-react";
import { InvoicePreviewFC } from "./invoice-preview-fc";
import { sampleInvoiceFC } from "./invoice-data-fc";
import { Separator } from '@/components/ui/separator';

export default function InvoicePreviewFCPage() {

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 print:p-0">
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-2">
            <Globe className="h-6 w-6" />
            <h1 className="text-2xl font-bold text-center sm:text-left">Foreign Currency Invoice</h1>
        </div>
        <div className="flex items-center gap-2">
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
        <InvoicePreviewFC invoice={sampleInvoiceFC} />
      </div>
    </div>
  );
}
