'use client';

import * as React from 'react';
import { JournalEntriesTable } from './journal-entries-table';
import { generateJournalEntries, type JournalEntry } from './data';
import Loading from '../loading';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

export default function JournalEntriesPage() {
    const [journalEntries, setJournalEntries] = React.useState<JournalEntry[] | null>(null);

    React.useEffect(() => {
        setJournalEntries(generateJournalEntries(200));
    }, []);

    if (!journalEntries) {
        return <Loading />;
    }

    return (
        <div data-section="main-content" className="p-4 sm:p-6 lg:p-8">
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle>All Entries</CardTitle>
                            <CardDescription>A record of all financial transactions.</CardDescription>
                        </div>
                        <Link href="/journal-entries/new" passHref>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                New Journal Entry
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    <JournalEntriesTable data={journalEntries} />
                </CardContent>
            </Card>
        </div>
    );
}
