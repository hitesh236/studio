
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

    return (
        <Card className="p-8 shadow-none border-none">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="h-12 w-12">
                        <rect width="256" height="256" fill="none"></rect>
                        <path d="M42.4,188.4,74.8,93.2a15.9,15.9,0,0,1,15.1-10.8h76.2a15.9,15.9,0,0,1,15.1,10.8l32.4,95.2a16,16,0,0,1-15.1,21.2H57.5A16,16,0,0,1,42.4,188.4Z" opacity="0.2"></path>
                        <path d="M42.4,188.4,74.8,93.2a15.9,15.9,0,0,1,15.1-10.8h76.2a15.9,15.9,0,0,1,15.1,10.8l32.4,95.2a16,16,0,0,1-15.1,21.2H57.5A16,16,0,0,1,42.4,188.4Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path><line x1="128" y1="40" x2="128" y2="82.4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line>
                    </svg>
                    <div>
                        <h1 className="text-2xl font-bold">{seller.name}</h1>
                        <p className="text-sm text-muted-foreground max-w-xs">{seller.address}</p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-3xl font-bold tracking-tight">TAX INVOICE</h2>
                    <p className="text-muted-foreground text-sm mt-1"># {invoiceDetails.number}</p>
                </div>
            </div>
            
            <Separator className="my-6" />

            {/* Seller & Buyer Details */}
            <div className="grid grid-cols-2 gap-8 text-sm">
                <div>
                    <h3 className="font-semibold mb-2">From:</h3>
                    <p className="font-bold">{seller.name}</p>
                    <p>{seller.address}</p>
                    <p>GSTIN: <span className="font-mono">{seller.gstin}</span></p>
                </div>
                <div className="text-right">
                    <h3 className="font-semibold mb-2">Bill To:</h3>
                    <p className="font-bold">{buyer.name}</p>
                    <p>{buyer.billingAddress}</p>
                    {buyer.gstin && <p>GSTIN: <span className="font-mono">{buyer.gstin}</span></p>}
                </div>
                <div className="col-span-2 grid grid-cols-2 gap-8">
                     <div>
                        <h3 className="font-semibold mb-2">Ship To:</h3>
                        <p className="font-bold">{buyer.name}</p>
                        <p>{buyer.shippingAddress}</p>
                    </div>
                    <div className="text-right">
                        <p><strong>Place of Supply:</strong> {buyer.placeOfSupply}</p>
                        <p><strong>Invoice Date:</strong> {format(invoiceDetails.date, 'PPP')}</p>
                        <p><strong>Due Date:</strong> {format(invoiceDetails.dueDate, 'PPP')}</p>
                    </div>
                </div>
            </div>

            {/* Items Table */}
            <div className="mt-8">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-12 text-center">#</TableHead>
                            <TableHead>Item & Description</TableHead>
                            <TableHead className="text-center">HSN</TableHead>
                            <TableHead className="text-right">Qty</TableHead>
                            <TableHead className="text-right">Rate</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item, index) => (
                            <TableRow key={item.id}>
                                <TableCell className="text-center">{index + 1}</TableCell>
                                <TableCell>
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-xs text-muted-foreground">{item.description}</p>
                                </TableCell>
                                <TableCell className="text-center">{item.hsn}</TableCell>
                                <TableCell className="text-right">{item.quantity} {item.unit}</TableCell>
                                <TableCell className="text-right font-mono">{formatCurrency(item.rate, 'INR')}</TableCell>
                                <TableCell className="text-right font-mono">{formatCurrency(item.quantity * item.rate, 'INR')}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={5} className="text-right font-semibold">Subtotal</TableCell>
                            <TableCell className="text-right font-mono">{formatCurrency(totals.subtotal, 'INR')}</TableCell>
                        </TableRow>
                        {isIntraState ? (
                            <>
                                <TableRow>
                                    <TableCell colSpan={5} className="text-right">CGST @ {totals.gstRate / 2}%</TableCell>
                                    <TableCell className="text-right font-mono">{formatCurrency(totals.cgst, 'INR')}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell colSpan={5} className="text-right">SGST @ {totals.gstRate / 2}%</TableCell>
                                    <TableCell className="text-right font-mono">{formatCurrency(totals.sgst, 'INR')}</TableCell>
                                </TableRow>
                            </>
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-right">IGST @ {totals.gstRate}%</TableCell>
                                <TableCell className="text-right font-mono">{formatCurrency(totals.igst, 'INR')}</TableCell>
                            </TableRow>
                        )}
                        <TableRow className="text-base font-bold bg-muted/50">
                            <TableCell colSpan={5} className="text-right">Grand Total</TableCell>
                            <TableCell className="text-right font-mono">{formatCurrency(totals.grandTotal, 'INR')}</TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>
            
            <Separator className="my-6" />

            {/* Footer sections */}
            <div className="space-y-6 text-sm">
                <div>
                    <h4 className="font-semibold mb-1">Amount in Words:</h4>
                    <p className="text-muted-foreground">{numberToWords(totals.grandTotal)}</p>
                </div>
                <div>
                    <h4 className="font-semibold mb-1">Bank Details:</h4>
                    <p className="text-muted-foreground">Bank Name: {bankDetails.name}</p>
                    <p className="text-muted-foreground">Account Number: {bankDetails.accountNumber}</p>
                    <p className="text-muted-foreground">IFSC Code: {bankDetails.ifsc}</p>
                </div>
                 <div>
                    <h4 className="font-semibold mb-1">Terms & Conditions:</h4>
                    <ul className="list-disc list-inside text-muted-foreground text-xs">
                        {terms.map((term, i) => <li key={i}>{term}</li>)}
                    </ul>
                </div>
            </div>

            {/* Signature */}
            <div className="mt-16 pt-8 border-t text-right">
                <p className="font-semibold">For {seller.name}</p>
                <div className="h-16"></div>
                <p>(Authorised Signatory)</p>
            </div>
        </Card>
    );
}
