
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
import { Search, MoreHorizontal, ArrowUp, ArrowDown, Edit, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

type ColumnProps = {
  sortConfig: { key: keyof StockAdjustment | null; direction: 'ascending' | 'descending' };
  requestSort: (key: keyof StockAdjustment) => void;
  expandedRows: Set<string>;
  toggleRowExpansion: (id: string) => void;
};

export const columns = ({ sortConfig, requestSort, expandedRows, toggleRowExpansion }: ColumnProps) => {
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
    { 
        accessor: 'expander',
        header: '',
        cell: (row: StockAdjustment) => (
             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleRowExpansion(row.id)}>
                {expandedRows.has(row.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
        )
    },
    { 
        accessor: 'adjustmentNumber', 
        header: getSortableHeader('Number', 'adjustmentNumber'), 
        cell: (row: StockAdjustment) => (
            <p className="font-medium cursor-pointer text-primary hover:underline" onClick={() => toggleRowExpansion(row.id)}>
                {row.adjustmentNumber}
            </p>
        )
    },
    { accessor: 'date', header: getSortableHeader('Date', 'date'), cell: (row: StockAdjustment) => format(row.date, 'dd MMM, yyyy') },
    { accessor: 'reason', header: getSortableHeader('Reason', 'reason'), cell: (row: StockAdjustment) => <Badge variant="outline">{row.reason}</Badge> },
    { 
        accessor: 'itemsAdjusted', 
        header: getSortableHeader('items', 'items'), 
        cell: (row: StockAdjustment) => <p className="text-center">{row.items.length}</p> 
    },
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
              <DropdownMenuItem asChild>
                <Link href={`/stock-adjustments/new?data=${encodeURIComponent(JSON.stringify(row))}`}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
};
