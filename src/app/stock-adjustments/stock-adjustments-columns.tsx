
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

export const columns = ({ sortConfig, requestSort }: ColumnProps) => {
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
