
'use client';

import { HicksTableContainer } from "@/components/hicks-table/hicks-table-container";
import { generateData, Person } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, TrendingUp, TrendingDown } from "lucide-react";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { SummaryCard } from "@/components/hicks-table/summary-card";
import { useMemo } from 'react';
import { formatCurrency } from "@/lib/utils";

export default function PartiesPage() {
  const data: Person[] = generateData(500);

  const summaryStats = useMemo(() => {
    const totalParties = data.length;
    let toCollect = 0;
    let toPay = 0;

    data.forEach(party => {
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
  }, [data]);

  return (
    <div data-section="main-content" className="p-4 sm:p-6 lg:p-8 space-y-6">
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
                value={formatCurrency(summaryStats.toCollect)}
            />
            <SummaryCard
                icon={TrendingDown}
                title="To Pay"
                value={formatCurrency(summaryStats.toPay)}
            />
        </div>

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
          <Link href="/customers/new" passHref>
            <Button className="rounded-full shadow-lg">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Party
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
