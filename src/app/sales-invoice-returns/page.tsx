
import { SalesInvoiceReturnsTable } from "./sales-invoice-returns-table";
import { generateSalesInvoiceReturns, SalesInvoice } from "./data";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from 'next/link';

export default function SalesInvoiceReturnsPage() {
  const data: SalesInvoice[] = generateSalesInvoiceReturns(50);

  return (
    <div data-section="main-content" className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-end mb-4">
        <Link href="/sales-invoice-returns/new" passHref>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Sales Return
          </Button>
        </Link>
      </div>
      <SalesInvoiceReturnsTable data={data} />
    </div>
  );
}
