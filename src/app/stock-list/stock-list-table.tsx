
'use client';

import * as React from 'react';
import type { StockItem } from './data';
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight, ListFilter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { columns } from './stock-list-columns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export function StockListTable({ data }: { data: StockItem[] }) {
  const [filter, setFilter] = React.useState('');
  const [sortConfig, setSortConfig] = React.useState<{ key: keyof StockItem | null; direction: 'ascending' | 'descending' }>({ key: 'productName', direction: 'ascending' });
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState("10");

  const [categoryFilter, setCategoryFilter] = React.useState<string[]>([]);
  const [statusFilter, setStatusFilter] = React.useState<string[]>([]);
  
  const uniqueCategories = React.useMemo(() => Array.from(new Set(data.map(item => item.category))), [data]);
  const uniqueStatuses = React.useMemo(() => Array.from(new Set(data.map(item => item.status))), [data]);

  const filteredData = React.useMemo(() => {
    return data.filter(item =>
      (item.productName.toLowerCase().includes(filter.toLowerCase()) ||
       item.sku.toLowerCase().includes(filter.toLowerCase())) &&
      (categoryFilter.length === 0 || categoryFilter.includes(item.category)) &&
      (statusFilter.length === 0 || statusFilter.includes(item.status))
    );
  }, [data, filter, categoryFilter, statusFilter]);

  const sortedData = React.useMemo(() => {
    const dataToSort = [...filteredData];
    if (sortConfig.key) {
      dataToSort.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof StockItem];
        const bValue = b[sortConfig.key as keyof StockItem];
        
        if (aValue === undefined || aValue === null) return 1;
        if (bValue === undefined || bValue === null) return -1;

        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
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

  const requestSort = (key: keyof StockItem) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const tableColumns = columns({ sortConfig, requestSort });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter by name or SKU..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        <ListFilter className="mr-2 h-4 w-4" />
                        Category
                        {categoryFilter.length > 0 && <Badge variant="secondary" className="ml-2">{categoryFilter.length}</Badge>}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {uniqueCategories.map(cat => (
                         <DropdownMenuCheckboxItem key={cat} checked={categoryFilter.includes(cat)} onCheckedChange={(checked) => {
                            setCategoryFilter(prev => checked ? [...prev, cat] : prev.filter(c => c !== cat))
                         }}>
                            {cat}
                        </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        <ListFilter className="mr-2 h-4 w-4" />
                        Status
                         {statusFilter.length > 0 && <Badge variant="secondary" className="ml-2">{statusFilter.length}</Badge>}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {uniqueStatuses.map(status => (
                         <DropdownMenuCheckboxItem key={status} checked={statusFilter.includes(status)} onCheckedChange={(checked) => {
                            setStatusFilter(prev => checked ? [...prev, status] : prev.filter(s => s !== status))
                         }}>
                            {status}
                        </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {tableColumns.map(col => <TableHead key={String(col.accessor)}>{col.header}</TableHead>)}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map(item => (
              <TableRow key={item.id}>
                {tableColumns.map(col => <TableCell key={String(col.accessor)}>{col.cell(item)}</TableCell>)}
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
                <SelectTrigger className="w-[80px]"><SelectValue /></SelectTrigger>
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
              <Button variant="outline" size="icon" onClick={() => setPage(0)} disabled={page === 0}><ChevronsLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}><ChevronRight className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1}><ChevronsRight className="h-4 w-4" /></Button>
            </div>
          )}
        </div>
    </div>
  );
}
