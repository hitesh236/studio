
'use client';

import * as React from 'react';
import { CustomerTable } from "./customer-table";
import { generateCustomerData, type Customer } from "./data";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { AddCustomerForm } from './new/add-customer-form';

export default function CustomersPage() {
  const data: Customer[] = generateCustomerData();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <CustomerTable data={data} />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
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
                <Button className="rounded-full shadow-lg">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Customer
                </Button>
            </motion.div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-4xl p-0">
          <div className="max-h-[90vh] overflow-y-auto">
            <AddCustomerForm onSuccess={() => setIsDialogOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
