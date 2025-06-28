
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
import { formatCurrency, cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle, List, LayoutGrid, Search } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';

interface JournalEntriesTableProps {
  data: JournalEntry[];
}

const JournalEntryCard = ({ entry }: { entry: JournalEntry }) => {
    const totalDebits = entry.lines.reduce((acc, line) => acc + line.debit, 0);

    return (
        <Card>
            <CardHeader className="p-4">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-base">{entry.entryNumber}</CardTitle>
                        <CardDescription>{format(entry.date, 'MMM d, yyyy')} &bull; {entry.createdBy}</CardDescription>
                    </div>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2">
                                <MoreHorizontal className="h-4 w-4"/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Reverse</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                 <p className="text-sm text-muted-foreground pt-2">{entry.description}</p>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="space-y-2 text-sm">
                    {entry.lines.map(line => (
                        <div key={line.id} className="flex justify-between items-center">
                            <span className={cn(line.credit > 0 && 'pl-4')}>{line.account}</span>
                            <span className="font-mono">
                                {line.debit > 0 ? formatCurrency(line.debit, 'INR') : formatCurrency(line.credit, 'INR')}
                            </span>
                        </div>
                    ))}
                </div>
                 <Separator className="my-2" />
                 <div className="flex justify-between font-bold text-sm">
                    <span>Total</span>
                    <span className="font-mono">{formatCurrency(totalDebits, 'INR')}</span>
                 </div>
            </CardContent>
        </Card>
    )
}

export function JournalEntriesTable({ data }: JournalEntriesTableProps) {
  const [view, setView] = React.useState<'table' | 'card'>('table');
  const [filter, setFilter] = React.useState('');

  const filteredData = React.useMemo(() => {
    if (!filter) return data;
    
    const lowercasedFilter = filter.toLowerCase();

    return data.filter(entry => {
        const matchesDescription = entry.description.toLowerCase().includes(lowercasedFilter);
        const matchesEntryNumber = entry.entryNumber.toLowerCase().includes(lowercasedFilter);
        const matchesCreatedBy = entry.createdBy.toLowerCase().includes(lowercasedFilter);
        const matchesAccount = entry.lines.some(line => line.account.toLowerCase().includes(lowercasedFilter));
        
        return matchesDescription || matchesEntryNumber || matchesCreatedBy || matchesAccount;
    });
  }, [data, filter]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <CardTitle>Journal Entries</CardTitle>
                <CardDescription>A record of all financial transactions.</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Filter entries..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center rounded-md bg-muted p-1">
                        <Button variant={view === 'table' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('table')}>
                            <List className="h-4 w-4"/>
                            <span className="sr-only">Table View</span>
                        </Button>
                        <Button variant={view === 'card' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('card')}>
                            <LayoutGrid className="h-4 w-4"/>
                            <span className="sr-only">Card View</span>
                        </Button>
                    </div>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4"/>
                        New Journal Entry
                    </Button>
                </div>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {view === 'table' ? (
            <div className="rounded-md border">
            <Table className="text-xs">
                <TableHeader>
                <TableRow>
                    <TableHead className="w-[100px] p-2 h-10">Date</TableHead>
                    <TableHead className="w-[120px] p-2 h-10">Entry #</TableHead>
                    <TableHead className="w-[120px] p-2 h-10">Created By</TableHead>
                    <TableHead className="p-2 h-10">Account & Description</TableHead>
                    <TableHead className="text-right p-2 h-10">Debit</TableHead>
                    <TableHead className="text-right p-2 h-10">Credit</TableHead>
                    <TableHead className="w-[50px] text-center p-2 h-10">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {filteredData.map((entry, entryIndex) => (
                    <React.Fragment key={entry.id}>
                    {entry.lines.map((line, lineIndex) => (
                        <TableRow key={line.id} className={cn('h-auto', lineIndex === entry.lines.length - 1 && entryIndex !== filteredData.length-1 ? 'border-b-4 border-double' : '')}>
                        {lineIndex === 0 ? (
                            <TableCell rowSpan={entry.lines.length + 1} className="align-top font-medium border-r p-2">
                            {format(entry.date, 'dd-MMM-yy')}
                            </TableCell>
                        ) : null}
                        {lineIndex === 0 ? (
                            <TableCell rowSpan={entry.lines.length + 1} className="align-top text-muted-foreground border-r p-2">
                            {entry.entryNumber}
                            </TableCell>
                        ) : null}
                        {lineIndex === 0 ? (
                            <TableCell rowSpan={entry.lines.length + 1} className="align-top border-r p-2">
                            {entry.createdBy}
                            </TableCell>
                        ) : null}

                        <TableCell className={cn('p-2', line.credit > 0 ? 'pl-6' : '')}>
                            {line.account}
                        </TableCell>
                        <TableCell className="text-right font-mono p-2">
                            {line.debit > 0 ? formatCurrency(line.debit, 'INR') : ''}
                        </TableCell>
                        <TableCell className="text-right font-mono p-2">
                           {line.credit > 0 ? formatCurrency(line.credit, 'INR') : ''}
                        </TableCell>

                        {lineIndex === 0 ? (
                            <TableCell rowSpan={entry.lines.length + 1} className="text-center align-top p-2">
                              <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-7 w-7">
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
                    <TableRow className={cn('h-auto', entryIndex !== filteredData.length-1 ? 'border-b-4 border-double' : '')}>
                        <TableCell colSpan={3} className="p-2 pl-6 text-sm text-muted-foreground italic">
                            {entry.description}
                        </TableCell>
                    </TableRow>
                    </React.Fragment>
                ))}
                </TableBody>
            </Table>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredData.map(entry => (
                    <JournalEntryCard key={entry.id} entry={entry} />
                ))}
            </div>
        )}
      </CardContent>
    </Card>
  );
}
