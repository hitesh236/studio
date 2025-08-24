
'use client';

import * as React from 'react';
import type { PurchaseBill } from '../purchase/data';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { cn, formatCurrency, numberToWords } from '@/lib/utils';


interface PurchaseBillPreviewProps {
  bill: PurchaseBill;
}

export function PurchaseBillPreview({ bill }: PurchaseBillPreviewProps) {
    const { vendorName, items } = bill;
    const buyer = { // Assuming buyer is always Hicks Inc.
        name: 'Hicks Inc.',
        address: '123 Business Rd, Financial District, Mumbai, Maharashtra, 400001',
        gstin: '27ABCDE1234F1Z5',
        state: 'Maharashtra',
    };

    const totals = {
        subtotal: items.reduce((acc, item) => acc + item.quantity * item.rate, 0),
        igst: 0, // Simplified for now
        cgst: 0,
        sgst: 0,
        grandTotal: bill.amount,
    };
    
    // Simplified GST calculation
    const isIntraState = bill.vendorName.includes(buyer.state); // A simple check
    const totalGst = totals.grandTotal - totals.subtotal;
    if (isIntraState) {
        totals.cgst = totalGst / 2;
        totals.sgst = totalGst / 2;
    } else {
        totals.igst = totalGst;
    }


    return (
        <Card className="p-8 print:p-2 shadow-none border-none print:text-[10px]">
            {/* Header */}
            <header className="flex justify-between items-start mb-6 print:mb-3">
                <div className="flex items-center gap-4 print:gap-2">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="h-16 w-16 print:h-8 print:w-8">
                        <rect width="256" height="256" fill="none"></rect>
                        <path d="M42.4,188.4,74.8,93.2a15.9,15.9,0,0,1,15.1-10.8h76.2a15.9,15.9,0,0,1,15.1,10.8l32.4,95.2a16,16,0,0,1-15.1,21.2H57.5A16,16,0,0,1,42.4,188.4Z" opacity="0.2"></path>
                        <path d="M42.4,188.4,74.8,93.2a15.9,15.9,0,0,1,15.1-10.8h76.2a15.9,15.9,0,0,1,15.1,10.8l32.4,95.2a16,16,0,0,1-15.1,21.2H57.5A16,16,0,0,1,42.4,188.4Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path><line x1="128" y1="40" x2="128" y2="82.4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line>
                    </svg>
                    <div>
                        <h1 className="text-3xl print:text-lg font-bold">{vendorName}</h1>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-4xl print:text-xl font-bold tracking-tight uppercase text-primary">Purchase Bill</h2>
                    <div className="mt-2 space-y-1 print:text-xs text-sm">
                        <p><strong>Bill No:</strong> {bill.billNumber}</p>
                        <p><strong>Bill Date:</strong> {format(new Date(bill.billDate), 'PPP')}</p>
                        <p><strong>Due Date:</strong> {format(new Date(bill.dueDate), 'PPP')}</p>
                    </div>
                </div>
            </header>
            
            <Separator className="my-6 print:my-3" />

            <section className="grid grid-cols-2 gap-8 print:gap-4 text-sm print:text-xs">
                <div>
                    <h3 className="font-semibold mb-2 print:mb-1">Bill To:</h3>
                    <p className="font-bold">{buyer.name}</p>
                    <p>{buyer.address}</p>
                    {buyer.gstin && <p>GSTIN: <span className="font-mono">{buyer.gstin}</span></p>}
                </div>
            </section>

            {/* Items Table */}
            <section className="mt-8 print:mt-4">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12 text-center print:h-auto print:py-1 print:px-2">#</TableHead>
                            <TableHead className="print:h-auto print:py-1 print:px-2">Item Description</TableHead>
                            <TableHead className="text-right print:h-auto print:py-1 print:px-2">Qty</TableHead>
                            <TableHead className="text-right print:h-auto print:py-1 print:px-2">Rate</TableHead>
                            <TableHead className="text-right print:h-auto print:py-1 print:px-2">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item, index) => (
                            <TableRow key={item.id}>
                                <TableCell className="text-center print:py-1 print:px-2">{index + 1}</TableCell>
                                <TableCell className="print:py-1 print:px-2">
                                    <p className="font-medium">{item.name}</p>
                                </TableCell>
                                <TableCell className="text-right print:py-1 print:px-2">{item.quantity}</TableCell>
                                <TableCell className="text-right font-mono print:py-1 print:px-2">{formatCurrency(item.rate, 'INR')}</TableCell>
                                <TableCell className="text-right font-mono print:py-1 print:px-2">{formatCurrency(item.quantity * item.rate, 'INR')}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </section>
            
            <Separator className="my-6 print:my-3" />

            {/* Totals Section */}
            <section className="flex justify-end items-start gap-8 print:gap-4">
                 <div className="w-full max-w-sm space-y-2 print:text-xs">
                    <div className="flex justify-between"><span className="text-muted-foreground">Subtotal:</span><span className="font-mono">{formatCurrency(totals.subtotal, 'INR')}</span></div>
                    {isIntraState ? (
                        <>
                            <div className="flex justify-between"><span className="text-muted-foreground">CGST:</span><span className="font-mono">{formatCurrency(totals.cgst, 'INR')}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">SGST:</span><span className="font-mono">{formatCurrency(totals.sgst, 'INR')}</span></div>
                        </>
                    ) : (
                        <div className="flex justify-between"><span className="text-muted-foreground">IGST:</span><span className="font-mono">{formatCurrency(totals.igst, 'INR')}</span></div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold text-lg"><span className="print:text-sm">Total Amount:</span><span className="font-mono">{formatCurrency(totals.grandTotal, 'INR')}</span></div>
                </div>
            </section>
        </Card>
    );
}
