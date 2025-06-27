import { HicksTableContainer } from "@/components/hicks-table/hicks-table-container";
import { generateData, Person } from "@/lib/data";

export default function TablePage() {
  const data: Person[] = generateData(2500);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <HicksTableContainer data={data} />
    </div>
  );
}
