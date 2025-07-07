
'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { Invoice2 } from "./invoice";
import { invoiceData } from "./data";
import { Separator } from '@/components/ui/separator';

export default function Invoice2Page() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 sm:p-6 lg:p-8 print:p-0 print:bg-white">
      <header className="max-w-4xl mx-auto mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        <h1 className="text-2xl font-bold text-center sm:text-left">Invoice</h1>
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
      </header>
      <div className="bg-white dark:bg-card">
        <Invoice2 data={invoiceData} />
      </div>
    </div>
  );
}
