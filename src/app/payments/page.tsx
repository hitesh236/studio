
'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Loading from '../loading';
import { PaymentsPageClient } from './payments-page-client';


export default function PaymentsPage() {
    const searchParams = useSearchParams();
    const type = searchParams.get('type') === 'payment' ? 'payment' : 'receipt';

    return (
        <Suspense fallback={<Loading />}>
            <PaymentsPageClient type={type} />
        </Suspense>
    );
}
