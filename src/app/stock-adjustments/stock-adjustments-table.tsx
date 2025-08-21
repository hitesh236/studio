
'use client';

import * as React from 'react';
import type { StockAdjustment } from './data';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, MoreHorizontal, ArrowUp, ArrowDown, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type ColumnProps = {
  sortConfig: { key: keyof StockAdjustment | null; direction: 'ascending' | 'descending' };
  requestSort: (key: keyof StockAdjustment) => void;
};

const columns = ({ sortConfig, requestSort }: ColumnProps) => {
  const getSortableHeader = (title: string, key: keyof StockAdjustment) => {
    const isSorted = sortConfig.key === key;
    return (
      <Button variant="ghost" onClick={() => requestSort(key)}>
        {title}
        {isSorted && (sortConfig.direction === 'ascending' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />)}
      </Button>
    );
  };

  return [
    { accessor: 'adjustmentNumber', header: getSortableHeader('Number', 'adjustmentNumber'), cell: (row: StockAdjustment) => <p className="font-medium">{row.adjustmentNumber}</p> },
    { accessor: 'date', header: getSortableHeader('Date', 'date'), cell: (row: StockAdjustment) => format(row.date, 'dd MMM, yyyy') },
    { accessor: 'reason', header: getSortableHeader('Reason', 'reason'), cell: (row: StockAdjustment) => <Badge variant="outline">{row.reason}</Badge> },
    { accessor: 'itemsAdjusted', header: getSortableHeader('Items Adjusted', 'itemsAdjusted'), cell: (row: StockAdjustment) => <p className="text-center">{row.itemsAdjusted}</p> },
    { accessor: 'adjustedBy', header: getSortableHeader('Adjusted By', 'adjustedBy'), cell: (row: StockAdjustment) => row.adjustedBy },
    {
      accessor: 'actions',
      header: 'Actions',
      cell: (row: StockAdjustment) => (
        <div className="text-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
};

export function StockAdjustmentsTable({ data }: { data: StockAdjustment[] }) {
  const [filter, setFilter] = React.useState('');
  const [sortConfig, setSortConfig] = React.useState<{ key: keyof StockAdjustment | null; direction: 'ascending' | 'descending' }>({ key: 'date', direction: 'descending' });

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
            {sortedData.map(adj => (
              <TableRow key={adj.id}>
                {tableColumns.map(col => <TableCell key={col.accessor}>{col.cell(adj)}</TableCell>)}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
