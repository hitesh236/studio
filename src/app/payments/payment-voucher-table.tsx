
'use client';

import * as React from 'react';
import type { PaymentVoucher } from './data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface PaymentVoucherTableProps {
  data: PaymentVoucher[];
}

export function PaymentVoucherTable({ data }: PaymentVoucherTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Voucher No.</TableHead>
            <TableHead>Party</TableHead>
            <TableHead>Mode</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((voucher) => (
            <TableRow key={voucher.id}>
              <TableCell>{format(voucher.date, 'dd MMM, yyyy')}</TableCell>
              <TableCell className="font-medium">{voucher.voucherNumber}</TableCell>
              <TableCell>{voucher.partyName}</TableCell>
              <TableCell>{voucher.paymentMode}</TableCell>
              <TableCell className="text-right font-mono">{formatCurrency(voucher.amount, 'INR')}</TableCell>
              <TableCell className="text-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>View</DropdownMenuItem>
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
