import { CreditNoteForm } from './credit-note-form';
import { Suspense } from 'react';
import Loading from '@/app/loading';

export default function CreateSalesReturnPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Suspense fallback={<Loading />}>
        <CreditNoteForm />
      </Suspense>
    </div>
  );
}
