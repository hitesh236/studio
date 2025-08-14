
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
import { formatCurrency, cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Edit,
  Trash2,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MobileStockCard = ({ item }: { item: StockItem }) => (
    <Card>
        <CardHeader className="p-4 flex flex-row items-center justify-between">
            <div>
                <CardTitle className="text-base">{item.productName}</CardTitle>
                <p className="text-sm text-muted-foreground">{item.sku}</p>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </CardHeader>
        <CardContent className="p-4 pt-0 text-sm space-y-2">
            <div className="flex justify-between">
                <span className="text-muted-foreground">Stock on Hand</span>
                <span className="font-semibold">{item.stockInHand} {item.uom}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-muted-foreground">Purchase Price</span>
                <span className="font-mono">{formatCurrency(item.purchasePrice, 'INR')}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-muted-foreground">Selling Price</span>
                <span className="font-mono">{formatCurrency(item.sellingPrice, 'INR')}</span>
            </div>
             <div className="flex justify-between">
                <span className="text-muted-foreground">Location</span>
                <span>{item.location}</span>
            </div>
        </CardContent>
    </Card>
);


export function StockListTable({ data }: { data: StockItem[] }) {
    const [filter, setFilter] = React.useState('');
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState("10");

    const filteredData = React.useMemo(() => {
        return data.filter(item =>
            item.productName.toLowerCase().includes(filter.toLowerCase()) ||
            item.sku.toLowerCase().includes(filter.toLowerCase()) ||
            item.category.toLowerCase().includes(filter.toLowerCase()) ||
            item.location.toLowerCase().includes(filter.toLowerCase())
        );
    }, [data, filter]);

    const totalPages = Math.ceil(filteredData.length / Number(rowsPerPage === 'all' ? filteredData.length : rowsPerPage));

    const paginatedData = React.useMemo(() => {
        if (rowsPerPage === 'all') return filteredData;
        const start = page * Number(rowsPerPage);
        const end = start + Number(rowsPerPage);
        return filteredData.slice(start, end);
    }, [filteredData, page, rowsPerPage]);

    return (
        <div className="space-y-4">
             <div className="flex items-center justify-between">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Filter stock..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product Name</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Stock on Hand</TableHead>
                            <TableHead className="text-right">Purchase Price</TableHead>
                            <TableHead className="text-right">Selling Price</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.map(item => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.productName}</TableCell>
                                <TableCell>{item.sku}</TableCell>
                                <TableCell>{item.category}</TableCell>
                                <TableCell className="text-right font-semibold">{item.stockInHand} {item.uom}</TableCell>
                                <TableCell className="text-right font-mono">{formatCurrency(item.purchasePrice, 'INR')}</TableCell>
                                <TableCell className="text-right font-mono">{formatCurrency(item.sellingPrice, 'INR')}</TableCell>
                                <TableCell>{item.location}</TableCell>
                                <TableCell className="text-center">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            
            {/* Mobile Card View */}
            <div className="grid gap-4 md:hidden">
                {paginatedData.map((item) => (
                    <MobileStockCard key={item.id} item={item} />
                ))}
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
    )
}
