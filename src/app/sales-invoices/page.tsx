import { SalesInvoicesTable } from "./sales-invoices-table";
import { generateData, Person } from "@/lib/data";

export default function SalesInvoicesPage() {
  const data: Person[] = generateData(500);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <SalesInvoicesTable data={data} />
    </div>
  );
}
