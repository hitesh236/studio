
'use client';

import * as React from 'react';
import type { StockAdjustment } from './data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { columns } from './stock-adjustments-columns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function StockAdjustmentsTable({ data }: { data: StockAdjustment[] }) {
  const [filter, setFilter] = React.useState('');
  const [sortConfig, setSortConfig] = React.useState<{ key: keyof StockAdjustment | null; direction: 'ascending' | 'descending' }>({ key: 'date', direction: 'descending' });
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState("10");

  const filteredData = React.useMemo(() => {
    return data.filter(adj =>
      adj.adjustmentNumber.toLowerCase().includes(filter.toLowerCase()) ||
      adj.reason.toLowerCase().includes(filter.toLowerCase()) ||
      adj.adjustedBy.toLowerCase().includes(filter.toLowerCase())
    );
  }, [data, filter]);

  const sortedData = React.useMemo(() => {
    const dataToSort = [...filteredData];
    if (sortConfig.key) {
      dataToSort.sort((a, b) => {
        if (a[sortConfig.key!] < b[sortConfig.key!]) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (a[sortConfig.key!] > b[sortConfig.key!]) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return dataToSort;
  }, [filteredData, sortConfig]);
  
  const totalPages = Math.ceil(sortedData.length / Number(rowsPerPage === 'all' ? sortedData.length : rowsPerPage));

  const paginatedData = React.useMemo(() => {
    if (rowsPerPage === 'all') return sortedData;
    const start = page * Number(rowsPerPage);
    const end = start + Number(rowsPerPage);
    return sortedData.slice(start, end);
  }, [sortedData, page, rowsPerPage]);

  const requestSort = (key: keyof StockAdjustment) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
        direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const tableColumns = columns({ sortConfig, requestSort });

  return (
    <div className="space-y-4">
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Filter adjustments..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {tableColumns.map(col => <TableHead key={col.accessor}>{col.header}</TableHead>)}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map(adj => (
              <TableRow key={adj.id}>
                {tableColumns.map(col => <TableCell key={col.accessor}>{col.cell(adj)}</TableCell>)}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
       <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Page {page + 1} of {totalPages}
            </p>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-muted-foreground">Rows:</p>
              <Select value={rowsPerPage} onValueChange={setRowsPerPage}>
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
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1}>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
    </div>
  );
}
