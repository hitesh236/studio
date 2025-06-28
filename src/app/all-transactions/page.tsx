import { JournalEntriesTable } from '@/app/journal-entries/journal-entries-table';
import { journalEntries } from '@/app/journal-entries/data';

export default function AllTransactionsPage() {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <JournalEntriesTable data={journalEntries} />
        </div>
    )
}
