
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Mail, MoreVertical, Phone, Send, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download, Users, FileWarning, Landmark, ArrowUp, ArrowDown } from "lucide-react";
import { format } from "date-fns";
import { cn, formatCurrency } from "@/lib/utils";
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { SummaryCard } from '@/app/sales-invoices/summary-card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


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
                    <TableHead>{getSortableHeader('Customer Name', 'name')}</TableHead>
                    <TableHead>{getSortableHeader('GSTIN', 'gstin')}</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-right">{getSortableHeader('Balance Due', 'balanceDue')}</TableHead>
                    <TableHead>{getSortableHeader('Last Transaction', 'lastTransaction')}</TableHead>
                    <TableHead>{getSortableHeader('Place of Supply', 'placeOfSupply')}</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {paginatedData.map((customer) => (
                    <TableRow key={customer.id} className={cn(density === 'compact' && 'h-10')}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell className="font-mono">{customer.gstin}</TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell className={cn(
                        "text-right font-mono",
                        customer.balanceDue > 0 ? "text-destructive" : "text-green-600"
                    )}>
                        {formatCurrency(customer.balanceDue, 'INR')}
                    </TableCell>
                    <TableCell>{format(customer.lastTransaction, "dd-MMM-yyyy")}</TableCell>
                    <TableCell>{customer.placeOfSupply.code} ({customer.placeOfSupply.abbr})</TableCell>
                    <TableCell className="text-center">
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
                    </TableCell>
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
