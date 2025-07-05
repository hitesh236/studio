
'use client';

import * as React from 'react';
import type { Customer } from "./data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { Mail, MoreVertical, Phone, Send, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download, Users, FileWarning, Landmark, ArrowUp, ArrowDown, Columns, GripVertical } from "lucide-react";
import { format } from "date-fns";
import { cn, formatCurrency } from "@/lib/utils";
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { SummaryCard } from '@/app/sales-invoices/summary-card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ALL_COLUMNS = [
    { id: 'name', label: 'Customer Name' },
    { id: 'gstin', label: 'GSTIN' },
    { id: 'contact', label: 'Contact' },
    { id: 'balanceDue', label: 'Balance Due' },
    { id: 'lastTransaction', label: 'Last Transaction' },
    { id: 'placeOfSupply', label: 'Place of Supply' },
    { id: 'actions', label: 'Actions' },
];

const MobileCustomerCard = ({ customer }: { customer: Customer }) => {
    return (
        <Card>
            <CardHeader className="p-4">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-base">{customer.name}</CardTitle>
                        <CardDescription>{customer.gstin}</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View</DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        {customer.balanceDue > 0 && (
                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                                <Send className="mr-2 h-4 w-4" />
                                Remind
                            </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-sm">
                <Separator className="mb-4" />
                <div className="flex justify-between items-center mb-4">
                     <div className="flex flex-col gap-1">
                      {customer.contact.phone && (
                        <span className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {customer.contact.phone}
                        </span>
                      )}
                      {customer.contact.email && (
                        <span className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          {customer.contact.email}
                        </span>
                      )}
                    </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <div className="space-y-1">
                        <p className="text-muted-foreground">Balance Due</p>
                        <p className={cn(
                            "font-mono font-semibold",
                            customer.balanceDue > 0 ? "text-destructive" : "text-green-600"
                        )}>
                            {formatCurrency(customer.balanceDue, 'INR')}
                        </p>
                    </div>
                    <div className="space-y-1 text-right">
                        <p className="text-muted-foreground">Last Transaction</p>
                        <p className="font-mono">{format(customer.lastTransaction, "dd-MMM-yy")}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};


export function CustomerTable({ data }: { data: Customer[] }) {
    const [filter, setFilter] = React.useState('');
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState("10");
    const [density, setDensity] = React.useState<'normal' | 'compact'>('normal');
    const [sortConfig, setSortConfig] = React.useState<{
        key: keyof Customer | 'name' | null;
        direction: 'ascending' | 'descending';
    }>({ key: null, direction: 'ascending' });
    
    const [columnVisibility, setColumnVisibility] = React.useState<Set<string>>(
        new Set(ALL_COLUMNS.map(c => c.id))
    );
    const [columnOrder, setColumnOrder] = React.useState<string[]>(
        ALL_COLUMNS.map(c => c.id)
    );
    const draggedColumn = React.useRef<string | null>(null);
    const [dragOverColumn, setDragOverColumn] = React.useState<string | null>(null);
    
    const filteredData = React.useMemo(() => {
        if (!filter) return data;
        const lowercasedFilter = filter.toLowerCase();
        return data.filter(customer =>
            customer.name.toLowerCase().includes(lowercasedFilter) ||
            customer.gstin.toLowerCase().includes(lowercasedFilter) ||
            customer.contact.email?.toLowerCase().includes(lowercasedFilter) ||
            customer.contact.phone?.toLowerCase().includes(lowercasedFilter) ||
            customer.placeOfSupply.state.toLowerCase().includes(lowercasedFilter)
        );
    }, [data, filter]);

    const sortedData = React.useMemo(() => {
        const dataToSort = [...filteredData];
        if (sortConfig.key) {
            dataToSort.sort((a, b) => {
                const { key, direction } = sortConfig;
                if (a[key as keyof Customer] < b[key as keyof Customer]) {
                    return direction === 'ascending' ? -1 : 1;
                }
                if (a[key as keyof Customer] > b[key as keyof Customer]) {
                    return direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return dataToSort;
    }, [filteredData, sortConfig]);

    const paginatedData = React.useMemo(() => {
        if (rowsPerPage === 'all') return sortedData;
        const start = page * Number(rowsPerPage);
        const end = start + Number(rowsPerPage);
        return sortedData.slice(start, end);
    }, [sortedData, page, rowsPerPage]);

    const totalPages = Math.ceil(sortedData.length / Number(rowsPerPage === 'all' ? sortedData.length : rowsPerPage));

    const summaryStats = React.useMemo(() => {
        const totalCustomers = data.length;
        const totalBalanceDue = data.reduce((acc, customer) => acc + customer.balanceDue, 0);
        const overdueAccounts = data.filter(c => c.balanceDue > 0).length;
        const b2bCustomers = data.filter(c => c.gstin !== '-').length;

        return { totalCustomers, totalBalanceDue, overdueAccounts, b2bCustomers };
    }, [data]);
    
    const requestSort = (key: keyof Customer | 'name') => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortableHeader = (title: string, key: keyof Customer | 'name') => {
        const isSorted = sortConfig.key === key;
        return (
          <Button variant="ghost" onClick={() => requestSort(key)}>
            {title}
            {isSorted ? (
              sortConfig.direction === 'ascending' ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : (
                <ArrowDown className="ml-2 h-4 w-4" />
              )
            ) : null}
          </Button>
        );
    };
    
    const getPaginationButtons = () => {
        if (totalPages <= 1) return null;

        const pageNumbers: (number | string)[] = [];
        if (totalPages <= 7) {
            for (let i = 0; i < totalPages; i++) pageNumbers.push(i);
        } else {
            pageNumbers.push(0);
            if (page > 2) pageNumbers.push('...');
            
            const startPage = Math.max(1, page - 1);
            const endPage = Math.min(totalPages - 2, page + 1);

            for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);

            if (page < totalPages - 3) pageNumbers.push('...');
            pageNumbers.push(totalPages - 1);
        }

        const uniquePageNumbers = [...new Set(pageNumbers)];

        return uniquePageNumbers.map((p, index) =>
            typeof p === 'number' ? (
                <Button key={`${p}-${index}`} variant={page === p ? 'default' : 'outline'} size="icon" onClick={() => setPage(p)} className="h-9 w-9">
                {p + 1}
                </Button>
            ) : (
                <span key={`dots-${index}`} className="flex h-9 w-9 items-center justify-center">...</span>
            )
        );
    };

    const handleDragStart = (e: React.DragEvent, columnId: string) => {
        draggedColumn.current = columnId;
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, columnId: string) => {
        e.preventDefault();
        if (draggedColumn.current && columnId !== draggedColumn.current) {
            setDragOverColumn(columnId);
        }
    };
        
    const handleDragLeave = (e: React.DragEvent) => {
        setDragOverColumn(null);
    };

    const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
        e.preventDefault();
        if (!draggedColumn.current || draggedColumn.current === targetColumnId) return;

        const newOrder = [...columnOrder];
        const draggedIndex = newOrder.indexOf(draggedColumn.current);
        const targetIndex = newOrder.indexOf(targetColumnId);
        
        if (draggedIndex > -1) {
            const [removed] = newOrder.splice(draggedIndex, 1);
            newOrder.splice(targetIndex, 0, removed);
        }
        
        setColumnOrder(newOrder);
        draggedColumn.current = null;
        setDragOverColumn(null);
    };

    const handleDragEnd = () => {
        draggedColumn.current = null;
        setDragOverColumn(null);
    };
    
    const visibleColumns = React.useMemo(() => {
        return ALL_COLUMNS.filter(c => columnVisibility.has(c.id)).sort((a, b) => {
            return columnOrder.indexOf(a.id) - columnOrder.indexOf(b.id);
        });
    }, [columnVisibility, columnOrder]);


  return (
    <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SummaryCard icon={Users} title="Total Customers" value={summaryStats.totalCustomers.toString()} variant="primary" />
            <SummaryCard icon={Landmark} title="Total Due" value={formatCurrency(summaryStats.totalBalanceDue, 'INR')} />
            <SummaryCard icon={FileWarning} title="Overdue Accounts" value={summaryStats.overdueAccounts.toString()} />
            <SummaryCard icon={Landmark} title="B2B Customers" value={summaryStats.b2bCustomers.toString()} />
        </div>
        <Card>
        <CardHeader>
             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <CardTitle>Customers</CardTitle>
                    <CardDescription>A list of your B2B and B2C customers.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                     <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Filter customers..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="pl-10 w-full sm:w-64"
                      />
                    </div>
                    <div className="hidden sm:flex items-center space-x-2">
                        <Switch id="density-mode" checked={density === "compact"} onCheckedChange={(checked) => setDensity(checked ? "compact" : "normal")} />
                        <Label htmlFor="density-mode">Compact</Label>
                    </div>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                            <Columns className="h-4 w-4" />
                            <span className="sr-only">Toggle Columns</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-64" align="end" onMouseLeave={() => setDragOverColumn(null)}>
                        <DropdownMenuLabel>Toggle & Reorder</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <div className="flex flex-col gap-1 p-1">
                            {columnOrder.map((columnId) => {
                                const column = ALL_COLUMNS.find((c) => c.id === columnId)!;
                                return (
                                    <div
                                    key={column.id}
                                    draggable={column.id !== 'actions'}
                                    onDragStart={(e) => handleDragStart(e, column.id)}
                                    onDragOver={(e) => handleDragOver(e, column.id)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, column.id)}
                                    onDragEnd={handleDragEnd}
                                    className={cn(
                                        "flex items-center p-2 rounded-md transition-all text-sm",
                                        column.id !== 'actions' && "cursor-grab active:cursor-grabbing",
                                        draggedColumn.current === column.id && "opacity-50",
                                        dragOverColumn === column.id && draggedColumn.current !== column.id && "bg-accent/50"
                                    )}
                                    >
                                    <GripVertical className={cn("h-5 w-5 text-muted-foreground mr-2 shrink-0", column.id === 'actions' && "opacity-0")} />
                                    <span className="flex-grow">{column.label}</span>
                                    <Switch
                                        checked={columnVisibility.has(column.id)}
                                        onCheckedChange={(checked) => {
                                        const newVisibility = new Set(columnVisibility);
                                        if (checked) newVisibility.add(column.id);
                                        else newVisibility.delete(column.id);
                                        setColumnVisibility(newVisibility);
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        disabled={column.id === 'name'}
                                        className="h-5 w-9 shrink-0 [&>span]:h-4 [&>span]:w-4 [&>span[data-state=checked]]:translate-x-4 [&>span[data-state=unchecked]]:translate-x-0"
                                    />
                                    </div>
                                );
                            })}
                        </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="outline" size="icon">
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Export</span>
                    </Button>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            {/* Desktop Table */}
            <div className="hidden md:block rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        {visibleColumns.map(column => (
                            <TableHead key={column.id} className={cn(column.id === 'balanceDue' && 'text-right')}>
                                {column.id === 'actions' ? (
                                    <span className="flex justify-center">{column.label}</span>
                                ) : (
                                    getSortableHeader(column.label, column.id as keyof Customer)
                                )}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                {paginatedData.map((customer) => (
                    <TableRow key={customer.id} className={cn(density === 'compact' && 'h-10')}>
                         {visibleColumns.map(column => (
                            <TableCell key={column.id}>
                                {(() => {
                                    switch (column.id) {
                                        case 'name': return <span className="font-medium">{customer.name}</span>;
                                        case 'gstin': return <span className="font-mono">{customer.gstin}</span>;
                                        case 'contact': return (
                                            <div className="flex flex-col gap-1">
                                                {customer.contact.phone && (
                                                    <span className="flex items-center gap-2 text-sm"><Phone className="h-3 w-3 text-muted-foreground" />{customer.contact.phone}</span>
                                                )}
                                                {customer.contact.email && (
                                                    <span className="flex items-center gap-2 text-sm"><Mail className="h-3 w-3 text-muted-foreground" />{customer.contact.email}</span>
                                                )}
                                            </div>
                                        );
                                        case 'balanceDue': return (
                                            <span className={cn("text-right font-mono block", customer.balanceDue > 0 ? "text-destructive" : "text-green-600")}>
                                                {formatCurrency(customer.balanceDue, 'INR')}
                                            </span>
                                        );
                                        case 'lastTransaction': return <span>{format(customer.lastTransaction, "dd-MMM-yyyy")}</span>;
                                        case 'placeOfSupply': return <span>{customer.placeOfSupply.code} ({customer.placeOfSupply.abbr})</span>;
                                        case 'actions': return (
                                            <div className="text-center">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>View</DropdownMenuItem>
                                                        <DropdownMenuItem>Edit</DropdownMenuItem>
                                                        {customer.balanceDue > 0 && (
                                                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                                                                <Send className="mr-2 h-4 w-4" />
                                                                Remind
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        );
                                        default: return null;
                                    }
                                })()}
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </div>

            {/* Mobile View */}
            <div className="grid gap-4 md:hidden">
                {paginatedData.map((customer) => (
                    <MobileCustomerCard key={customer.id} customer={customer} />
                ))}
            </div>
        </CardContent>
         <CardContent className="flex items-center justify-between flex-wrap gap-4 py-4">
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
                  {getPaginationButtons()}
                  <Button variant="outline" size="icon" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}><ChevronRight className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1}><ChevronsRight className="h-4 w-4" /></Button>
                  </div>
              )}
            </CardContent>
        </Card>
    </div>
  );
}
