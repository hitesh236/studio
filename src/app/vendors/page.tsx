
'use client';

import { HicksTableContainer } from "@/components/hicks-table/hicks-table-container";
import { generateData, Person } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function VendorsPage() {
  const data: Person[] = generateData(500).filter(p => p.type === 'Vendor');

  return (
    <div data-section="main-content" className="p-4 sm:p-6 lg:p-8">
      <HicksTableContainer data={data} />

      <motion.div
        drag
        className="fixed bottom-8 right-8 z-50 cursor-grab active:cursor-grabbing"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
      >
        <motion.div
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "loop",
            }}
          >
          <Link href="/vendors/new" passHref>
            <Button className="rounded-full shadow-lg">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Vendor
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
