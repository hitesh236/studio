
'use client';

import * as React from 'react';
import type { StockHistoryEntry } from './data';
import { format } from 'date-fns';
import { cn, formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowDown, ArrowUp, Calendar as CalendarIcon, MapPin } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { DateRange } from 'react-day-picker';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter
} from "@/components/ui/table";


interface StockHistoryViewProps {
  data: StockHistoryEntry[];
  viewMode: 'all' | 'in' | 'out';
}

const StockTable = ({ title, data, type }: { title: string, data: StockHistoryEntry[], type: 'in' | 'out' }) => {
    const totalQuantity = data.reduce((sum, entry) => sum + entry.quantity, 0);
    const quantityHeader = type === 'in' ? 'Stock In' : 'Stock Out';

    return (
        <Card>
            <CardHeader className="p-4">
                <CardTitle className="text-xl">{title}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[40px]">#</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">{quantityHeader}</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Invoice/Ref No.</TableHead>
                                <TableHead>{type === 'in' ? 'Supplier/Client' : 'Client/Supplier'}</TableHead>
                                <TableHead>Location</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((entry, index) => (
                                <TableRow key={entry.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{format(entry.date, 'dd MMM, yyyy')}</TableCell>
                                    <TableCell className="text-right font-mono">{entry.quantity}</TableCell>
                                    <TableCell className="text-right font-mono">{formatCurrency(entry.price, 'INR')}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{entry.type}</Badge>
                                    </TableCell>
                                    <TableCell>
                                      <Link href="#" className="text-primary hover:underline">{entry.referenceId}</Link>
                                    </TableCell>
                                    <TableCell>{entry.supplierOrClient}</TableCell>
                                    <TableCell>{entry.location}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={7} className="text-right font-bold">Total Quantity</TableCell>
                                <TableCell className="text-right font-bold text-lg font-mono">{totalQuantity}</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}

const CombinedStockTable = ({ data }: { data: StockHistoryEntry[] }) => {
    let runningStock = 0;
    const avgPurchasePrice = data.find(e => e.type === 'Purchase')?.price || 750;

    const processedData = data.map(entry => {
        runningStock += entry.quantity;
        let profit = 0;
        if (entry.type === 'Invoice') {
            profit = (entry.price - avgPurchasePrice) * Math.abs(entry.quantity);
        }
        return { ...entry, runningStock, profit };
    });

    const totalIn = data.filter(e => e.quantity > 0).reduce((sum, e) => sum + e.quantity, 0);
    const totalOut = data.filter(e => e.quantity < 0).reduce((sum, e) => sum + e.quantity, 0);
    const totalProfit = processedData.reduce((sum, e) => sum + e.profit, 0);
    
    return (
        <Card>
            <CardHeader className="p-4">
                <CardTitle className="text-xl">Combined Stock Ledger</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Invoice/Ref No.</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="text-right">In</TableHead>
                                <TableHead className="text-right">Out</TableHead>
                                <TableHead className="text-right">Balance</TableHead>
                                <TableHead>Location</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {processedData.map(entry => {
                                const isStockIn = entry.quantity > 0;
                                return (
                                    <TableRow key={entry.id}>
                                        <TableCell>{format(entry.date, 'dd MMM, yyyy')}</TableCell>
                                        <TableCell>
                                            <Badge variant={isStockIn ? 'secondary' : 'destructive'} className="whitespace-nowrap">
                                                {isStockIn ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                                                {entry.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                          <Link href="#" className="text-primary hover:underline">{entry.referenceId}</Link>
                                        </TableCell>
                                        <TableCell className="text-right font-mono">{formatCurrency(entry.price, 'INR')}</TableCell>
                                        <TableCell className="text-right font-mono text-green-600">{isStockIn ? entry.quantity : '-'}</TableCell>
                                        <TableCell className="text-right font-mono text-red-600">{!isStockIn ? Math.abs(entry.quantity) : '-'}</TableCell>
                                        <TableCell className="text-right font-bold font-mono">{entry.runningStock}</TableCell>
                                        <TableCell>{entry.location}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                         <TableFooter>
                            <TableRow>
                                <TableCell colSpan={4} className="text-right font-bold">Total</TableCell>
                                <TableCell className="text-right font-bold text-lg font-mono text-green-600">{totalIn}</TableCell>
                                <TableCell className="text-right font-bold text-lg font-mono text-red-600">{Math.abs(totalOut)}</TableCell>
                                <TableCell className="text-right font-bold text-lg font-mono">{runningStock}</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell colSpan={7} className="text-right font-bold">Estimated Profit</TableCell>
                                <TableCell className="text-right font-bold text-lg font-mono text-green-600">{formatCurrency(totalProfit, 'INR')}</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};


export function StockHistoryView({ data, viewMode }: StockHistoryViewProps) {
  const [date, setDate] = React.useState<DateRange | undefined>();
  const [location, setLocation] = React.useState<string>('all');
  
  const uniqueLocations = React.useMemo(() => ['all', ...Array.from(new Set(data.map(item => item.location)))], [data]);
  
  const filteredData = React.useMemo(() => {
    return data.filter(entry => {
        const matchesDate =
            (!date?.from || entry.date >= date.from) &&
            (!date?.to || new Date(entry.date.setHours(23, 59, 59, 999)) >= date.to);
        const matchesLocation = location === 'all' || entry.location === location;
        return matchesDate && matchesLocation;
    });
  }, [data, date, location]);

  const stockInData = React.useMemo(() => filteredData.filter(e => e.quantity > 0), [filteredData]);
  const stockOutData = React.useMemo(() => filteredData.filter(e => e.quantity < 0).map(e => ({ ...e, quantity: Math.abs(e.quantity) })), [filteredData]);

  const renderContent = () => {
    if (viewMode === 'in') {
      return <StockTable title="Stock In" data={stockInData} type="in" />;
    }
  
    if (viewMode === 'out') {
      return <StockTable title="Stock Out" data={stockOutData} type="out" />;
    }
  
    return <CombinedStockTable data={filteredData} />;
  }
  
  return (
    <div className="space-y-4">
        <Card>
            <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                     <Popover>
                        <PopoverTrigger asChild>
                        <Button id="date" variant={"outline"} className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date?.from ? (date.to ? <>{format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}</> : format(date.from, "LLL dd, y")) : <span>Filter by date</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar initialFocus mode="range" defaultMonth={date?.from} selected={date} onSelect={setDate} numberOfMonths={2} />
                        </PopoverContent>
                    </Popover>
                </div>
                 <div className="flex-1">
                    <Select onValueChange={setLocation} value={location}>
                        <SelectTrigger className="w-full">
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
                 </div>
            </CardContent>
        </Card>
        {renderContent()}
    </div>
  );
}
