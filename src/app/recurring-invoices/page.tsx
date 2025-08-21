
'use client';

import * as React from 'react';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { RecurringInvoicesTable } from './recurring-invoices-table';
import { generateRecurringInvoices, RecurringInvoice } from './data';
import Loading from '../loading';
import useUserRole from '@/hooks/use-user-role';

export default function RecurringInvoicesPage() {
    const { role } = useUserRole();
    const canCreate = role === 'Admin' || role === 'Accountant';
    const [invoices, setInvoices] = React.useState<RecurringInvoice[] | null>(null);

    React.useEffect(() => {
        setInvoices(generateRecurringInvoices(15));
    }, []);

    if (!invoices) {
        return <Loading />;
    }

    return (
        <div data-section="main-content" className="p-4 sm:p-6 lg:p-8">
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Recurring Invoices</CardTitle>
                            <CardDescription>Manage your invoice templates and schedules.</CardDescription>
                        </div>
                        {canCreate && (
                            <Link href="/recurring-invoices/new" passHref>
                                <Button>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    New Recurring Invoice
                                </Button>
                            </Link>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <RecurringInvoicesTable data={invoices} />
                </CardContent>
            </Card>
        </div>
    );
}
