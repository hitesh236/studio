
'use client';

import * as React from 'react';
import type { SampleInvoice } from './invoice-data';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { cn, formatCurrency, numberToWords } from '@/lib/utils';


interface InvoicePreviewProps {
  invoice: SampleInvoice;
}

export function InvoicePreview({ invoice }: InvoicePreviewProps) {
    const { seller, buyer, invoiceDetails, items, totals, bankDetails, terms } = invoice;

    const isIntraState = seller.state === buyer.placeOfSupply;

    // GST Breakdown Logic
    const gstBreakdown = React.useMemo(() => {
        const breakdown: Record<string, {
            hsn: string;
            taxableValue: number;
            gstRate: number;
            igst: number;
            cgst: number;
            sgst: number;
            totalTax: number;
        }> = {};

        items.forEach(item => {
            const { hsn, quantity, rate, gstRate } = item;
            const taxableAmount = quantity * rate;
            const gstAmount = taxableAmount * (gstRate / 100);

            if (!breakdown[hsn]) {
                breakdown[hsn] = {
                    hsn: hsn,
                    taxableValue: 0,
                    gstRate: gstRate, // Assuming HSN has one rate
                    igst: 0,
                    cgst: 0,
                    sgst: 0,
                    totalTax: 0
                };
            }

            breakdown[hsn].taxableValue += taxableAmount;
            breakdown[hsn].totalTax += gstAmount;

            if (isIntraState) {
                breakdown[hsn].cgst += gstAmount / 2;
                breakdown[hsn].sgst += gstAmount / 2;
            } else {
                breakdown[hsn].igst += gstAmount;
            }
        });
        return Object.values(breakdown);
    }, [items, isIntraState]);

    const breakdownTotals = React.useMemo(() => {
        return gstBreakdown.reduce((acc, item) => {
            acc.taxableValue += item.taxableValue;
            acc.igst += item.igst;
            acc.cgst += item.cgst;
            acc.sgst += item.sgst;
            acc.totalTax += item.totalTax;
            return acc;
        }, { taxableValue: 0, igst: 0, cgst: 0, sgst: 0, totalTax: 0 });
    }, [gstBreakdown]);


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
                        <h1 className="text-3xl print:text-[10px] font-bold">{seller.name}</h1>
                        <p className="text-sm print:text-[10px] text-muted-foreground max-w-xs">{seller.address}</p>
                        <p className="text-sm print:text-[10px] text-muted-foreground">GSTIN: <span className="font-mono">{seller.gstin}</span></p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-4xl print:text-[10px] font-bold tracking-tight uppercase text-primary">Tax Invoice</h2>
                    <div className="mt-2 space-y-1 print:text-[10px] text-sm">
                        <p><strong>Invoice No:</strong> {invoiceDetails.number}</p>
                        <p><strong>Invoice Date:</strong> {format(invoiceDetails.date, 'PPP')}</p>
                        <p><strong>Place of Supply:</strong> {buyer.placeOfSupply}</p>
                        <p><strong>Due Date:</strong> {format(invoiceDetails.dueDate, 'PPP')}</p>
                    </div>
                </div>
            </header>
            
            <Separator className="my-6 print:my-3" />

            {/* Seller & Buyer Details */}
            <section className="grid grid-cols-2 gap-8 print:gap-4 text-sm print:text-[10px]">
                <div>
                    <h3 className="font-semibold mb-2 print:mb-1 print:text-[10px]">Bill To:</h3>
                    <p className="font-bold print:text-[10px]">{buyer.name}</p>
                    <p className="print:text-[10px]">{buyer.billingAddress}</p>
                    {buyer.gstin && <p className="print:text-[10px]">GSTIN: <span className="font-mono">{buyer.gstin}</span></p>}
                </div>
                <div>
                    <h3 className="font-semibold mb-2 print:mb-1 print:text-[10px]">Ship To:</h3>
                    <p className="font-bold print:text-[10px]">{buyer.name}</p>
                    <p className="print:text-[10px]">{buyer.shippingAddress}</p>
                </div>
            </section>

            {/* Items Table */}
            <section className="mt-8 print:mt-4">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-12 text-center print:h-auto print:py-1 print:px-2 print:text-[10px]">#</TableHead>
                            <TableHead className="print:h-auto print:py-1 print:px-2 print:text-[10px]">Item & Description</TableHead>
                            <TableHead className="text-center print:h-auto print:py-1 print:px-2 print:text-[10px]">HSN</TableHead>
                            <TableHead className="text-right print:h-auto print:py-1 print:px-2 print:text-[10px]">Qty</TableHead>
                            <TableHead className="text-right print:h-auto print:py-1 print:px-2 print:text-[10px]">Rate</TableHead>
                            <TableHead className="text-right print:h-auto print:py-1 print:px-2 print:text-[10px]">GST</TableHead>
                            <TableHead className="text-right print:h-auto print:py-1 print:px-2 print:text-[10px]">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item, index) => {
                            const taxableAmount = item.quantity * item.rate;
                            const gstAmount = taxableAmount * (item.gstRate / 100);
                            const totalAmount = taxableAmount + gstAmount;
                            return (
                                <TableRow key={item.id}>
                                    <TableCell className="text-center print:py-1 print:px-2 print:text-[10px]">{index + 1}</TableCell>
                                    <TableCell className="print:py-1 print:px-2 print:text-[10px]">
                                        <p className="font-medium print:text-[10px]">{item.name}</p>
                                    </TableCell>
                                    <TableCell className="text-center print:py-1 print:px-2 print:text-[10px]">{item.hsn}</TableCell>
                                    <TableCell className="text-right print:py-1 print:px-2 print:text-[10px]">{item.quantity} {item.unit}</TableCell>
                                    <TableCell className="text-right font-mono print:py-1 print:px-2 print:text-[10px]">{formatCurrency(item.rate, 'INR')}</TableCell>
                                    <TableCell className="text-right font-mono print:py-1 print:px-2 print:text-[10px]">{item.gstRate}%</TableCell>
                                    <TableCell className="text-right font-mono print:py-1 print:px-2 print:text-[10px]">{formatCurrency(totalAmount, 'INR')}</TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </section>
            
            <Separator className="my-6 print:my-3" />

            {/* Totals Section */}
            <section className="flex justify-between items-start gap-8 print:gap-4">
                <div className="flex-1 space-y-2 print:text-[10px]">
                     <h4 className="font-semibold print:text-[10px]">Amount in Words:</h4>
                    <p className="text-muted-foreground print:text-[10px]">{numberToWords(totals.grandTotal)}</p>
                </div>
                 <div className="w-full max-w-sm space-y-2 print:text-[10px]">
                    <div className="flex justify-between print:text-[10px]"><span className="text-muted-foreground print:text-[10px]">Subtotal:</span><span className="font-mono print:text-[10px]">{formatCurrency(totals.subtotal, 'INR')}</span></div>
                    {isIntraState ? (
                        <>
                            <div className="flex justify-between print:text-[10px]"><span className="text-muted-foreground print:text-[10px]">CGST:</span><span className="font-mono print:text-[10px]">{formatCurrency(totals.cgst, 'INR')}</span></div>
                            <div className="flex justify-between print:text-[10px]"><span className="text-muted-foreground print:text-[10px]">SGST:</span><span className="font-mono print:text-[10px]">{formatCurrency(totals.sgst, 'INR')}</span></div>
                        </>
                    ) : (
                        <div className="flex justify-between print:text-[10px]"><span className="text-muted-foreground print:text-[10px]">IGST:</span><span className="font-mono print:text-[10px]">{formatCurrency(totals.igst, 'INR')}</span></div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold text-lg print:text-[10px]"><span className="print:text-[10px]">Grand Total:</span><span className="font-mono print:text-[10px]">{formatCurrency(totals.grandTotal, 'INR')}</span></div>
                    <div className="flex justify-between print:text-[10px]"><span className="text-muted-foreground print:text-[10px]">Amount Paid:</span><span className="font-mono print:text-[10px]">{formatCurrency(totals.amountPaid, 'INR')}</span></div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg print:text-[10px] text-destructive"><span className="print:text-[10px]">Amount Due:</span><span className="font-mono print:text-[10px]">{formatCurrency(totals.amountDue, 'INR')}</span></div>
                </div>
            </section>

            {/* GST Breakdown Table */}
            <section className="mt-8 print:mt-4">
                <h4 className="font-semibold mb-2 print:mb-1 print:text-[10px]">Tax Breakdown</h4>
                 <Table>
                    <TableHeader>
                        {isIntraState ? (
                            <>
                                <TableRow className="bg-muted/50">
                                    <TableHead rowSpan={2} className="text-center align-middle print:h-auto print:py-1 print:px-2 print:text-[10px]">HSN/SAC</TableHead>
                                    <TableHead rowSpan={2} className="text-right align-middle print:h-auto print:py-1 print:px-2 print:text-[10px]">Taxable Value</TableHead>
                                    <TableHead colSpan={2} className="text-center align-middle print:h-auto print:py-1 print:px-2 print:text-[10px]">CGST</TableHead>
                                    <TableHead colSpan={2} className="text-center align-middle print:h-auto print:py-1 print:px-2 print:text-[10px]">SGST</TableHead>
                                    <TableHead rowSpan={2} className="text-right align-middle print:h-auto print:py-1 print:px-2 print:text-[10px]">Total Tax Amount</TableHead>
                                </TableRow>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="text-right print:h-auto print:py-1 print:px-2 print:text-[10px]">Rate</TableHead>
                                    <TableHead className="text-right print:h-auto print:py-1 print:px-2 print:text-[10px]">Amount</TableHead>
                                    <TableHead className="text-right print:h-auto print:py-1 print:px-2 print:text-[10px]">Rate</TableHead>
                                    <TableHead className="text-right print:h-auto print:py-1 print:px-2 print:text-[10px]">Amount</TableHead>
                                </TableRow>
                            </>
                        ) : (
                             <TableRow className="bg-muted/50">
                                <TableHead className="text-center print:h-auto print:py-1 print:px-2 print:text-[10px]">HSN/SAC</TableHead>
                                <TableHead className="text-right print:h-auto print:py-1 print:px-2 print:text-[10px]">Taxable Value</TableHead>
                                <TableHead className="text-right print:h-auto print:py-1 print:px-2 print:text-[10px]">IGST Rate</TableHead>
                                <TableHead className="text-right print:h-auto print:py-1 print:px-2 print:text-[10px]">IGST Amount</TableHead>
                                <TableHead className="text-right print:h-auto print:py-1 print:px-2 print:text-[10px]">Total Tax Amount</TableHead>
                            </TableRow>
                        )}
                    </TableHeader>
                    <TableBody>
                        {gstBreakdown.map(item => (
                            <TableRow key={item.hsn}>
                                <TableCell className="text-center print:py-1 print:px-2 print:text-[10px]">{item.hsn}</TableCell>
                                <TableCell className="text-right font-mono print:py-1 print:px-2 print:text-[10px]">{formatCurrency(item.taxableValue, 'INR')}</TableCell>
                                {isIntraState ? (
                                    <>
                                        <TableCell className="text-right print:py-1 print:px-2 print:text-[10px]">{item.gstRate / 2}%</TableCell>
                                        <TableCell className="text-right font-mono print:py-1 print:px-2 print:text-[10px]">{formatCurrency(item.cgst, 'INR')}</TableCell>
                                        <TableCell className="text-right print:py-1 print:px-2 print:text-[10px]">{item.gstRate / 2}%</TableCell>
                                        <TableCell className="text-right font-mono print:py-1 print:px-2 print:text-[10px]">{formatCurrency(item.sgst, 'INR')}</TableCell>
                                    </>
                                ) : (
                                    <>
                                        <TableCell className="text-right print:py-1 print:px-2 print:text-[10px]">{item.gstRate}%</TableCell>
                                        <TableCell className="text-right font-mono print:py-1 print:px-2 print:text-[10px]">{formatCurrency(item.igst, 'INR')}</TableCell>
                                    </>
                                )}
                                <TableCell className="text-right font-mono print:py-1 print:px-2 print:text-[10px]">{formatCurrency(item.totalTax, 'INR')}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                         <TableRow className="font-bold">
                            <TableCell className="text-right print:py-1 print:px-2 print:text-[10px]">Total</TableCell>
                            <TableCell className="text-right font-mono print:py-1 print:px-2 print:text-[10px]">{formatCurrency(breakdownTotals.taxableValue, 'INR')}</TableCell>
                            {isIntraState ? (
                                <>
                                    <TableCell></TableCell>
                                    <TableCell className="text-right font-mono print:py-1 print:px-2 print:text-[10px]">{formatCurrency(breakdownTotals.cgst, 'INR')}</TableCell>
                                    <TableCell></TableCell>
                                    <TableCell className="text-right font-mono print:py-1 print:px-2 print:text-[10px]">{formatCurrency(breakdownTotals.sgst, 'INR')}</TableCell>
                                </>
                            ) : (
                                <>
                                    <TableCell></TableCell>
                                    <TableCell className="text-right font-mono print:py-1 print:px-2 print:text-[10px]">{formatCurrency(breakdownTotals.igst, 'INR')}</TableCell>
                                </>
                            )}
                            <TableCell className="text-right font-mono print:py-1 print:px-2 print:text-[10px]">{formatCurrency(breakdownTotals.totalTax, 'INR')}</TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </section>

            <Separator className="my-6 print:my-3" />

            {/* Footer sections */}
            <footer className="grid grid-cols-2 gap-8 print:gap-4 text-sm print:text-[10px]">
                <div>
                    <h4 className="font-semibold mb-1 print:text-[10px]">Bank Details:</h4>
                    <p className="text-muted-foreground print:text-[10px]">Bank Name: {bankDetails.name}</p>
                    <p className="text-muted-foreground print:text-[10px]">Account Number: {bankDetails.accountNumber}</p>
                    <p className="text-muted-foreground print:text-[10px]">IFSC Code: {bankDetails.ifsc}</p>
                </div>
                 <div>
                    <h4 className="font-semibold mb-1 print:text-[10px]">Terms & Conditions:</h4>
                    <ul className="list-disc list-inside text-muted-foreground text-xs print:text-[10px]">
                        {terms.map((term, i) => <li key={i} className="print:text-[10px]">{term}</li>)}
                    </ul>
                </div>
            </footer>

            {/* Signature */}
            <div className="mt-16 print:mt-8 pt-8 print:pt-4 border-t text-right">
                <p className="font-semibold print:text-[10px]">For {seller.name}</p>
                <div className="h-16 print:h-8"></div>
                <p className="print:text-[10px]">(Authorised Signatory)</p>
            </div>
        </Card>
    );
}
