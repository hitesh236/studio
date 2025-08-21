
import { StockTransferForm } from './stock-transfer-form';
import { Suspense } from 'react';
import Loading from '@/app/loading';

export default function NewStockTransferPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Suspense fallback={<Loading />}>
        <StockTransferForm />
      </Suspense>
    </div>
  );
}
