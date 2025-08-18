
'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { StockHistoryView } from './stock-history-view';
import Loading from '../loading';
import { generateStockHistory, type StockHistoryEntry } from './data';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const StockHistoryPageContent = () => {
    const searchParams = useSearchParams();
    const productName = searchParams.get('product') || 'Selected Product';
    const [history, setHistory] = React.useState<StockHistoryEntry[] | null>(null);

    React.useEffect(() => {
        // In a real app, you'd fetch this based on the product ID/name
        const generatedHistory = generateStockHistory(productName);
        setHistory(generatedHistory);
    }, [productName]);

    if (!history) {
        return <Loading />;
    }

    return (
        <div data-section="main-content" className="p-4 sm:p-6 lg:p-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Stock History: {productName}</CardTitle>
                    <CardDescription>A detailed log of all stock movements for this item.</CardDescription>
                </CardHeader>
                <StockHistoryView data={history} />
            </Card>
        </div>
    );
}

export default function StockHistoryPage() {
    return (
        <Suspense fallback={<Loading />}>
            <StockHistoryPageContent />
        </Suspense>
    );
}

    