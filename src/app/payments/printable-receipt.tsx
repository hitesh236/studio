'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { formatCurrency, numberToWords } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import type { PaymentVoucher } from './data';

export const PrintableReceipt = React.forwardRef<HTMLDivElement, { voucher: PaymentVoucher }>(({ voucher }, ref) => {
    return (
        <div ref={ref} className="p-4 font-sans text-sm text-black bg-white">
            <div className="text-center space-y-1 mb-4">
                <h2 className="text-lg font-bold">Hicks Inc.</h2>
                <p className="text-xs">123 Business Rd, Financial District, Mumbai, Maharashtra, 400001</p>
                <h3 className="text-md font-semibold pt-2">{voucher.partyType === 'Customer' ? 'Payment Receipt' : 'Payment Voucher'}</h3>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                <div><strong>Voucher No:</strong> {voucher.voucherNumber}</div>
                <div className="text-right"><strong>Date:</strong> {format(voucher.date, 'dd-MMM-yyyy')}</div>
                <div><strong>{voucher.partyType === 'Customer' ? 'Received From:' : 'Paid To:'}</strong> {voucher.partyName}</div>
                <div className="text-right"><strong>Payment Mode:</strong> {voucher.paymentMode}</div>
            </div>
            <Separator className="my-2" />
            <div className="text-center font-bold text-lg my-2">
                {formatCurrency(voucher.amount, 'INR')}
            </div>
            <Separator className="my-2" />
            {voucher.allocations.length > 0 && (
                 <div className="text-xs">
                    <p className="font-semibold mb-1">Against Bill(s):</p>
                    <ul className="list-disc pl-4">
                        {voucher.allocations.map(alloc => (
                            <li key={alloc.invoiceId}>{alloc.invoiceId} - {formatCurrency(alloc.allocatedAmount, 'INR')}</li>
                        ))}
                    </ul>
                </div>
            )}
             {voucher.unallocatedAmount > 0 && (
                 <div className="text-xs mt-2">
                    <p><strong>On Account:</strong> {formatCurrency(voucher.unallocatedAmount, 'INR')}</p>
                 </div>
            )}
            <div className="text-xs mt-4">
                <p><strong>Amount in Words:</strong> {numberToWords(voucher.amount)}.</p>
            </div>
            <div className="mt-12 flex justify-between text-xs">
                <p>--------------------<br/>Receiver's Signature</p>
                <p>--------------------<br/>For Hicks Inc.</p>
            </div>
        </div>
    );
});
PrintableReceipt.displayName = 'PrintableReceipt';