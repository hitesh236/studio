
import { LedgerView } from '../my-accounts/ledger-view';
import { ledgerData } from '@/lib/ledger-data';

export default function LedgersPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl">
      <LedgerView data={ledgerData} />
    </div>
  );
}
