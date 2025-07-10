
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Undo2, Trash2, PlusCircle, Search, Filter, Download, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { JournalEntryVoucherDialog, JournalEntryCard } from './journal-entry-components';
import Loading from '../loading';

export function JournalEntriesTable({ data }: { data: JournalEntry[] | null }) {
  const [filter, setFilter] = React.useState('');
  const [density, setDensity] = React.useState<'normal' | 'compact'>('normal');
  const [page, setPage] = React.useState(0);
  const [rowsPerPageSelection, setRowsPerPageSelection] = React.useState("20");
  const [viewingEntry, setViewingEntry] = React.useState<JournalEntry | null>(null);

  const filteredData = React.useMemo(() => {
    if (!data) return [];
    if (!filter) return data;
    
    const lowercasedFilter = filter.toLowerCase();

    return data.filter(entry => {
        const matchesDescription = entry.description.toLowerCase().includes(lowercasedFilter);
        const matchesEntryNumber = entry.entryNumber.toLowerCase().includes(lowercasedFilter);
        const matchesVoucherType = entry.voucherType.toLowerCase().includes(lowercasedFilter);
        const matchesCreatedBy = entry.createdBy.toLowerCase().includes(lowercasedFilter);
        const matchesAccount = entry.lines.some(line => line.account.toLowerCase().includes(lowercasedFilter));
        
        return matchesDescription || matchesEntryNumber || matchesVoucherType || matchesCreatedBy || matchesAccount;
    });
  }, [data, filter]);

  const totalPages = React.useMemo(() => {
    if (rowsPerPageSelection === "all" || filteredData.length === 0) {
      return 1;
    }
    return Math.ceil(filteredData.length / Number(rowsPerPageSelection));
  }, [filteredData.length, rowsPerPageSelection]);

  const paginatedData = React.useMemo(() => {
    if (rowsPerPageSelection === "all") {
      return filteredData;
    }
    const rpp = Number(rowsPerPageSelection);
    const start = page * rpp;
    const end = start + rpp;
    return filteredData.slice(start, end);
  }, [filteredData, page, rowsPerPageSelection]);
  
  const handleRowsPerPageChange = (value: string) => {
    setRowsPerPageSelection(value);
    setPage(0);
  };

  const getPaginationButtons = () => {
    if (totalPages <= 1) return null;

    const pageNumbers: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 0; i < totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(0);
      if (page > 2) {
        pageNumbers.push('...');
      }
      
      const startPage = Math.max(1, page - 1);
      const endPage = Math.min(totalPages - 2, page + 1);

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (page < totalPages - 3) {
        pageNumbers.push('...');
      }
      pageNumbers.push(totalPages - 1);
    }

    const uniquePageNumbers = [...new Set(pageNumbers)];

    return uniquePageNumbers.map((p, index) =>
      typeof p === 'number' ? (
        <Button
          key={`${p}-${index}`}
          variant={page === p ? 'default' : 'outline'}
          size="icon"
          onClick={() => setPage(p)}
          className="h-9 w-9"
        >
          {p + 1}
        </Button>
      ) : (
        <span key={`dots-${index}`} className="flex h-9 w-9 items-center justify-center">
          ...
        </span>
      )
    );
  };

  if (!data) {
    return <Loading />;
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                  <CardTitle>All Entries</CardTitle>
                  <CardDescription>A record of all financial transactions. Showing {filteredData.length} entries.</CardDescription>
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
                      <div className="hidden sm:flex items-center space-x-2">
                        <Switch
                          id="density-mode"
                          checked={density === "compact"}
                          onCheckedChange={(checked) =>
                            setDensity(checked ? "compact" : "normal")
                          }
                        />
                        <Label htmlFor="density-mode">Compact</Label>
                      </div>
                      <Button variant="outline" size="icon" className="hidden sm:inline-flex">
                          <Filter className="h-4 w-4"/>
                          <span className="sr-only">Filter</span>
                      </Button>
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="icon" className="hidden sm:inline-flex">
                                  <Download className="h-4 w-4"/>
                                  <span className="sr-only">Download</span>
                              </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                              <DropdownMenuItem>PDF</DropdownMenuItem>
                              <DropdownMenuItem>CSV</DropdownMenuItem>
                          </DropdownMenuContent>
                      </DropdownMenu>
                      <Link href="/journal-entries/new" passHref>
                          <Button>
                              <PlusCircle className="mr-2 h-4 w-4"/>
                              New Journal Entry
                          </Button>
                      </Link>
                  </div>
              </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className="hidden rounded-md border md:block">
              <Table className={cn(density === 'compact' && 'text-xs')}>
                  <TableHeader>
                  <TableRow>
                      <TableHead className={cn("w-[100px] p-2 h-10", density === 'compact' && 'p-1 h-8')}>Date</TableHead>
                      <TableHead className={cn("w-[120px] p-2 h-10", density === 'compact' && 'p-1 h-8')}>Entry #</TableHead>
                      <TableHead className={cn("w-[100px] p-2 h-10", density === 'compact' && 'p-1 h-8')}>Voucher Type</TableHead>
                      <TableHead className={cn("p-2 h-10", density === 'compact' && 'p-1 h-8')}>Particulars</TableHead>
                      <TableHead className={cn("text-right p-2 h-10", density === 'compact' && 'p-1 h-8')}>Debit</TableHead>
                      <TableHead className={cn("text-right p-2 h-10", density === 'compact' && 'p-1 h-8')}>Credit</TableHead>
                      <TableHead className={cn("w-[150px] text-center p-2 h-10", density === 'compact' && 'p-1 h-8')}>Actions</TableHead>
                  </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.map((entry, entryIndex) => {
                      const isEven = entryIndex % 2 === 0;
                      const debitLines = entry.lines.filter(l => l.debit > 0);
                      const creditLines = entry.lines.filter(l => l.credit > 0);
                      const allLines = [...debitLines, ...creditLines];
                      const rowCount = allLines.length + 1; // +1 for narration row
                      return (
                        <React.Fragment key={entry.id}>
                            {allLines.map((line, lineIndex) => (
                                <TableRow key={line.id} className={cn(isEven ? 'bg-muted/30' : 'bg-transparent', "hover:bg-muted/60 border-x")}>
                                    {lineIndex === 0 && (
                                        <TableCell rowSpan={rowCount} className={cn("align-top text-center p-2 border-t-2 border-primary", isEven ? "bg-muted/30" : "bg-transparent")}>
                                            <div className="pt-2">{format(entry.date, 'dd-MMM-yy')}</div>
                                        </TableCell>
                                    )}
                                    {lineIndex === 0 && (
                                        <TableCell rowSpan={rowCount} className={cn("align-top text-center p-2 border-t-2 border-primary", isEven ? "bg-muted/30" : "bg-transparent")}>
                                            <div className="flex flex-col items-center pt-2">
                                                <span>{entry.entryNumber}</span>
                                                <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => setViewingEntry(entry)}>View Details</Button>
                                            </div>
                                        </TableCell>
                                    )}
                                     {lineIndex === 0 && (
                                        <TableCell rowSpan={rowCount} className={cn("align-top text-center p-2 border-t-2 border-primary", isEven ? "bg-muted/30" : "bg-transparent")}>
                                            <div className="pt-2">{entry.voucherType}</div>
                                        </TableCell>
                                    )}
                                    <TableCell className={cn('p-2 border-t', line.credit > 0 ? 'pl-8' : 'pl-2', lineIndex === 0 && 'border-t-2 border-primary')}>
                                        {line.credit > 0 && <span className="text-muted-foreground">To </span>}
                                        {line.account}
                                    </TableCell>
                                    <TableCell className={cn("text-right font-mono p-2 text-primary border-t", lineIndex === 0 && 'border-t-2 border-primary')}>
                                        {line.debit > 0 ? formatCurrency(line.debit, 'INR') : null}
                                    </TableCell>
                                    <TableCell className={cn("text-right font-mono p-2 text-destructive border-t", lineIndex === 0 && 'border-t-2 border-primary')}>
                                        {line.credit > 0 ? formatCurrency(line.credit, 'INR') : null}
                                    </TableCell>
                                    {lineIndex === 0 && (
                                        <TableCell rowSpan={rowCount} className={cn("align-top text-center border-t-2 border-primary p-2", isEven ? "bg-muted/30" : "bg-transparent")}>
                                           <div className="flex items-center justify-center gap-0 pt-2">
                                              <Tooltip><TooltipTrigger asChild>
                                                  <Button variant="ghost" size="icon" className="h-7 w-7"><Edit className="h-4 w-4" /></Button>
                                              </TooltipTrigger><TooltipContent><p>Edit Entry</p></TooltipContent></Tooltip>
                                              <Tooltip><TooltipTrigger asChild>
                                                  <Button variant="ghost" size="icon" className="h-7 w-7"><Undo2 className="h-4 w-4" /></Button>
                                              </TooltipTrigger><TooltipContent><p>Reverse Entry</p></TooltipContent></Tooltip>
                                              <Tooltip><TooltipTrigger asChild>
                                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                              </TooltipTrigger><TooltipContent><p>Delete Entry</p></TooltipContent></Tooltip>
                                          </div>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                             <TableRow className={cn(isEven ? 'bg-muted/30' : 'bg-transparent', "hover:bg-muted/60", "border-x border-b-2 border-primary")}>
                                <TableCell colSpan={4} className="py-1 px-2 text-xs italic text-muted-foreground">
                                    (Narration: {entry.description})
                                </TableCell>
                            </TableRow>
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
              </Table>
              </div>
          
          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:hidden">
              {paginatedData.map(entry => (
                  <JournalEntryCard key={entry.id} entry={entry} density={density} onViewClick={() => setViewingEntry(entry)} />
              ))}
          </div>
          <JournalEntryVoucherDialog entry={viewingEntry} onOpenChange={(open) => !open && setViewingEntry(null)} />
        </CardContent>
        <CardFooter>
          <div className="flex items-center justify-between flex-wrap gap-4 w-full">
              <div className="flex items-center gap-4">
                  <p className="text-sm text-muted-foreground">
                  Page {page + 1} of {totalPages}
                  </p>
                  <div className="flex items-center space-x-2">
                  <p className="text-sm text-muted-foreground">Rows per page:</p>
                  <Select
                      value={rowsPerPageSelection}
                      onValueChange={handleRowsPerPageChange}
                  >
                      <SelectTrigger className="w-[80px]">
                      <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="all">All</SelectItem>
                      </SelectContent>
                  </Select>
                  </div>
              </div>
              {totalPages > 1 && (
                  <div className="flex items-center space-x-1">
                  <Button variant="outline" size="icon" onClick={() => setPage(0)} disabled={page === 0}>
                      <span className="sr-only">Go to first page</span>
                      <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
                      <span className="sr-only">Go to previous page</span>
                      <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  {getPaginationButtons()}

                  <Button variant="outline" size="icon" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
                      <span className="sr-only">Go to next page</span>
                      <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1}>
                      <span className="sr-only">Go to last page</span>
                      <ChevronsRight className="h-4 w-4" />
                  </Button>
                  </div>
              )}
          </div>
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
}
