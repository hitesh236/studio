
'use client';

import * as React from 'react';
import { SalesInvoicesTable } from "./sales-invoices-table";
import { generateSalesInvoices, SalesInvoice } from "./data";
import { Button } from "@/components/ui/button";
import { ChevronDown, PlusCircle } from "lucide-react";
import Link from 'next/link';
import Loading from '../loading';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

export default function SalesInvoicesPage() {
  const [data, setData] = React.useState<SalesInvoice[] | null>(null);

  React.useEffect(() => {
    setData(generateSalesInvoices(100));
  }, []);

  if (!data) {
    return <Loading />;
  }

  return (
    <div data-section="main-content" className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-end mb-4">
        <DropdownMenu>
            <div className="flex rounded-md shadow-sm">
                <Button asChild className="rounded-r-none">
                    <Link href="/sales-invoices/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Invoice
                    </Link>
                </Button>
                <DropdownMenuTrigger asChild>
                    <Button variant="default" size="icon" className="rounded-l-none border-l">
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
            </div>
            <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                    <Link href="/sales-invoices/new">New Regular Invoice</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/recurring-invoices/new">New Recurring Invoice</Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <SalesInvoicesTable data={data} />
    </div>
  );
}
