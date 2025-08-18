
'use client';

import * as React from 'react';
import { CustomerTable } from './customer-table';
import { generateCustomerData, type Customer } from './data';
import Loading from '../loading';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function CustomersPage() {
    const [customers, setCustomers] = React.useState<Customer[] | null>(null);

    React.useEffect(() => {
        setCustomers(generateCustomerData());
    }, []);

    if (!customers) {
        return <Loading />;
    }

    return (
        <div data-section="main-content" className="p-4 sm:p-6 lg:p-8">
            <div className="flex justify-end mb-4">
                <Button asChild>
                    <Link href="/customers/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Customer
                    </Link>
                </Button>
            </div>
            <CustomerTable data={customers} />
        </div>
    );
}
