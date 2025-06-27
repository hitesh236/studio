import { SalesInvoicesTable } from "./sales-invoices-table";
import { generateSalesInvoices, SalesInvoice } from "./data";

export default function SalesInvoicesPage() {
  const data: SalesInvoice[] = generateSalesInvoices(50);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <SalesInvoicesTable data={data} />
    </div>
  );
}
