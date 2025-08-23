
'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Loading from '../loading';
import { PaymentVoucherTable } from './payment-voucher-table';
import { generatePayments, type PaymentVoucher } from './data';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { PaymentForm } from './payment-form';

const PaymentsPageContent = () => {
    const searchParams = useSearchParams();
    const type = searchParams.get('type') || 'receipt'; // 'receipt' or 'payment'

    const [vouchers, setVouchers] = React.useState<PaymentVoucher[] | null>(null);
    const [isFormOpen, setIsFormOpen] = React.useState(false);

    const title = type === 'receipt' ? 'Receipts' : 'Payments';
    const description = type === 'receipt' ? 'Record all incoming payments from customers.' : 'Record all outgoing payments to vendors.';
    const buttonText = type === 'receipt' ? 'New Receipt Voucher' : 'New Payment Voucher';

    React.useEffect(() => {
        // In a real app, you'd fetch data based on the 'type'
        const data = generatePayments(20, type);
        setVouchers(data);
    }, [type]);

    if (!vouchers) {
        return <Loading />;
    }

    const handleFormSuccess = (newVoucher: any) => {
        // Add new voucher to list and close dialog
        setVouchers(prev => prev ? [newVoucher as PaymentVoucher, ...prev] : [newVoucher as PaymentVoucher]);
        setIsFormOpen(false);
    };

    return (
        <div data-section="main-content" className="p-4 sm:p-6 lg:p-8">
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle>{title}</CardTitle>
                            <CardDescription>{description}</CardDescription>
                        </div>
                        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    {buttonText}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                                <PaymentForm type={type} onSuccess={handleFormSuccess} />
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    <PaymentVoucherTable data={vouchers} />
                </CardContent>
            </Card>
        </div>
    );
};

export default function PaymentsPage() {
    return (
        <Suspense fallback={<Loading />}>
            <PaymentsPageContent />
        </Suspense>
    );
}
