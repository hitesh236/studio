
'use client';

import * as React from 'react';
import { JournalEntriesTable } from './journal-entries-table';
import { generateJournalEntries, type JournalEntry } from './data';
import Loading from '../loading';

export default function JournalEntriesPage() {
    const [journalEntries, setJournalEntries] = React.useState<JournalEntry[] | null>(null);

    React.useEffect(() => {
        setJournalEntries(generateJournalEntries(50));
    }, []);

    if (!journalEntries) {
        return <Loading />;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-5xl mx-auto">
                <JournalEntriesTable data={journalEntries} />
            </div>
        </div>
    );
}
