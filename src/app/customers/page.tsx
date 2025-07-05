
'use client';

import { CustomerTable } from "./customer-table";
import { generateCustomerData, type Customer } from "./data";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CustomersPage() {
  const data: Customer[] = generateCustomerData();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <CustomerTable data={data} />

      <motion.div
        drag
        className="fixed bottom-8 right-8 z-50 cursor-grab active:cursor-grabbing"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.3,
        }}
      >
        <Button asChild className="rounded-full shadow-lg">
          <Link href="/customers/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Customer
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}
