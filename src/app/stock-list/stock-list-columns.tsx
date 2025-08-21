
'use client';

import * as React from 'react';
import type { StockItem } from './data';
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
import { Search, MoreHorizontal, ArrowUp, ArrowDown, Edit, Trash2, History } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

type ColumnProps = {
  sortConfig: { key: keyof StockItem | null; direction: 'ascending' | 'descending' };
  requestSort: (key: keyof StockItem) => void;
};

export const columns = ({ sortConfig, requestSort }: ColumnProps) => {
  const getSortableHeader = (title: string, key: keyof StockItem) => {
    const isSorted = sortConfig.key === key;
    return (
      <Button variant="ghost" onClick={() => requestSort(key)}>
        {title}
        {isSorted && (sortConfig.direction === 'ascending' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />)}
      </Button>
    );
  };

  const getStatusVariant = (status: StockItem['status']): 'default' | 'destructive' | 'secondary' => {
    switch(status) {
      case 'In Stock': return 'default';
      case 'Low Stock': return 'secondary';
      case 'Out of Stock': return 'destructive';
      default: return 'default';
    }
  }

  return [
    { accessor: 'productName', header: getSortableHeader('Product Name', 'productName'), cell: (row: StockItem) => (
        <p className="font-medium">
             <Link href={`/stock-history?product=${encodeURIComponent(row.productName)}`} className="hover:underline text-primary">
                {row.productName}
            </Link>
        </p>
    ) },
    { accessor: 'sku', header: getSortableHeader('SKU', 'sku'), cell: (row: StockItem) => row.sku },
    { accessor: 'category', header: getSortableHeader('Category', 'category'), cell: (row: StockItem) => row.category },
    { accessor: 'stockInHand', header: getSortableHeader('Stock on Hand', 'stockInHand'), cell: (row: StockItem) => <p className="text-right font-mono">{row.stockInHand} {row.uom}</p> },
    { accessor: 'purchasePrice', header: getSortableHeader('Purchase Price', 'purchasePrice'), cell: (row: StockItem) => <p className="text-right font-mono">{formatCurrency(row.purchasePrice, 'INR')}</p> },
    { accessor: 'sellingPrice', header: getSortableHeader('Selling Price', 'sellingPrice'), cell: (row: StockItem) => <p className="text-right font-mono">{formatCurrency(row.sellingPrice, 'INR')}</p> },
    { accessor: 'status', header: getSortableHeader('Status', 'status'), cell: (row: StockItem) => <Badge variant={getStatusVariant(row.status)}>{row.status}</Badge> },
    { accessor: 'expiryDate', header: getSortableHeader('Expiry Date', 'expiryDate'), cell: (row: StockItem) => row.expiryDate ? format(row.expiryDate, 'dd MMM, yyyy') : '-' },
    {
      accessor: 'actions',
      header: 'Actions',
      cell: (row: StockItem) => (
         <TooltipProvider>
            <div className="text-center">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem asChild><Link href="/products/new"><Edit className="mr-2 h-4 w-4" /> Edit</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href={`/stock-history?product=${encodeURIComponent(row.productName)}`}><History className="mr-2 h-4 w-4" /> View History</Link></DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </TooltipProvider>
      ),
    },
  ];
};
