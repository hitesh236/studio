
'use client';

import * as React from 'react';
import { ReconciliationClient } from './reconciliation-client';
import { generateBankTransactions, generateBookTransactions } from './data';
import type { BankTransaction, BookTransaction } from './data';
import Loading from '../loading';

export default function BankReconciliationPage() {
    const [bankTransactions, setBankTransactions] = React.useState<BankTransaction[] | null>(null);
    const [bookTransactions, setBookTransactions] = React.useState<BookTransaction[] | null>(null);

    React.useEffect(() => {
        setBankTransactions(generateBankTransactions(25));
        setBookTransactions(generateBookTransactions(30));
    }, []);
    
    if (!bankTransactions || !bookTransactions) {
        return <Loading />;
    }

    return (
        <ReconciliationClient
            initialBankTransactions={bankTransactions}
            initialBookTransactions={bookTransactions}
        />
    );
}
