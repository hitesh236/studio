
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Loading from '../loading';
import { PaymentVoucherTable } from './payment-voucher-table';
import { generatePayments, type PaymentVoucher } from './data';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { PaymentForm } from './payment-form';
import { staticCustomers, staticVendors } from '@/lib/customer-data';

export function PaymentsPageClient({ type }: { type: 'receipt' | 'payment' }) {
    const [vouchers, setVouchers] = React.useState<PaymentVoucher[] | null>(null);
    const [isFormOpen, setIsFormOpen] = React.useState(false);

    const title = type === 'receipt' ? 'Receipts' : 'Payments';
    const description = type === 'receipt' ? 'Record all incoming payments from customers.' : 'Record all outgoing payments to vendors.';
    const buttonText = type === 'receipt' ? 'New Receipt Voucher' : 'New Payment Voucher';

    React.useEffect(() => {
        // In a real app, you'd fetch data based on the 'type'
        const data = generatePayments(20, type as 'receipt' | 'payment');
        setVouchers(data);
    }, [type]);

    if (!vouchers) {
        return <Loading />;
    }

    const handleFormSuccess = (newVoucherData: any) => {
        const party = type === 'receipt' 
            ? staticCustomers.find(c => c.id === newVoucherData.partyId) 
            : staticVendors.find(v => v.id === newVoucherData.partyId);
        
        const totalAllocated = newVoucherData.allocations.reduce((sum: number, alloc: any) => sum + (alloc.allocatedAmount || 0), 0);
        
        const newVoucher: PaymentVoucher = {
            id: `V-${Date.now()}`,
            voucherNumber: `${type === 'receipt' ? 'RCPT' : 'PYMT'}-${new Date().getFullYear()}-${Math.floor(Math.random() * 900) + 100}`,
            date: new Date(newVoucherData.paymentDate), // Ensure it's a Date object
            partyType: type === 'receipt' ? 'Customer' : 'Vendor',
            partyName: party?.company || 'Unknown',
            paymentMode: newVoucherData.paymentMode,
            amount: newVoucherData.totalAmountReceived,
            unallocatedAmount: newVoucherData.totalAmountReceived - totalAllocated,
            allocations: newVoucherData.allocations.filter((a: any) => a.allocatedAmount > 0).map((a: any) => ({
                invoiceId: a.invoiceId,
                allocatedAmount: a.allocatedAmount,
            })),
        };

        // Add new voucher to list and close dialog
        setVouchers(prev => prev ? [newVoucher, ...prev] : [newVoucher]);
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
                            <DialogContent className="max-w-4xl p-0">
                                <div className="max-h-[90vh] overflow-y-auto p-6">
                                  <PaymentForm type={type as 'receipt' | 'payment'} onSuccess={handleFormSuccess} />
                                </div>
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
