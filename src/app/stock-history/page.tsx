
'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { StockHistoryView } from './stock-history-view';
import Loading from '../loading';
import { generateStockHistory, type StockHistoryEntry } from './data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const StockHistoryPageContent = () => {
    const searchParams = useSearchParams();
    const productName = searchParams.get('product') || 'Selected Product';
    const [history, setHistory] = React.useState<StockHistoryEntry[] | null>(null);
    const [viewMode, setViewMode] = React.useState<'all' | 'in' | 'out'>('all');

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
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-2xl">Stock History: {productName}</CardTitle>
                            <CardDescription>A detailed log of all stock movements for this item.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                     <div className="flex items-center gap-2 mb-4">
                        <Button variant={viewMode === 'all' ? 'default' : 'outline'} onClick={() => setViewMode('all')}>All Transactions</Button>
                        <Button variant={viewMode === 'in' ? 'default' : 'outline'} onClick={() => setViewMode('in')}>Stock In Only</Button>
                        <Button variant={viewMode === 'out' ? 'default' : 'outline'} onClick={() => setViewMode('out')}>Stock Out Only</Button>
                    </div>
                    <StockHistoryView data={history} viewMode={viewMode} />
                </CardContent>
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
