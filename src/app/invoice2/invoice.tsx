
'use client';

import * as React from 'react';
import Image from 'next/image';
import type { InvoiceDetails } from './data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface InvoiceProps {
  data: InvoiceDetails;
}

const DetailItem = ({ label, value }: { label: string, value: string | undefined }) => (
    value ? <div className="flex text-xs"><dt className="w-24 font-semibold">{label}</dt><dd className="flex-1">: {value}</dd></div> : null
);

export function Invoice2({ data }: InvoiceProps) {
  const { seller, billTo, shipTo, invoiceMeta, irnDetails, items, summary, footer } = data;

  return (
    <Card className="max-w-4xl mx-auto my-8 p-8 font-sans text-sm">
      <header className="grid grid-cols-12 gap-4 mb-4">
        <div className="col-span-2 flex items-center justify-center">
            <Image src={seller.logoUrl} alt="Company Logo" width={80} height={80} data-ai-hint="company logo" />
        </div>
        <div className="col-span-8 text-center">
            <h1 className="text-2xl font-bold">{seller.name}</h1>
            {seller.address.map((line, i) => <p key={i} className="text-xs">{line}</p>)}
            <p className="text-xs mt-1">
                Contact: {seller.contact} | E-Mail: {seller.email}
            </p>
            <p className="text-xs font-semibold">
                GSTIN/UIN: {seller.gstin} | PAN: {seller.pan} | CIN: {seller.cin}
            </p>
        </div>
        <div className="col-span-2 flex items-center justify-center">
             <Image src={seller.qrCodeUrl} alt="QR Code" width={80} height={80} data-ai-hint="qr code" />
        </div>
      </header>
      
      <div className="text-center font-bold text-lg my-2 py-1 border-y border-black">
        Tax Invoice
      </div>

      <section className="grid grid-cols-12 gap-4 mb-2">
        <div className="col-span-4 border border-gray-400 p-2">
            <h3 className="font-bold underline">Bill To,</h3>
            <p className="font-bold">{billTo.name}</p>
            <p>{billTo.address.join(', ')}</p>
            <p>State: {billTo.state}</p>
            <p>Pincode: {billTo.pincode}</p>
            <p>GSTIN: {billTo.gstin}</p>
            <p>Mobile: {billTo.mobile}</p>
        </div>
         <div className="col-span-4 border border-gray-400 p-2">
            <h3 className="font-bold underline">Ship To,</h3>
            <p className="font-bold">{shipTo.name}</p>
            <p>{shipTo.address.join(', ')}</p>
            <p>State: {shipTo.state}</p>
            <p>Pincode: {shipTo.pincode}</p>
            <p>GSTIN: {shipTo.gstin}</p>
            <p>Mobile: {shipTo.mobile}</p>
        </div>
        <div className="col-span-4 border border-gray-400 p-2">
            <dl>
                <DetailItem label="Inv No." value={invoiceMeta.invNo} />
                <DetailItem label="Date" value={invoiceMeta.invDate} />
                <DetailItem label="Order No." value={invoiceMeta.orderNo} />
                <DetailItem label="Date" value={invoiceMeta.orderDate} />
                <DetailItem label="LR No." value={invoiceMeta.lrNo} />
                <DetailItem label="Date" value={invoiceMeta.lrDate} />
                <DetailItem label="Del No." value={invoiceMeta.delNo} />
                <DetailItem label="Date" value={invoiceMeta.delDate} />
                <DetailItem label="Eway Bill No." value={invoiceMeta.ewayBillNo} />
                <DetailItem label="Date" value={invoiceMeta.ewayDate} />
                <DetailItem label="Doc No." value={invoiceMeta.docNo} />
                <DetailItem label="Disp. Through" value={invoiceMeta.dispThrough} />
                <DetailItem label="Destination" value={invoiceMeta.destination} />
                <DetailItem label="Vehicle No." value={invoiceMeta.vehicleNo} />
                <DetailItem label="Payment Terms" value={invoiceMeta.paymentTerms} />
                <DetailItem label="Terms Delivery" value={invoiceMeta.termsDelivery} />
            </dl>
        </div>
      </section>

      <section className="border border-gray-400 p-2 text-xs mb-2">
        <p><span className="font-bold">place of supply:</span> West Bengal</p>
        <p><span className="font-bold">IRN:</span> {irnDetails.irn}</p>
        <div className="flex justify-between">
            <p><span className="font-bold">Ack No.:</span> {irnDetails.ackNo}</p>
            <p><span className="font-bold">Ack Date:</span> {irnDetails.ackDate}</p>
        </div>
      </section>
      
      <section>
        <Table className="border border-gray-400">
            <TableHeader>
                <TableRow className="text-xs">
                    <TableHead className="border border-gray-400 h-auto">Sr. No.</TableHead>
                    <TableHead className="border border-gray-400 h-auto w-[30%]">Description of Goods</TableHead>
                    <TableHead className="border border-gray-400 h-auto">HSN/SAC</TableHead>
                    <TableHead className="border border-gray-400 h-auto">MRP</TableHead>
                    <TableHead className="border border-gray-400 h-auto text-right">Quantity</TableHead>
                    <TableHead className="border border-gray-400 h-auto text-right">Rate</TableHead>
                    <TableHead className="border border-gray-400 h-auto text-right">per</TableHead>
                    <TableHead className="border border-gray-400 h-auto text-right">Disc%</TableHead>
                    <TableHead className="border border-gray-400 h-auto text-right">Amount</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {items.map(item => (
                    <TableRow key={item.srNo} className="text-xs">
                        <TableCell className="border border-gray-400 align-top">{item.srNo}</TableCell>
                        <TableCell className="border border-gray-400 align-top">
                            <p className="font-semibold">{item.description}</p>
                            {item.subLines.map((line, i) => (
                                <p key={i} className="text-xs italic pl-2">{line}</p>
                            ))}
                        </TableCell>
                        <TableCell className="border border-gray-400 align-top">{item.hsn}</TableCell>
                        <TableCell className="border border-gray-400 align-top text-right">{item.mrp?.toFixed(2)}</TableCell>
                        <TableCell className="border border-gray-400 align-top text-right">{item.quantity} {item.unit}</TableCell>
                        <TableCell className="border border-gray-400 align-top text-right">{item.rate.toFixed(2)}</TableCell>
                        <TableCell className="border border-gray-400 align-top text-right">{item.per}</TableCell>
                        <TableCell className="border border-gray-400 align-top text-right">{item.discount?.toFixed(2)}</TableCell>
                        <TableCell className="border border-gray-400 align-top text-right">{formatCurrency(item.amount, 'INR').replace('₹', '')}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>

        <div className="grid grid-cols-12">
            <div className="col-span-8"></div>
            <div className="col-span-4">
                 <div className="grid grid-cols-2 text-xs border-r border-l border-b border-gray-400">
                    <div className="p-1">Transport Charges</div>
                    <div className="p-1 text-right">{formatCurrency(summary.transportCharges, 'INR').replace('₹', '')}</div>
                    <div className="p-1">IGST</div>
                    <div className="p-1 text-right">{formatCurrency(summary.igst, 'INR').replace('₹', '')}</div>
                    <div className="p-1">Rounding Off</div>
                    <div className="p-1 text-right">{summary.roundingOff.toFixed(2)}</div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-12 border-t border-b border-gray-400 font-bold mt-[-1px]">
            <div className="col-span-8 p-1 text-right">Total</div>
            <div className="col-span-1 p-1 text-right">{summary.totalQty} Pcs</div>
            <div className="col-span-3 p-1 text-right">{formatCurrency(summary.totalAmount, 'INR').replace('₹', '')}</div>
        </div>
         <div className="flex justify-between font-bold text-xs p-1">
            <span>Amount Chargeable (in words)</span>
            <span>E. & O.E</span>
        </div>
        <p className="font-bold p-1">{footer.amountInWords}</p>

      </section>

      <footer className="mt-2 text-xs">
        <div className="grid grid-cols-12 gap-4">
            <div className="col-span-4">
                <h3 className="font-bold underline">Company's Bank Details</h3>
                {footer.companyBankDetails.slice(0, 1).map((bank, i) => (
                    <div key={i}>
                        <p><span className="font-semibold">A/c Holder's Name :</span> {bank.holderName}</p>
                        <p><span className="font-semibold">Bank Name :</span> {bank.bankName}</p>
                        <p><span className="font-semibold">A/c No. :</span> {bank.acNo}</p>
                        <p><span className="font-semibold">IFS Code :</span> {bank.ifsCode}</p>
                        <p><span className="font-semibold">Branch :</span> {bank.branch}</p>
                    </div>
                ))}
            </div>
            <div className="col-span-4">
                 <h3 className="font-bold underline">Company's second Bank Details</h3>
                {footer.companyBankDetails.slice(1, 2).map((bank, i) => (
                    <div key={i}>
                        <p><span className="font-semibold">A/c Holder's Name :</span> {bank.holderName}</p>
                        <p><span className="font-semibold">Bank Name :</span> {bank.bankName}</p>
                        <p><span className="font-semibold">A/c No. :</span> {bank.acNo}</p>
                        <p><span className="font-semibold">IFS Code :</span> {bank.ifsCode}</p>
                        <p><span className="font-semibold">Branch :</span> {bank.branch}</p>
                    </div>
                ))}
            </div>
             <div className="col-span-4 flex flex-col items-center">
                <h3 className="font-bold underline">Scan to Pay</h3>
                <Image src={seller.qrCodeUrl} alt="Scan to Pay QR Code" width={80} height={80} data-ai-hint="payment qr" />
            </div>
        </div>
        
        <Separator className="my-2 bg-gray-400"/>
        
        <div className="grid grid-cols-12 gap-4">
            <div className="col-span-8">
                <h3 className="font-bold">Terms and Conditions</h3>
                <ol className="list-decimal list-inside">
                    {footer.termsAndConditions.map((term, i) => <li key={i}>{term}</li>)}
                </ol>
            </div>
            <div className="col-span-4">
                <h3 className="font-bold">Declaration</h3>
                <p>{footer.declaration}</p>
            </div>
        </div>

        <Separator className="my-2 bg-gray-400"/>

        <div className="flex justify-end">
            <div className="text-center relative">
                <p className="font-bold">{footer.signature.for}</p>
                <div className="h-20 w-40 flex items-center justify-center">
                    <Image src={footer.signature.stampUrl} alt="Company Stamp" width={100} height={50} data-ai-hint="company stamp" />
                </div>
                <p>{footer.signature.designation}</p>
            </div>
        </div>
        
        <Separator className="my-2 bg-gray-400"/>
        
        <div className="text-center">
            <p className="font-bold">{footer.jurisdiction}</p>
            <p>This is a Computer Generated Invoice</p>
        </div>
      </footer>
    </Card>
  );
}
