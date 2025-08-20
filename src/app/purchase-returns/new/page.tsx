
import { DebitNoteForm } from './debit-note-form';
import { Suspense } from 'react';
import Loading from '@/app/loading';

export default function CreatePurchaseReturnPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Suspense fallback={<Loading />}>
        <DebitNoteForm />
      </Suspense>
    </div>
  );
}
