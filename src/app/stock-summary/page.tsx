
'use client';

import * as React from 'react';
import { StockSummaryReport } from './stock-summary-report';
import { generateStockSummaryData, type StockSummaryRow } from './data';
import { generateStockListData, type StockItem } from '@/app/stock-list/data';
import { generateStockHistory, type StockHistoryEntry } from '@/app/stock-history/data';
import Loading from '../loading';


export default function StockSummaryPage() {
    const [summaryData, setSummaryData] = React.useState<StockSummaryRow[] | null>(null);

    React.useEffect(() => {
        const stockItems = generateStockListData(50); 
        const stockHistory = generateStockHistory('all_products');
        const data = generateStockSummaryData(stockItems, stockHistory);
        setSummaryData(data);
    }, []);

    if (!summaryData) {
        return <Loading />;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <StockSummaryReport data={summaryData} />
        </div>
    );
}

