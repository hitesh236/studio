
'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { StockHistoryView } from './stock-history-view';
import Loading from '../loading';
import { generateStockHistory, type StockHistoryEntry } from './data';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const StockHistoryPageContent = () => {
    const searchParams = useSearchParams();
    const productName = searchParams.get('product') || 'Selected Product';
    const [history, setHistory] = React.useState<StockHistoryEntry[] | null>(null);
    const [viewMode, setViewMode] = React.useState<'split' | 'combined'>('split');

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
                        <div className="flex items-center space-x-2">
                            <Label htmlFor="view-mode-toggle">Combined View</Label>
                            <Switch
                                id="view-mode-toggle"
                                checked={viewMode === 'combined'}
                                onCheckedChange={(checked) => setViewMode(checked ? 'combined' : 'split')}
                            />
                        </div>
                    </div>
                </CardHeader>
                <StockHistoryView data={history} viewMode={viewMode} />
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
