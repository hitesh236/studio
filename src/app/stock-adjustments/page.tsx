
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import Loading from '../loading';
import { generateStockAdjustments, type StockAdjustment } from './data';
import { StockAdjustmentsTable } from './stock-adjustments-table';

export default function StockAdjustmentsPage() {
    const [adjustments, setAdjustments] = React.useState<StockAdjustment[] | null>(null);

    React.useEffect(() => {
        setAdjustments(generateStockAdjustments(25));
    }, []);

    if (!adjustments) {
        return <Loading />;
    }

    return (
        <div data-section="main-content" className="p-4 sm:p-6 lg:p-8">
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Stock Adjustments</CardTitle>
                            <CardDescription>A log of all manual stock changes.</CardDescription>
                        </div>
                        <Link href="/stock-adjustments/new" passHref>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Adjustment
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    <StockAdjustmentsTable data={adjustments} />
                </CardContent>
            </Card>
        </div>
    );
}
