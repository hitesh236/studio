
import { SalesInvoicesTable } from "./sales-invoices-table";
import { generateSalesInvoices, SalesInvoice } from "./data";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from 'next/link';

export default function SalesInvoicesPage() {
  const data: SalesInvoice[] = generateSalesInvoices(11);

  return (
    <div data-section="main-content" className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-end mb-4">
        <Link href="/sales-invoices/new" passHref>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        </Link>
      </div>
      <SalesInvoicesTable data={data} />
    </div>
  );
}
