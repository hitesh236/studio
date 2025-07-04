'use client';

import * as React from 'react';
import { JournalEntriesTable } from '@/app/journal-entries/journal-entries-table';
import { generateJournalEntries, type JournalEntry } from '@/app/journal-entries/data';
import Loading from '../loading';

export default function AllTransactionsPage() {
    const [journalEntries, setJournalEntries] = React.useState<JournalEntry[] | null>(null);

    React.useEffect(() => {
        setJournalEntries(generateJournalEntries(50));
    }, []);

    if (!journalEntries) {
        return <Loading />;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <JournalEntriesTable data={journalEntries} />
        </div>
    );
}
