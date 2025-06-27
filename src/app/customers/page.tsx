
import { HicksTableContainer } from "@/components/hicks-table/hicks-table-container";
import { generateData, Person } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from 'next/link';

export default function CustomersPage() {
  const data: Person[] = generateData(500);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-end mb-4">
        <Link href="/customers/new" passHref>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </Link>
      </div>
      <HicksTableContainer data={data} />
    </div>
  );
}
