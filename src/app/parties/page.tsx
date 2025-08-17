
'use client';

import { HicksTableContainer } from "@/components/hicks-table/hicks-table-container";
import { generateData, Person } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from 'framer-motion';
import { SummaryCard } from "@/components/hicks-table/summary-card";
import { useMemo, useState, useEffect } from 'react';
import { formatCurrency } from "@/lib/utils";
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { AddPartyForm } from "./new/add-party-form";
import Loading from "../loading";

export default function PartiesPage() {
  const [data, setData] = useState<Person[]>([]);
  const [filter, setFilter] = useState<'all' | 'customer' | 'vendor'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    setData(generateData(500));
  }, []);

  const filteredData = useMemo(() => {
    if (filter === 'all') {
        return data;
    }
    return data.filter(party => party.type.toLowerCase() === filter);
  }, [data, filter]);

  const summaryStats = useMemo(() => {
    if (filteredData.length === 0) {
      return { totalParties: 0, toCollect: 0, toPay: 0 };
    }
    const totalParties = filteredData.length;
    let toCollect = 0;
    let toPay = 0;

    filteredData.forEach(party => {
        if (party.balance > 0) {
            toCollect += party.balance;
        } else if (party.balance < 0) {
            toPay += party.balance;
        }
    });

    return {
      totalParties,
      toCollect,
      toPay: Math.abs(toPay)
    };
  }, [filteredData]);
  
  if (data.length === 0) {
    return <Loading />;
  }

  return (
    <div data-section="main-content" className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
                <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>All Parties</Button>
                <Button variant={filter === 'customer' ? 'default' : 'outline'} onClick={() => setFilter('customer')}>Customers</Button>
                <Button variant={filter === 'vendor' ? 'default' : 'outline'} onClick={() => setFilter('vendor')}>Vendors</Button>
            </div>
             <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                      <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Party
                      </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-6xl p-0 bg-background">
                      <div className="max-h-[90vh] overflow-y-auto">
                        <AddPartyForm onSuccess={() => setIsDialogOpen(false)} />
                      </div>
                  </DialogContent>
                </Dialog>
            </motion.div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
             <SummaryCard
                icon={Users}
                title="All Parties"
                value={summaryStats.totalParties.toString()}
                variant="primary"
            />
             <SummaryCard
                icon={TrendingUp}
                title="To Collect"
                value={formatCurrency(summaryStats.toCollect, 'INR')}
            />
            <SummaryCard
                icon={TrendingDown}
                title="To Pay"
                value={formatCurrency(summaryStats.toPay, 'INR')}
            />
        </div>

      <HicksTableContainer data={filteredData} />
    </div>
  );
}
