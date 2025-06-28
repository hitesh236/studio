
'use client';

import * as React from 'react';
import type { JournalEntry } from './data';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface JournalEntriesTableProps {
  data: JournalEntry[];
}

export function JournalEntriesTable({ data }: JournalEntriesTableProps) {

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Journal Entries</CardTitle>
            <CardDescription>A record of all financial transactions.</CardDescription>
        </div>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4"/>
            New Journal Entry
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Date</TableHead>
                <TableHead className="w-[150px]">Entry #</TableHead>
                <TableHead>Account & Description</TableHead>
                <TableHead className="text-right">Debit</TableHead>
                <TableHead className="text-right">Credit</TableHead>
                <TableHead className="w-[50px] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((entry, entryIndex) => (
                <React.Fragment key={entry.id}>
                  {entry.lines.map((line, lineIndex) => (
                    <TableRow key={line.id} className={lineIndex === entry.lines.length - 1 && entryIndex !== data.length-1 ? 'border-b-4 border-double' : ''}>
                      {lineIndex === 0 ? (
                        <TableCell rowSpan={entry.lines.length + 1} className="align-top font-medium border-r">
                           {format(entry.date, 'MMM d, yyyy')}
                        </TableCell>
                      ) : null}
                       {lineIndex === 0 ? (
                        <TableCell rowSpan={entry.lines.length + 1} className="align-top text-muted-foreground border-r">
                          {entry.entryNumber}
                        </TableCell>
                      ) : null}

                      <TableCell className={line.credit > 0 ? 'pl-8' : ''}>
                          {line.account}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                          {line.debit > 0 ? formatCurrency(line.debit, 'INR') : ''}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                           {line.credit > 0 ? formatCurrency(line.credit, 'INR') : ''}
                      </TableCell>

                      {lineIndex === 0 ? (
                        <TableCell rowSpan={entry.lines.length + 1} className="text-center align-top">
                          <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4"/>
                                  </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                  <DropdownMenuItem>Edit</DropdownMenuItem>
                                  <DropdownMenuItem>Reverse</DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      ) : null}
                    </TableRow>
                  ))}
                  <TableRow className={entryIndex !== data.length-1 ? 'border-b-4 border-double' : ''}>
                    <TableCell colSpan={3} className="pl-8 text-sm text-muted-foreground italic">
                        {entry.description}
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
