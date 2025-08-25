
'use client';

import * as React from 'react';
import { TrialBalanceView } from './trial-balance-view';
import { generateTrialBalanceData } from './data';
import type { TrialBalanceRow } from './data';
import Loading from '../loading';

export default function TrialBalancePage() {
    const [data, setData] = React.useState<TrialBalanceRow[] | null>(null);

    // This would typically fetch data based on a date range, 
    // but for now, we generate it once.
    React.useEffect(() => {
        const defaultDateRange = { from: new Date(2024, 0, 1), to: new Date() };
        setData(generateTrialBalanceData(defaultDateRange));
    }, []);

    if (!data) {
        return <Loading />;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <TrialBalanceView initialData={data} />
        </div>
    );
}
