
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function StockPurchasePage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/purchase/new');
    }, [router]);

    return null; // or a loading spinner
}
