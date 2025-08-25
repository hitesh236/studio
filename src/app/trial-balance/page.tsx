
'use client';

import * as React from 'react';
import { TrialBalanceView } from './trial-balance-view';
import { generateTrialBalanceData } from './data';
import type { TrialBalanceRow } from './data';
import Loading from '../loading';

export default function TrialBalancePage() {
    const [data, setData] = React.useState<TrialBalanceRow[] | null>(null);

    React.useEffect(() => {
        setData(generateTrialBalanceData());
    }, []);

    if (!data) {
        return <Loading />;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <TrialBalanceView data={data} />
        </div>
    );
}
