import { CustomerTable } from "@/app/sales-invoices/customer-table";
import { generateData, Person } from "@/lib/data";

export default function CustomersPage() {
  const data: Person[] = generateData(20);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <CustomerTable data={data} />
    </div>
  );
}
