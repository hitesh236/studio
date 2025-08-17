
'use client';

import * as React from 'react';
import { HicksTableContainer } from "@/components/hicks-table/hicks-table-container";
import { generateCustomerData } from "./data";
import { generateData, Person } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { AddCustomerForm } from './new/add-customer-form';
import Loading from '../loading';

export default function CustomersPage() {
  const [data, setData] = React.useState<Person[] | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  React.useEffect(() => {
    const customerData = generateCustomerData();
    const transformedCustomerData: Person[] = customerData.map(c => ({
        id: c.id,
        firstName: c.name.split(' ')[0],
        lastName: c.name.split(' ').slice(1).join(' '),
        email: c.contact.email || '',
        company: c.company || c.name,
        phone: c.contact.phone || '',
        balance: c.balanceDue,
        status: 'Active', // Default status, as Customer type does not have it
        type: 'Customer',
        saleAmount: c.balanceDue > 0 ? c.balanceDue : Math.random() * 10000,
        rating: Math.round((Math.random() * 4 + 1) * 10) / 10,
        address: {
            street: c.placeOfSupply.state, // Simplified mapping
            city: c.placeOfSupply.state,
            state: c.placeOfSupply.state,
            zip: ''
        },
        bio: 'Customer from customer data.',
        gstin: c.gstin,
    }));
    setData(transformedCustomerData);
  }, []);

  if (!data) {
    return <Loading />;
  }

  return (
    <div data-section="main-content" className="p-4 sm:p-6 lg:p-8">
      <HicksTableContainer data={data} />

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
