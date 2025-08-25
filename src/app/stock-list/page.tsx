
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import Loading from '../loading';
import { generateStockListData, type StockItem } from './data';
import { StockListTable } from './stock-list-table';

export default function StockListPage() {
    const [stockItems, setStockItems] = React.useState<StockItem[] | null>(null);

    React.useEffect(() => {
        const items = generateStockListData(150); // Increased data for better demo
        setStockItems(items);
    }, []);

    if (!stockItems) {
        return <Loading />;
    }

    return (
        <div data-section="main-content" className="p-4 sm:p-6 lg:p-8">
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Stock List</CardTitle>
                            <CardDescription>View and manage your product inventory.</CardDescription>
                        </div>
                        <Link href="/products/new" passHref>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add New Product
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    <StockListTable data={stockItems} />
                </CardContent>
            </Card>
        </div>
    );
}
