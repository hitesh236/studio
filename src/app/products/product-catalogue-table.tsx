
'use client';

import * as React from 'react';
import type { StockItem } from '@/app/stock-list/data';
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Search, ListFilter, Edit, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export function ProductCatalogueTable({ data }: { data: StockItem[] }) {
  const [filter, setFilter] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState<string[]>([]);
  const [statusFilter, setStatusFilter] = React.useState<string[]>([]);
  
  const uniqueCategories = React.useMemo(() => Array.from(new Set(data.map(item => item.category))), [data]);
  const uniqueStatuses = React.useMemo(() => ['Active', 'Inactive'] as const, []);

  const filteredData = React.useMemo(() => {
    return data.filter(item =>
      (item.productName.toLowerCase().includes(filter.toLowerCase()) ||
       item.sku.toLowerCase().includes(filter.toLowerCase()) ||
       (item.brand || '').toLowerCase().includes(filter.toLowerCase())) &&
      (categoryFilter.length === 0 || categoryFilter.includes(item.category)) &&
      (statusFilter.length === 0 || statusFilter.includes(item.status))
    );
  }, [data, filter, categoryFilter, statusFilter]);

  const getStatusVariant = (status: StockItem['status']): "default" | "outline" => {
      return status === 'Active' ? 'default' : 'outline';
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter by name, SKU, brand..."
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
                     <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                    <DropdownMenuSeparator />
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
                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
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
              <TableHead>Product Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead className="text-right">Selling Price</TableHead>
              <TableHead className="text-right">Cost Price</TableHead>
              <TableHead>Tax Rate</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map(item => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.productName}</TableCell>
                <TableCell>{item.sku}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.brand}</TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(item.sellingPrice, 'INR')}</TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(item.purchasePrice, 'INR')}</TableCell>
                <TableCell>{item.defaultTaxRate}%</TableCell>
                <TableCell><Badge variant={getStatusVariant(item.status)}>{item.status}</Badge></TableCell>
                <TableCell className="text-center">
                   <Button variant="ghost" size="icon" asChild>
                        <Link href="/products/new">
                            <Edit className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
