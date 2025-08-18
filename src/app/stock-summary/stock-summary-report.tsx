
'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Download, Printer, Search, ChevronRight, ChevronDown, MapPin } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import Link from 'next/link';

import { cn, formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import type { StockSummaryRow } from './data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const companyDetails = {
    name: 'Hicks Inc.',
    address: '123 Business Rd, Financial District, Mumbai, Maharashtra, 400001',
};

export function StockSummaryReport({ data }: { data: StockSummaryRow[] }) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(2025, 7, 11), // August 11, 2025
    to: new Date(2025, 7, 18),   // August 18, 2025
  });
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortConfig, setSortConfig] = React.useState<{ key: keyof StockSummaryRow | null, direction: 'ascending' | 'descending' }>({ key: 'commodityName', direction: 'ascending'});
  const [expandedCategories, setExpandedCategories] = React.useState<Set<string>>(new Set(data.map(item => item.category)));
  const [valuationMethod, setValuationMethod] = React.useState('standard');
  const [location, setLocation] = React.useState('all');

  const uniqueLocations = React.useMemo(() => ['all', ...Array.from(new Set(data.map(item => item.location)))], [data]);

  const filteredAndSortedData = React.useMemo(() => {
    let filtered = data;

    if (location !== 'all') {
        filtered = filtered.filter(item => item.location === location);
    }
    
    if (searchTerm) {
        filtered = filtered.filter(item => 
            item.commodityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.commodityCode.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    if (sortConfig.key) {
        filtered.sort((a, b) => {
            const aValue = a[sortConfig.key as keyof StockSummaryRow];
            const bValue = b[sortConfig.key as keyof StockSummaryRow];

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortConfig.direction === 'ascending' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            }
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                 return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
            }
            return 0;
        });
    }

    return filtered;
  }, [data, searchTerm, sortConfig, location]);
  
  const groupedData = React.useMemo(() => {
    return filteredAndSortedData.reduce((acc, row) => {
        const category = row.category || 'Uncategorized';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(row);
        return acc;
    }, {} as Record<string, StockSummaryRow[]>);
  }, [filteredAndSortedData]);
  
  React.useEffect(() => {
    // Expand all categories by default when data loads
    setExpandedCategories(new Set(Object.keys(groupedData)));
  }, [data]); // Re-run only when original data changes


  const requestSort = (key: keyof StockSummaryRow) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
        direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
        const newSet = new Set(prev);
        if (newSet.has(category)) {
            newSet.delete(category);
        } else {
            newSet.add(category);
        }
        return newSet;
    });
  };

  const calculateTotals = (rows: StockSummaryRow[]) => {
      return rows.reduce(
        (acc, row) => {
            acc.openingQty += row.openingStock.quantity;
            acc.openingAmt += row.openingStock.amount;
            acc.importQty += row.importInPeriod.quantity;
            acc.importAmt += row.importInPeriod.amount;
            acc.exportQty += row.exportInPeriod.quantity;
            acc.exportAmt += row.exportInPeriod.amount;
            acc.closingQty += row.closingStock.quantity;
            acc.closingAmt += row.closingStock.amount;
            return acc;
        }, { openingQty: 0, openingAmt: 0, importQty: 0, importAmt: 0, exportQty: 0, exportAmt: 0, closingQty: 0, closingAmt: 0 }
      );
  };
  
  const grandTotals = calculateTotals(data);

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="text-center">
          <CardTitle className="text-2xl">STOCK SUMMARY REPORT</CardTitle>
          <CardDescription>
            {companyDetails.name}, {companyDetails.address}
          </CardDescription>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Filter by name or code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>
            <div className="flex flex-wrap gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                    <Button id="date" variant="outline" className={cn('w-full sm:w-auto justify-start text-left font-normal', !date && 'text-muted-foreground')}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (date.to ? <>{format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}</> : format(date.from, 'LLL dd, y')) : <span>Pick a date</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                    <Calendar initialFocus mode="range" defaultMonth={date?.from} selected={date} onSelect={setDate} numberOfMonths={2} />
                    </PopoverContent>
                </Popover>
                 <Select onValueChange={setLocation} value={location}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <MapPin className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Filter by location" />
                    </SelectTrigger>
                    <SelectContent>
                        {uniqueLocations.map(loc => (
                            <SelectItem key={loc} value={loc}>
                                {loc === 'all' ? 'All Locations' : loc}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                 <Select onValueChange={setValuationMethod} defaultValue={valuationMethod}>
                    <SelectTrigger className="w-full sm:w-[220px]">
                        <SelectValue placeholder="Valuation Method" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="standard">Standard Costing</SelectItem>
                        <SelectItem value="fifo" disabled>FIFO (First-In, First-Out)</SelectItem>
                        <SelectItem value="weighted_average" disabled>Weighted Average</SelectItem>
                    </SelectContent>
                </Select>
                <Button variant="outline" size="icon"><Printer className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon"><Download className="h-4 w-4" /></Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead colSpan={4} className="text-center">Item Details</TableHead>
                <TableHead colSpan={2} className="text-center">Opening Stock</TableHead>
                <TableHead colSpan={2} className="text-center">Stock In</TableHead>
                <TableHead colSpan={2} className="text-center">Stock Out</TableHead>
                <TableHead colSpan={2} className="text-center">Closing Stock</TableHead>
              </TableRow>
              <TableRow>
                <TableHead><Button variant="ghost" onClick={() => requestSort('commodityName')}>Name</Button></TableHead>
                <TableHead><Button variant="ghost" onClick={() => requestSort('commodityCode')}>Code</Button></TableHead>
                <TableHead><Button variant="ghost" onClick={() => requestSort('unitName')}>Unit</Button></TableHead>
                <TableHead />
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(groupedData).map(([category, items]) => {
                const isExpanded = expandedCategories.has(category);
                const categoryTotals = calculateTotals(items);
                return (
                    <React.Fragment key={category}>
                        <TableRow className="bg-muted/50 hover:bg-muted/80 font-bold cursor-pointer" onClick={() => toggleCategory(category)}>
                            <TableCell colSpan={4}>
                                <div className="flex items-center gap-2">
                                     {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                    {category}
                                </div>
                            </TableCell>
                            <TableCell className="text-right font-mono">{categoryTotals.openingQty}</TableCell>
                            <TableCell className="text-right font-mono">{formatCurrency(categoryTotals.openingAmt, 'INR')}</TableCell>
                            <TableCell className="text-right font-mono bg-green-50 dark:bg-green-900/20">{categoryTotals.importQty}</TableCell>
                            <TableCell className="text-right font-mono bg-green-50 dark:bg-green-900/20">{formatCurrency(categoryTotals.importAmt, 'INR')}</TableCell>
                            <TableCell className="text-right font-mono bg-red-50 dark:bg-red-900/20">{categoryTotals.exportQty}</TableCell>
                            <TableCell className="text-right font-mono bg-red-50 dark:bg-red-900/20">{formatCurrency(categoryTotals.exportAmt, 'INR')}</TableCell>
                            <TableCell className="text-right font-mono">{categoryTotals.closingQty}</TableCell>
                            <TableCell className="text-right font-mono">{formatCurrency(categoryTotals.closingAmt, 'INR')}</TableCell>
                        </TableRow>
                        {isExpanded && items.map((row) => (
                            <TableRow key={row.commodityCode}>
                                <TableCell className="pl-8"><Link href={`/stock-history?product=${encodeURIComponent(row.commodityName)}`} className="hover:underline text-primary">{row.commodityName}</Link></TableCell>
                                <TableCell>{row.commodityCode}</TableCell>
                                <TableCell>{row.unitName}</TableCell>
                                <TableCell />
                                <TableCell className="text-right font-mono">{row.openingStock.quantity}</TableCell>
                                <TableCell className="text-right font-mono">{formatCurrency(row.openingStock.amount, 'INR')}</TableCell>
                                <TableCell className="text-right font-mono bg-green-50 dark:bg-green-900/20">{row.importInPeriod.quantity}</TableCell>
                                <TableCell className="text-right font-mono bg-green-50 dark:bg-green-900/20">{formatCurrency(row.importInPeriod.amount, 'INR')}</TableCell>
                                <TableCell className="text-right font-mono bg-red-50 dark:bg-red-900/20">{row.exportInPeriod.quantity}</TableCell>
                                <TableCell className="text-right font-mono bg-red-50 dark:bg-red-900/20">{formatCurrency(row.exportInPeriod.amount, 'INR')}</TableCell>
                                <TableCell className="text-right font-mono">{row.closingStock.quantity}</TableCell>
                                <TableCell className="text-right font-mono">{formatCurrency(row.closingStock.amount, 'INR')}</TableCell>
                            </TableRow>
                        ))}
                    </React.Fragment>
                )
              })}
            </TableBody>
            <TableFooter>
                <TableRow>
                    <TableCell colSpan={4} className="text-right font-bold">Grand Total :</TableCell>
                    <TableCell className="text-right font-bold font-mono">{grandTotals.openingQty}</TableCell>
                    <TableCell className="text-right font-bold font-mono">{formatCurrency(grandTotals.openingAmt, 'INR')}</TableCell>
                    <TableCell className="text-right font-bold font-mono bg-green-50 dark:bg-green-900/20">{grandTotals.importQty}</TableCell>
                    <TableCell className="text-right font-bold font-mono bg-green-50 dark:bg-green-900/20">{formatCurrency(grandTotals.importAmt, 'INR')}</TableCell>
                    <TableCell className="text-right font-bold font-mono bg-red-50 dark:bg-red-900/20">{grandTotals.exportQty}</TableCell>
                    <TableCell className="text-right font-bold font-mono bg-red-50 dark:bg-red-900/20">{formatCurrency(grandTotals.exportAmt, 'INR')}</TableCell>
                    <TableCell className="text-right font-bold font-mono">{grandTotals.closingQty}</TableCell>
                    <TableCell className="text-right font-bold font-mono">{formatCurrency(grandTotals.closingAmt, 'INR')}</TableCell>
                </TableRow>
            </TableFooter>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
