
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Printer } from 'lucide-react';
import Loading from '../loading';
import { PaymentVoucherTable } from './payment-voucher-table';
import { generatePayments, type PaymentVoucher } from './data';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { PaymentForm } from './payment-form';
import { staticCustomers, staticVendors } from '@/lib/customer-data';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const PrintableReceipt = React.forwardRef<HTMLDivElement, { voucher: PaymentVoucher }>(({ voucher }, ref) => {
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
                <p><strong>Amount in Words:</strong> Rupees One Thousand Two Hundred Fifty Only.</p>
            </div>
            <div className="mt-12 flex justify-between text-xs">
                <p>--------------------<br/>Receiver's Signature</p>
                <p>--------------------<br/>For Hicks Inc.</p>
            </div>
        </div>
    );
});
PrintableReceipt.displayName = 'PrintableReceipt';

export function PaymentsPageClient({ type }: { type: 'receipt' | 'payment' }) {
    const [vouchers, setVouchers] = React.useState<PaymentVoucher[] | null>(null);
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [lastVoucher, setLastVoucher] = React.useState<PaymentVoucher | null>(null);
    const [isReceiptOpen, setIsReceiptOpen] = React.useState(false);
    const printRef = React.useRef<HTMLDivElement>(null);

    const title = type === 'receipt' ? 'Receipts' : 'Payments';
    const description = type === 'receipt' ? 'Record all incoming payments from customers.' : 'Record all outgoing payments to vendors.';
    const buttonText = type === 'receipt' ? 'New Receipt Voucher' : 'New Payment Voucher';

    React.useEffect(() => {
        const data = generatePayments(20, type);
        setVouchers(data);
    }, [type]);
    
    const handlePrint = () => {
        const printContent = printRef.current;
        if (printContent) {
            const originalContents = document.body.innerHTML;
            const printContentsHTML = printContent.outerHTML;
            document.body.innerHTML = `<html><head><title>Print</title></head><body>${printContentsHTML}</body></html>`;
            window.print();
            document.body.innerHTML = originalContents;
            window.location.reload();
        }
    };


    const handleFormSuccess = (newVoucherData: any) => {
        const party = type === 'receipt' 
            ? staticCustomers.find(c => c.id === newVoucherData.partyId) 
            : staticVendors.find(v => v.id === newVoucherData.partyId);
        
        const totalAllocated = newVoucherData.allocations.reduce((sum: number, alloc: any) => sum + (alloc.allocatedAmount || 0), 0);
        
        const newVoucher: PaymentVoucher = {
            id: `V-${Date.now()}`,
            voucherNumber: `${type === 'receipt' ? 'RCPT' : 'PYMT'}-${new Date().getFullYear()}-${Math.floor(Math.random() * 900) + 100}`,
            date: new Date(newVoucherData.paymentDate),
            partyType: type === 'receipt' ? 'Customer' : 'Vendor',
            partyName: party?.company || 'Unknown',
            paymentMode: newVoucherData.paymentMode.charAt(0).toUpperCase() + newVoucherData.paymentMode.slice(1),
            amount: newVoucherData.totalAmountReceived,
            unallocatedAmount: newVoucherData.totalAmountReceived - totalAllocated,
            allocations: newVoucherData.allocations.filter((a: any) => a.allocatedAmount > 0).map((a: any) => ({
                invoiceId: a.invoiceNumber,
                allocatedAmount: a.allocatedAmount,
            })),
        };

        setVouchers(prev => prev ? [newVoucher, ...prev] : [newVoucher]);
        setLastVoucher(newVoucher);
        setIsFormOpen(false);
        setIsReceiptOpen(true);
    };

    if (!vouchers) {
        return <Loading />;
    }

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
                                  <PaymentForm type={type} onSuccess={handleFormSuccess} />
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    <PaymentVoucherTable data={vouchers} />
                </CardContent>
            </Card>
            
            <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Transaction Saved</DialogTitle>
                        <DialogDescription>The voucher has been created successfully.</DialogDescription>
                    </DialogHeader>
                    {lastVoucher && <PrintableReceipt ref={printRef} voucher={lastVoucher} />}
                    <DialogFooter>
                        <Button variant="outline" onClick={handlePrint}>
                            <Printer className="mr-2 h-4 w-4" /> Print
                        </Button>
                        <DialogClose asChild>
                            <Button>Close</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
