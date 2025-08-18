
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem
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
  Columns,
  GripVertical,
  Filter,
  Tag,
  X,
  ArrowUp,
  ArrowDown,
  MapPin
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

const ALL_COLUMNS = [
    { id: 'productName', label: 'Product Name' },
    { id: 'sku', label: 'SKU' },
    { id: 'category', label: 'Category' },
    { id: 'stockInHand', label: 'Stock on Hand' },
    { id: 'purchasePrice', label: 'Purchase Price' },
    { id: 'sellingPrice', label: 'Selling Price' },
    { id: 'location', label: 'Location' },
    { id: 'actions', label: 'Actions' },
];

const availableFilters = [
    { id: "category", label: "Category" },
    { id: "location", label: "Location" },
];

const MobileStockCard = ({ item }: { item: StockItem }) => (
    <Card>
        <CardHeader className="p-4 flex flex-row items-center justify-between">
            <div>
                <CardTitle className="text-base"><Link href={`/stock-history?product=${encodeURIComponent(item.productName)}`} className="hover:underline">{item.productName}</Link></CardTitle>
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
    const [density, setDensity] = React.useState<'normal' | 'compact'>('normal');
    const [sortConfig, setSortConfig] = React.useState<{ key: keyof StockItem | null; direction: 'ascending' | 'descending' }>({ key: null, direction: 'ascending' });
    
    const [columnVisibility, setColumnVisibility] = React.useState<Set<string>>(new Set(ALL_COLUMNS.map(c => c.id)));
    const [columnOrder, setColumnOrder] = React.useState<string[]>(ALL_COLUMNS.map(c => c.id));
    const draggedColumn = React.useRef<string | null>(null);
    const [dragOverColumn, setDragOverColumn] = React.useState<string | null>(null);
    
    const [activeFilters, setActiveFilters] = React.useState<Set<string>>(new Set());
    const [filterValues, setFilterValues] = React.useState({ categories: [] as string[], locations: [] as string[] });

    const uniqueCategories = React.useMemo(() => Array.from(new Set(data.map(item => item.category))), [data]);
    const uniqueLocations = React.useMemo(() => Array.from(new Set(data.map(item => item.location))), [data]);

    const filteredData = React.useMemo(() => {
        let baseData = data.filter(item =>
            item.productName.toLowerCase().includes(filter.toLowerCase()) ||
            item.sku.toLowerCase().includes(filter.toLowerCase())
        );

        if (activeFilters.has("category") && filterValues.categories.length > 0) {
            baseData = baseData.filter(item => filterValues.categories.includes(item.category));
        }
        if (activeFilters.has("location") && filterValues.locations.length > 0) {
            baseData = baseData.filter(item => filterValues.locations.includes(item.location));
        }

        return baseData;
    }, [data, filter, activeFilters, filterValues]);
    
    const sortedData = React.useMemo(() => {
        const dataToSort = [...filteredData];
        if (sortConfig.key) {
            dataToSort.sort((a, b) => {
                const { key, direction } = sortConfig;
                if (a[key] < b[key]) return direction === 'ascending' ? -1 : 1;
                if (a[key] > b[key]) return direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return dataToSort;
    }, [filteredData, sortConfig]);

    const totalPages = Math.ceil(sortedData.length / Number(rowsPerPage === 'all' ? sortedData.length : rowsPerPage));

    const paginatedData = React.useMemo(() => {
        if (rowsPerPage === 'all') return sortedData;
        const start = page * Number(rowsPerPage);
        const end = start + Number(rowsPerPage);
        return sortedData.slice(start, end);
    }, [sortedData, page, rowsPerPage]);

    const requestSort = (key: keyof StockItem) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        let newKey: keyof StockItem | null = key;

        if (sortConfig.key === key) {
            if (sortConfig.direction === 'ascending') direction = 'descending';
            else newKey = null;
        }
        setSortConfig({ key: newKey, direction });
    };

    const getSortableHeader = (title: string, key: keyof StockItem) => {
        const isSorted = sortConfig.key === key;
        return (
          <Button variant="ghost" onClick={() => requestSort(key)} className={cn(isSorted && "bg-accent hover:bg-accent")}>
            {title}
            {isSorted && (sortConfig.direction === 'ascending' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />)}
          </Button>
        );
    };

    const toggleFilter = (filterId: string) => {
        setActiveFilters(prev => {
            const newSet = new Set(prev);
            if (newSet.has(filterId)) newSet.delete(filterId);
            else newSet.add(filterId);
            return newSet;
        });
        setPage(0);
    };

    const removeFilter = (filterId: string) => {
        setActiveFilters(prev => {
            const newSet = new Set(prev);
            newSet.delete(filterId);
            return newSet;
        });
        if (filterId === 'category') setFilterValues(prev => ({ ...prev, categories: [] }));
        if (filterId === 'location') setFilterValues(prev => ({ ...prev, locations: [] }));
        setPage(0);
    };
    
    const handleDragStart = (e: React.DragEvent, columnId: string) => {
        draggedColumn.current = columnId;
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, columnId: string) => {
        e.preventDefault();
        if (draggedColumn.current && columnId !== draggedColumn.current) setDragOverColumn(columnId);
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
        return ALL_COLUMNS.filter(c => columnVisibility.has(c.id)).sort((a, b) => columnOrder.indexOf(a.id) - columnOrder.indexOf(b.id));
    }, [columnVisibility, columnOrder]);
    
    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Filter stock..." value={filter} onChange={(e) => setFilter(e.target.value)} className="pl-10" />
                </div>
                <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild><Button variant="outline" size="icon"><Filter className="h-4 w-4"/></Button></PopoverTrigger>
                        <PopoverContent className="w-56 p-4" align="end">
                            <div className="space-y-4">
                                <h4 className="font-medium leading-none">Add Filters</h4>
                                <div className="space-y-2">
                                    {availableFilters.map(f => (
                                        <div key={f.id} className="flex items-center space-x-2"><Checkbox id={f.id} checked={activeFilters.has(f.id)} onCheckedChange={() => toggleFilter(f.id)}/><Label htmlFor={f.id}>{f.label}</Label></div>
                                    ))}
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                    <Switch id="density-mode" checked={density === "compact"} onCheckedChange={(checked) => setDensity(checked ? "compact" : "normal")} />
                    <Label htmlFor="density-mode">Compact</Label>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="outline" size="icon"><Columns className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent className="w-64" align="end" onMouseLeave={() => setDragOverColumn(null)}>
                        <DropdownMenuLabel>Toggle & Reorder</DropdownMenuLabel><DropdownMenuSeparator />
                        <div className="flex flex-col gap-1 p-1">
                            {columnOrder.map(columnId => {
                                const column = ALL_COLUMNS.find(c => c.id === columnId)!;
                                return (
                                    <div key={column.id} draggable={column.id !== 'actions'} onDragStart={e => handleDragStart(e, column.id)} onDragOver={e => handleDragOver(e, column.id)} onDragLeave={handleDragEnd} onDrop={e => handleDrop(e, column.id)} onDragEnd={handleDragEnd} className={cn("flex items-center p-2 rounded-md transition-all text-sm", column.id !== 'actions' && "cursor-grab active:cursor-grabbing", draggedColumn.current === column.id && "opacity-50", dragOverColumn === column.id && draggedColumn.current !== column.id && "bg-accent/50")}>
                                    <GripVertical className={cn("h-5 w-5 text-muted-foreground mr-2 shrink-0", column.id === 'actions' && "opacity-0")} /><span className="flex-grow">{column.label}</span>
                                    <Switch checked={columnVisibility.has(column.id)} onCheckedChange={checked => { const newVisibility = new Set(columnVisibility); if (checked) newVisibility.add(column.id); else newVisibility.delete(column.id); setColumnVisibility(newVisibility); }} onClick={e => e.stopPropagation()} disabled={column.id === 'productName'} className="h-5 w-9 shrink-0 [&>span]:h-4 [&>span]:w-4 [&>span[data-state=checked]]:translate-x-4 [&>span[data-state=unchecked]]:translate-x-0"/>
                                    </div>
                                );
                            })}
                        </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {activeFilters.size > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                    {Array.from(activeFilters).map(filterId => {
                        if (filterId === 'category') {
                             return <div key={filterId} className="flex items-center gap-2"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" className="w-auto"><Tag className="mr-2 h-4 w-4" />Category<Separator orientation="vertical" className="mx-2 h-4 bg-border" />{filterValues.categories.length > 0 ? <Badge variant="secondary" className="rounded-sm px-1 font-normal">{filterValues.categories.length} selected</Badge> : <span className="text-muted-foreground">Any</span>}</Button></DropdownMenuTrigger><DropdownMenuContent className="w-56"><DropdownMenuLabel>Filter by Category</DropdownMenuLabel><DropdownMenuSeparator />{uniqueCategories.map(cat => <DropdownMenuCheckboxItem key={cat} checked={filterValues.categories.includes(cat)} onCheckedChange={checked => setFilterValues(prev => ({ ...prev, categories: checked ? [...prev.categories, cat] : prev.categories.filter(c => c !== cat) }))}>{cat}</DropdownMenuCheckboxItem>)}</DropdownMenuContent></DropdownMenu><Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeFilter(filterId)}><X className="h-4 w-4" /></Button></div>;
                        }
                        if (filterId === 'location') {
                            return <div key={filterId} className="flex items-center gap-2"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" className="w-auto"><MapPin className="mr-2 h-4 w-4" />Location<Separator orientation="vertical" className="mx-2 h-4 bg-border" />{filterValues.locations.length > 0 ? <Badge variant="secondary" className="rounded-sm px-1 font-normal">{filterValues.locations.length} selected</Badge> : <span className="text-muted-foreground">Any</span>}</Button></DropdownMenuTrigger><DropdownMenuContent className="w-56"><DropdownMenuLabel>Filter by Location</DropdownMenuLabel><DropdownMenuSeparator />{uniqueLocations.map(loc => <DropdownMenuCheckboxItem key={loc} checked={filterValues.locations.includes(loc)} onCheckedChange={checked => setFilterValues(prev => ({ ...prev, locations: checked ? [...prev.locations, loc] : prev.locations.filter(l => l !== loc) }))}>{loc}</DropdownMenuCheckboxItem>)}</DropdownMenuContent></DropdownMenu><Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeFilter(filterId)}><X className="h-4 w-4" /></Button></div>;
                        }
                        return null;
                    })}
                </div>
            )}

            {/* Desktop Table View */}
            <div className="hidden md:block rounded-md border">
                <Table>
                    <TableHeader><TableRow>{visibleColumns.map(column => (<TableHead key={column.id}>{getSortableHeader(column.label, column.id as keyof StockItem)}</TableHead>))}</TableRow></TableHeader>
                    <TableBody>
                        {paginatedData.map(item => (
                            <TableRow key={item.id} className={cn(density === 'compact' && 'h-10')}>
                                {visibleColumns.map(column => (
                                    <TableCell key={column.id} className={cn(density === 'compact' && 'py-1 px-2')}>
                                        {(() => {
                                            switch (column.id) {
                                                case 'productName': return <Link href={`/stock-history?product=${encodeURIComponent(item.productName)}`} className="font-medium hover:underline">{item.productName}</Link>;
                                                case 'sku': return item.sku;
                                                case 'category': return item.category;
                                                case 'stockInHand': return <span className="text-right font-semibold block">{item.stockInHand} {item.uom}</span>;
                                                case 'purchasePrice': return <span className="font-mono text-right block">{formatCurrency(item.purchasePrice, 'INR')}</span>;
                                                case 'sellingPrice': return <span className="font-mono text-right block">{formatCurrency(item.sellingPrice, 'INR')}</span>;
                                                case 'location': return item.location;
                                                case 'actions': return <div className="text-center"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem><DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div>;
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
            
            {/* Mobile Card View */}
            <div className="grid gap-4 md:hidden">
                {paginatedData.map((item) => <MobileStockCard key={item.id} item={item} />)}
            </div>

            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4"><p className="text-sm text-muted-foreground">Page {page + 1} of {totalPages}</p>
                  <div className="flex items-center space-x-2"><p className="text-sm text-muted-foreground">Rows:</p><Select value={rowsPerPage} onValueChange={setRowsPerPage}><SelectTrigger className="w-[80px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="10">10</SelectItem><SelectItem value="20">20</SelectItem><SelectItem value="50">50</SelectItem><SelectItem value="all">All</SelectItem></SelectContent></Select></div>
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
    );
}
