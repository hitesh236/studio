
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, differenceInDays } from 'date-fns';
import { generateStockListData, type StockItem } from '@/app/stock-list/data';
import { cn } from '@/lib/utils';
import { AlertTriangle, Download, Search } from 'lucide-react';
import Loading from '@/app/loading';

const ExpiryReportTable = ({ data }: { data: StockItem[] }) => {
    const [filter, setFilter] = React.useState('');
    const [daysFilter, setDaysFilter] = React.useState('all');
    const now = new Date();

    const filteredData = React.useMemo(() => {
        return data
            .filter(item => {
                if (!item.expiryDate) return false;
                const daysUntilExpiry = differenceInDays(item.expiryDate, now);
                if (daysUntilExpiry < 0) return false; // Already expired

                const matchesSearch = filter ? item.productName.toLowerCase().includes(filter.toLowerCase()) || item.sku.toLowerCase().includes(filter.toLowerCase()) : true;
                
                let matchesDays = true;
                if (daysFilter !== 'all') {
                    const days = parseInt(daysFilter);
                    matchesDays = daysUntilExpiry <= days;
                }

                return matchesSearch && matchesDays;
            })
            .sort((a, b) => (a.expiryDate?.getTime() || 0) - (b.expiryDate?.getTime() || 0));
    }, [data, filter, daysFilter, now]);
    
    const getStatusColor = (days: number) => {
        if (days <= 7) return 'bg-red-500/20 text-red-700 dark:text-red-300';
        if (days <= 30) return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300';
        return 'bg-green-500/20 text-green-700 dark:text-green-300';
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Filter products..." value={filter} onChange={e => setFilter(e.target.value)} className="pl-10" />
                </div>
                <Select value={daysFilter} onValueChange={setDaysFilter}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Filter by expiry" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Upcoming</SelectItem>
                        <SelectItem value="7">Expires in 7 Days</SelectItem>
                        <SelectItem value="15">Expires in 15 Days</SelectItem>
                        <SelectItem value="30">Expires in 30 Days</SelectItem>
                        <SelectItem value="60">Expires in 60 Days</SelectItem>
                    </SelectContent>
                </Select>
                 <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                </Button>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product Name</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Stock</TableHead>
                            <TableHead>Expiry Date</TableHead>
                            <TableHead className="text-center">Days to Expire</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length > 0 ? (
                            filteredData.map(item => {
                                const daysToExpiry = differenceInDays(item.expiryDate!, now);
                                return (
                                    <TableRow key={item.id} className={cn(daysToExpiry <= 7 && 'bg-red-500/10')}>
                                        <TableCell className="font-medium">{item.productName}</TableCell>
                                        <TableCell>{item.sku}</TableCell>
                                        <TableCell>{item.category}</TableCell>
                                        <TableCell className="text-right font-mono">{item.stockInHand} {item.uom}</TableCell>
                                        <TableCell>{format(item.expiryDate!, 'dd MMM, yyyy')}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge className={getStatusColor(daysToExpiry)}>{daysToExpiry} days</Badge>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No products nearing expiry for the selected criteria.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};


export default function ExpiryReportPage() {
    const [stockItems, setStockItems] = React.useState<StockItem[] | null>(null);

    React.useEffect(() => {
        // Generate a larger dataset to ensure there are expiring items
        const items = generateStockListData(100);
        setStockItems(items);
    }, []);

    if (!stockItems) {
        return <Loading />;
    }

    return (
        <div data-section="main-content" className="p-4 sm:p-6 lg:p-8">
            <Card>
                <CardHeader>
                    <CardTitle>Product Expiry Report</CardTitle>
                    <CardDescription>
                        Track products that are nearing their expiration date to manage inventory and reduce waste.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ExpiryReportTable data={stockItems} />
                </CardContent>
            </Card>
        </div>
    );
}
