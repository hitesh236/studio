
'use client';

import * as React from 'react';
import type { JournalEntry } from './data';
import { format } from 'date-fns';
import { formatCurrency, cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

export const JournalEntryCard = ({ entry, density, onViewClick }: { entry: JournalEntry, density: 'normal' | 'compact', onViewClick: () => void }) => {
    const totalDebit = entry.lines.reduce((sum, line) => sum + line.debit, 0);

    return (
      <Card className="shadow-sm">
        <CardHeader className="p-3">
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-base">{entry.entryNumber}</CardTitle>
                    <CardDescription>{format(entry.date, 'dd-MMM-yyyy')} &bull; {entry.voucherType}</CardDescription>
                </div>
                <div className="font-mono text-base font-semibold">{formatCurrency(totalDebit, 'INR')}</div>
            </div>
        </CardHeader>
        <CardContent className="p-3 pt-0">
             <p className="text-sm text-muted-foreground italic truncate">{entry.description}</p>
            <div className="flex justify-end mt-2">
                 <Button onClick={onViewClick} variant="link" size="sm" className="h-auto p-0">View Details</Button>
            </div>
        </CardContent>
      </Card>
    );
};

export const JournalEntryVoucherDialog = ({ entry, onOpenChange }: { entry: JournalEntry | null; onOpenChange: (open: boolean) => void }) => {
  if (!entry) return null;

  const totalDebit = entry.lines.reduce((sum, line) => sum + line.debit, 0);
  const totalCredit = entry.lines.reduce((sum, line) => sum + line.credit, 0);

  return (
    <Dialog open={!!entry} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-xl">
            <DialogHeader>
                <DialogTitle>Journal Voucher</DialogTitle>
                <DialogDescription>
                    Voucher No: {entry.entryNumber}
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
                <div className="flex justify-between text-sm">
                    <span><strong>Date:</strong> {format(entry.date, 'PPP')}</span>
                    <span><strong>Type:</strong> {entry.voucherType}</span>
                </div>
                <Separator />
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Particulars</TableHead>
                                <TableHead className="text-right">Debit</TableHead>
                                <TableHead className="text-right">Credit</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {entry.lines.filter(l => l.debit > 0).map(line => (
                                <TableRow key={line.id}>
                                    <TableCell>{line.account}</TableCell>
                                    <TableCell className="text-right font-mono text-primary">{formatCurrency(line.debit, 'INR')}</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            ))}
                             {entry.lines.filter(l => l.credit > 0).map(line => (
                                <TableRow key={line.id}>
                                    <TableCell className="pl-8 text-muted-foreground">To {line.account}</TableCell>
                                    <TableCell></TableCell>
                                    <TableCell className="text-right font-mono text-destructive">{formatCurrency(line.credit, 'INR')}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell className="text-right font-bold">Total</TableCell>
                                <TableCell className="text-right font-bold font-mono text-primary">{formatCurrency(totalDebit, 'INR')}</TableCell>
                                <TableCell className="text-right font-bold font-mono text-destructive">{formatCurrency(totalCredit, 'INR')}</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
                <div>
                    <p className="text-sm"><strong>Narration:</strong> <span className="text-muted-foreground italic">{entry.description}</span></p>
                    <p className="text-xs text-muted-foreground mt-2">Created by: {entry.createdBy}</p>
                </div>
            </div>
        </DialogContent>
    </Dialog>
  );
};
