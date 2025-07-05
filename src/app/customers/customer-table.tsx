
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Mail, MoreVertical, Phone, Send, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Filter as FilterIcon, Columns, GripVertical, Download, Users, FileWarning, Landmark } from "lucide-react";
import { format } from "date-fns";
import { cn, formatCurrency } from "@/lib/utils";
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { SummaryCard } from '@/app/sales-invoices/summary-card';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';


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
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    
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

    const paginatedData = React.useMemo(() => {
        const start = page * rowsPerPage;
        const end = start + rowsPerPage;
        return filteredData.slice(start, end);
    }, [filteredData, page, rowsPerPage]);

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);

    const summaryStats = React.useMemo(() => {
        const totalCustomers = data.length;
        const totalBalanceDue = data.reduce((acc, customer) => acc + customer.balanceDue, 0);
        const overdueAccounts = data.filter(c => c.balanceDue > 0).length;
        const b2bCustomers = data.filter(c => c.gstin !== '-').length;

        return { totalCustomers, totalBalanceDue, overdueAccounts, b2bCustomers };
    }, [data]);
    
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
                    <TableHead>Customer Name</TableHead>
                    <TableHead>GSTIN</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-right">Balance Due</TableHead>
                    <TableHead>Last Transaction</TableHead>
                    <TableHead>Place of Supply</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {paginatedData.map((customer) => (
                    <TableRow key={customer.id}>
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
         <CardContent className="flex items-center justify-end space-x-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                Next
              </Button>
            </CardContent>
        </Card>
    </div>
  );
}

