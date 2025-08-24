
'use client';

import * as React from 'react';
import type { PurchaseBill } from "./data";
import { useMemo, useState } from "react";
import { FileWarning, CircleDollarSign, TrendingDown, Search, Filter as FilterIcon, Columns, Calendar as CalendarIcon, X, Download } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from '@/lib/utils';
import { SummaryCard } from '@/app/sales-invoices/summary-card';
import { columns } from './columns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';
import { Separator } from '../ui/separator';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

export function PurchaseTable({ data }: { data: PurchaseBill[] }) {
  const [filter, setFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: "ascending" | "descending";
  }>({ key: null, direction: 'ascending' });
  const [date, setDate] = React.useState<DateRange | undefined>();

  const summaryStats = useMemo(() => {
    const totalPayable = data.reduce((acc, bill) => acc + bill.amountDue, 0);
    const overdueAmount = data.filter(b => b.paymentStatus === 'Overdue').reduce((acc, bill) => acc + bill.amountDue, 0);
    const dueThisMonth = data.filter(b => b.dueDate.getMonth() === new Date().getMonth()).reduce((acc, bill) => acc + bill.amountDue, 0);
    return { totalPayable, overdueAmount, dueThisMonth };
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter(bill => 
      (bill.vendorName.toLowerCase().includes(filter.toLowerCase()) ||
      bill.billNumber.toLowerCase().includes(filter.toLowerCase()) ||
      bill.paymentStatus.toLowerCase().includes(filter.toLowerCase())) &&
      (!date?.from || bill.billDate >= date.from) &&
      (!date?.to || new Date(bill.billDate.setHours(23, 59, 59, 999)) >= date.to)
    );
  }, [data, filter, date]);

  const requestSort = (key: string) => {
    let newKey: string | null = key;
    let direction: 'ascending' | 'descending' = 'ascending';

    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
        direction = 'descending';
    } else if (sortConfig.key === key) {
        newKey = null;
    }
    setSortConfig({ key: newKey, direction });
  };
  
  const sortedData = useMemo(() => {
    const dataToSort = [...filteredData];
    if (sortConfig.key) {
      dataToSort.sort((a, b) => {
        const key = sortConfig.key as keyof PurchaseBill;
        let valA = a[key];
        let valB = b[key];

        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;
        
        if (key === 'billDate' || key === 'dueDate') {
            valA = (valA as Date).getTime();
            valB = (valB as Date).getTime();
        }

        if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return dataToSort;
  }, [filteredData, sortConfig]);

  const tableColumns = useMemo(() => columns({ sortConfig, requestSort }), [sortConfig, requestSort]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          title="Total Payables"
          value={formatCurrency(summaryStats.totalPayable, 'INR')}
          icon={CircleDollarSign}
          variant="primary"
        />
        <SummaryCard
          title="Overdue Payables"
          value={formatCurrency(summaryStats.overdueAmount, 'INR')}
          icon={FileWarning}
        />
        <SummaryCard
          title="Due This Month"
          value={formatCurrency(summaryStats.dueThisMonth, 'INR')}
          icon={TrendingDown}
        />
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
            <div className="relative w-full md:max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Filter by vendor, bill #..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="pl-10"
                />
            </div>
            <Popover>
                <PopoverTrigger asChild>
                <Button id="date" variant={"outline"} className={cn("w-auto justify-start text-left font-normal", !date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (date.to ? <>{format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}</> : format(date.from, "LLL dd, y")) : <span>Filter by date</span>}
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar initialFocus mode="range" defaultMonth={date?.from} selected={date} onSelect={setDate} numberOfMonths={2} />
                </PopoverContent>
            </Popover>
             {date && <Button variant="ghost" size="icon" onClick={() => setDate(undefined)}><X className="h-4 w-4"/></Button>}
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="icon"><FilterIcon className="h-4 w-4"/></Button>
            <Button variant="outline" size="icon"><Columns className="h-4 w-4"/></Button>
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                        <Download className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem>PDF</DropdownMenuItem>
                    <DropdownMenuItem>Excel</DropdownMenuItem>
                    <DropdownMenuItem>CSV</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {tableColumns.map(col => (
                <TableHead key={String(col.accessor)}>{col.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map(bill => (
              <TableRow key={bill.id}>
                {tableColumns.map(col => (
                  <TableCell key={String(col.accessor)}>{col.cell(bill)}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
