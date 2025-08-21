
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import Loading from '../loading';
import { generateStockTransfers, type StockTransfer } from './data';
import { StockTransferTable } from './stock-transfer-table';

export default function StockTransferPage() {
    const [transfers, setTransfers] = React.useState<StockTransfer[] | null>(null);

    React.useEffect(() => {
        setTransfers(generateStockTransfers(30));
    }, []);

    if (!transfers) {
        return <Loading />;
    }

    return (
        <div data-section="main-content" className="p-4 sm:p-6 lg:p-8">
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Stock Transfers</CardTitle>
                            <CardDescription>A log of all stock movements between locations.</CardDescription>
                        </div>
                        <Link href="/stock-transfer/new" passHref>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Transfer
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    <StockTransferTable data={transfers} />
                </CardContent>
            </Card>
        </div>
    );
}
