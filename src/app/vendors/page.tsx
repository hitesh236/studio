
'use client';

import { HicksTableContainer } from "@/components/hicks-table/hicks-table-container";
import { generateData, Person } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function VendorsPage() {
  const data: Person[] = generateData(500);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <HicksTableContainer data={data} />

      <motion.div
        className="fixed bottom-8 right-8 z-10"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.3,
        }}
      >
        <Link href="/vendors/new" passHref>
          <Button size="lg" className="rounded-full shadow-lg h-14 px-5">
            <PlusCircle className="mr-2 h-5 w-5" />
            Add Vendor
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
