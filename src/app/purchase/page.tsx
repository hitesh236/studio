
'use client';

import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { generatePurchaseBills, PurchaseBill } from './data';
import { PurchaseTable } from './purchase-table';
import Loading from '../loading';

export default function PurchasePage() {
  const [bills, setBills] = React.useState<PurchaseBill[] | null>(null);

  React.useEffect(() => {
    setBills(generatePurchaseBills(11));
  }, []);

  if (!bills) {
    return <Loading />;
  }

  return (
    <div data-section="main-content" className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-end mb-4">
        <Link href="/purchase/new" passHref>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Purchase
          </Button>
        </Link>
      </div>
      <PurchaseTable data={bills} />
    </div>
  );
}
