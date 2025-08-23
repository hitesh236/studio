
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PaymentVoucherTableProps {
  data: PaymentVoucher[];
}

const MobileVoucherCard = ({ voucher }: { voucher: PaymentVoucher }) => {
    return (
        <Card>
            <CardHeader className="p-4 flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-base">{voucher.voucherNumber}</CardTitle>
                    <CardDescription>{voucher.partyName}</CardDescription>
                </div>
                <div className="text-right">
                    <p className="font-mono text-lg">{formatCurrency(voucher.amount, 'INR')}</p>
                    <p className="text-xs text-muted-foreground">{format(voucher.date, 'dd-MMM-yy')}</p>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Mode: {voucher.paymentMode}</p>
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
                </div>
            </CardContent>
        </Card>
    );
};

export function PaymentVoucherTable({ data }: PaymentVoucherTableProps) {
  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border">
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

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {data.map(voucher => (
            <MobileVoucherCard key={voucher.id} voucher={voucher} />
        ))}
      </div>
    </>
  );
}
