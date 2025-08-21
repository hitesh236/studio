
'use client';

import * as React from 'react';
import type { StockTransfer } from './data';
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, ArrowUp, ArrowDown, Edit, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

type ColumnProps = {
  sortConfig: { key: keyof StockTransfer | null; direction: 'ascending' | 'descending' };
  requestSort: (key: keyof StockTransfer) => void;
  expandedRows: Set<string>;
  toggleRowExpansion: (id: string) => void;
};

const getStatusVariant = (status: StockTransfer['status']) => {
    switch (status) {
        case 'Completed': return 'default';
        case 'In Transit': return 'secondary';
        case 'Cancelled': return 'destructive';
        case 'Pending':
        default: return 'outline';
    }
};

export const columns = ({ sortConfig, requestSort, expandedRows, toggleRowExpansion }: ColumnProps) => {
  const getSortableHeader = (title: string, key: keyof StockTransfer) => {
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
        cell: (row: StockTransfer) => (
             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleRowExpansion(row.id)}>
                {expandedRows.has(row.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
        )
    },
    { 
        accessor: 'transferNumber', 
        header: getSortableHeader('Number', 'transferNumber'), 
        cell: (row: StockTransfer) => (
            <p className="font-medium cursor-pointer text-primary hover:underline" onClick={() => toggleRowExpansion(row.id)}>
                {row.transferNumber}
            </p>
        )
    },
    { accessor: 'date', header: getSortableHeader('Date', 'date'), cell: (row: StockTransfer) => format(row.date, 'dd MMM, yyyy') },
    { accessor: 'fromLocation', header: getSortableHeader('From', 'fromLocation'), cell: (row: StockTransfer) => row.fromLocation },
    { accessor: 'toLocation', header: getSortableHeader('To', 'toLocation'), cell: (row: StockTransfer) => row.toLocation },
    { 
        accessor: 'items', 
        header: getSortableHeader('items', 'items'), 
        cell: (row: StockTransfer) => <p className="text-center">{row.items.length}</p> 
    },
    { accessor: 'initiatedBy', header: getSortableHeader('Initiated By', 'initiatedBy'), cell: (row: StockTransfer) => row.initiatedBy },
    {
      accessor: 'actions',
      header: 'Actions',
      cell: (row: StockTransfer) => (
        <div className="text-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link href={`/stock-transfer/new?data=${encodeURIComponent(JSON.stringify(row))}`}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Cancel</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
};
