import { HicksTableContainer } from "@/components/hicks-table/hicks-table-container";
import { generateData, Person } from "@/lib/data";

export default function Home() {
  const data: Person[] = generateData(10000);

  return (
    <main className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <HicksTableContainer data={data} />
    </main>
  );
}
