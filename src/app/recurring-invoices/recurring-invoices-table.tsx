
'use client';

import * as React from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Play, Pause, Trash2, Edit } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { RecurringInvoice } from './data';
import { useRouter } from 'next/navigation';
import useUserRole from '@/hooks/use-user-role';

interface RecurringInvoicesTableProps {
  data: RecurringInvoice[];
}

export function RecurringInvoicesTable({ data }: RecurringInvoicesTableProps) {
  const router = useRouter();
  const { role } = useUserRole();
  const canEdit = role === 'Admin' || role === 'Accountant';

  const getStatusVariant = (status: RecurringInvoice['status']): 'default' | 'secondary' | 'outline' => {
    switch (status) {
      case 'Active': return 'default';
      case 'Paused': return 'secondary';
      case 'Finished':
      default: return 'outline';
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Frequency</TableHead>
            <TableHead>Next Invoice Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium">{invoice.customerName}</TableCell>
              <TableCell className="capitalize">{invoice.frequency}</TableCell>
              <TableCell>{format(invoice.nextInvoiceDate, 'dd MMM, yyyy')}</TableCell>
              <TableCell className="text-right font-mono">{formatCurrency(invoice.amount, 'INR')}</TableCell>
              <TableCell className="text-center">
                <Badge variant={getStatusVariant(invoice.status)}>{invoice.status}</Badge>
              </TableCell>
              <TableCell className="text-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={!canEdit}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => router.push('/recurring-invoices/new')}>
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    {invoice.status === 'Active' && (
                      <DropdownMenuItem>
                        <Pause className="mr-2 h-4 w-4" /> Pause
                      </DropdownMenuItem>
                    )}
                    {invoice.status === 'Paused' && (
                      <DropdownMenuItem>
                        <Play className="mr-2 h-4 w-4" /> Resume
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
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
