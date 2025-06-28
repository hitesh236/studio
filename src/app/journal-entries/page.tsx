
import { JournalEntriesTable } from './journal-entries-table';
import { journalEntries } from './data';

export default function JournalEntriesPage() {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <JournalEntriesTable data={journalEntries} />
        </div>
    )
}
