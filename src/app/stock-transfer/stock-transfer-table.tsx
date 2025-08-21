
'use client';

import * as React from 'react';
import type { StockTransfer } from './data';
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
import { Search, ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { columns } from './columns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ExpandedRowContent = ({ items }: { items: StockTransfer['items'] }) => {
    return (
        <div className="p-4 bg-muted/50">
            <h4 className="font-semibold mb-2">Transferred Items:</h4>
            <div className="rounded-md border bg-background">
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product Name</TableHead>
                            <TableHead className="text-right">Quantity</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell>{item.productName}</TableCell>
                                <TableCell className="text-right">{item.quantity}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

export function StockTransferTable({ data }: { data: StockTransfer[] }) {
  const [filter, setFilter] = React.useState('');
  const [sortConfig, setSortConfig] = React.useState<{ key: keyof StockTransfer | null; direction: 'ascending' | 'descending' }>({ key: 'date', direction: 'descending' });
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState("10");
  const [expandedRows, setExpandedRows] = React.useState<Set<string>>(new Set());

  const toggleRowExpansion = (id: string) => {
    setExpandedRows(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        return newSet;
    })
  };

  const filteredData = React.useMemo(() => {
    return data.filter(transfer =>
      transfer.transferNumber.toLowerCase().includes(filter.toLowerCase()) ||
      transfer.fromLocation.toLowerCase().includes(filter.toLowerCase()) ||
      transfer.toLocation.toLowerCase().includes(filter.toLowerCase()) ||
      transfer.status.toLowerCase().includes(filter.toLowerCase())
    );
  }, [data, filter]);

  const sortedData = React.useMemo(() => {
    const dataToSort = [...filteredData];
    if (sortConfig.key) {
      dataToSort.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof StockTransfer];
        const bValue = b[sortConfig.key as keyof StockTransfer];
        
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

  const requestSort = (key: keyof StockTransfer) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
        direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const tableColumns = columns({ sortConfig, requestSort, expandedRows, toggleRowExpansion });

  return (
    <div className="space-y-4">
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Filter transfers..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {tableColumns.map(col => <TableHead key={String(col.accessor)}>{col.header}</TableHead>)}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map(transfer => (
              <React.Fragment key={transfer.id}>
                <TableRow>
                    {tableColumns.map(col => <TableCell key={String(col.accessor)}>{col.cell(transfer)}</TableCell>)}
                </TableRow>
                {expandedRows.has(transfer.id) && (
                    <TableRow>
                        <TableCell colSpan={tableColumns.length}>
                            <ExpandedRowContent items={transfer.items} />
                        </TableCell>
                    </TableRow>
                )}
              </React.Fragment>
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
