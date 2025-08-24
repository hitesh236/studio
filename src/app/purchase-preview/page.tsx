
'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { PurchaseBillPreview } from "./purchase-bill-preview";
import type { PurchaseBill } from "../purchase/data";
import { Separator } from '@/components/ui/separator';
import Loading from '../loading';

const PurchasePreviewPageContent = () => {
  const searchParams = useSearchParams();

  const bill = React.useMemo(() => {
    const billDataString = searchParams.get('billData');
    if (!billDataString) return null;
    try {
        const parsed = JSON.parse(decodeURIComponent(billDataString));
        // Dates need to be converted back to Date objects
        parsed.billDate = new Date(parsed.billDate);
        parsed.dueDate = new Date(parsed.dueDate);
        return parsed as PurchaseBill;
    } catch (error) {
        console.error("Failed to parse bill data from URL.", error);
        return null;
    }
  }, [searchParams]);

  const handlePrint = () => {
    window.print();
  };
  
  if (!bill) {
    return (
        <div className="flex h-full min-h-[calc(100vh-8rem)] items-center justify-center p-4">
            <div className="text-center">
                <h2 className="text-xl font-semibold">Could not load bill data.</h2>
                <p className="text-muted-foreground">Please go back and try again.</p>
            </div>
        </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 print:p-0">
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        <h1 className="text-2xl font-bold text-center sm:text-left">Purchase Bill Preview</h1>
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
        <PurchaseBillPreview bill={bill} />
      </div>
    </div>
  );
}

export default function PurchasePreviewPage() {
    return (
        <Suspense fallback={<Loading />}>
            <PurchasePreviewPageContent />
        </Suspense>
    )
}
