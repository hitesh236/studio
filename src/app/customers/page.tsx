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
        <Link href="/customers/new" passHref>
          <Button size="lg" className="rounded-full shadow-lg h-14 px-5">
            <PlusCircle className="mr-2 h-5 w-5" />
            Add Customer
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
