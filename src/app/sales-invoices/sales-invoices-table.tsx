
"use client";

import type { SalesInvoice } from "./data";
import { useMemo, useState, useRef } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter as FilterIcon,
  X,
  Tag,
  Columns,
  GripVertical,
  TrendingUp,
  CircleDollarSign,
  FileWarning,
  CheckCircle2,
  Download,
  Landmark,
} from "lucide-react";
import Link from 'next/link';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { columns } from "./sales-invoices-columns";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { SummaryCard } from "./summary-card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from 'date-fns';

const availableFilters = [
  { id: "paymentStatus", label: "Payment Status" },
];

const ALL_COLUMNS = [
    { id: 'select', label: 'Select' },
    { id: 'invoiceNumber', label: 'Invoice Number' },
    { id: 'customerName', label: 'Customer Name' },
    { id: 'invoiceDate', label: 'Invoice Date' },
    { id: 'dueDate', label: 'Due Date' },
    { id: 'amountBase', label: 'Amount' },
    { id: 'paymentStatus', label: 'Payment Status' },
    { id: 'amountPaid', label: 'Paid' },
    { id: 'salesReturnAmount', label: 'Return' },
    { id: 'amountDue', label: 'Due' },
    { id: 'actions', label: 'Actions' },
  ];

const AddPaymentDialog = ({ 
    invoice, 
    isOpen, 
    onOpenChange,
    onPaymentSuccess
}: { 
    invoice: SalesInvoice | null, 
    isOpen: boolean, 
    onOpenChange: (open: boolean) => void,
    onPaymentSuccess: (invoiceId: string, paymentAmount: number) => void
}) => {
    const { toast } = useToast();
    const [amount, setAmount] = React.useState('');
    const [paymentMode, setPaymentMode] = React.useState('bank');

    React.useEffect(() => {
        if (invoice) {
            setAmount(invoice.amountDue.toString());
        } else {
            setAmount('');
        }
    }, [invoice]);

    if (!invoice) return null;

    const handleSave = () => {
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            toast({
                title: 'Invalid Amount',
                description: 'Please enter a valid payment amount.',
                variant: 'destructive',
            });
            return;
        }

        if (parsedAmount > invoice.amountDue) {
             toast({
                title: 'Invalid Amount',
                description: 'Payment cannot be more than the amount due.',
                variant: 'destructive',
            });
            return;
        }

        toast({
            title: "Payment Recorded",
            description: `Payment of ${formatCurrency(parsedAmount, 'INR')} for invoice ${invoice.invoiceNumber} has been recorded.`
        });
        onPaymentSuccess(invoice.id, parsedAmount);
        onOpenChange(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Payment for {invoice.invoiceNumber}</DialogTitle>
                    <DialogDescription>
                        Current amount due is {formatCurrency(invoice.amountDue, 'INR')}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">Amount</Label>
                        <Input
                            id="amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="col-span-3"
                            placeholder="Enter amount"
                        />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="payment-mode" className="text-right">Payment Mode</Label>
                        <Select onValueChange={setPaymentMode} defaultValue={paymentMode}>
                             <SelectTrigger id="payment-mode" className="col-span-3">
                                <SelectValue placeholder="Select a mode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="bank">Bank Transfer</SelectItem>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="upi">UPI</SelectItem>
                                <SelectItem value="cheque">Cheque</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleSave}>Save Payment</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export function SalesInvoicesTable({ data: initialData }: { data: SalesInvoice[] }) {
  const [data, setData] = useState<SalesInvoice[]>(initialData);
  const [filter, setFilter] = useState("");
  const [density, setDensity] = useState<"normal" | "compact">("normal");
  const [page, setPage] = useState(0);
  const [rowsPerPageSelection, setRowsPerPageSelection] = useState("10");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: "ascending" | "descending";
  }>({ key: null, direction: "ascending" });

  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [filterValues, setFilterValues] = useState<{
    paymentStatuses: string[];
  }>({
    paymentStatuses: [],
  });
  
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = React.useState(false);
  const [invoiceForPayment, setInvoiceForPayment] = React.useState<SalesInvoice | null>(null);

  const [columnVisibility, setColumnVisibility] = useState<Set<string>>(
    new Set(ALL_COLUMNS.map(c => c.id).filter(id => !['currencyCode', 'exchangeRate', 'amountForeign', 'totalTaxableValue', 'totalGstAmount', 'gstType', 'placeOfSupply', 'createdBy'].includes(id)))
  );
  const [columnOrder, setColumnOrder] = useState<string[]>(
    ALL_COLUMNS.map(c => c.id)
  );
  const draggedColumn = useRef<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const uniquePaymentStatuses = useMemo(() => Array.from(new Set(data.map((p) => p.paymentStatus))).sort(), [data]);

  const summaryStats = useMemo(() => {
    const totalSales = data.reduce((acc, inv) => acc + inv.amountBase, 0);
    const totalOutstanding = data
      .filter(inv => ['Outstanding', 'Partially Paid'].includes(inv.paymentStatus))
      .reduce((acc, inv) => acc + inv.amountDue, 0);
    const totalOverdue = data
      .filter(inv => inv.paymentStatus === 'Overdue')
      .reduce((acc, inv) => acc + inv.amountDue, 0);
    const totalGst = data.reduce((acc, inv) => acc + inv.totalGstAmount, 0);
    const paidInvoices = data.filter(inv => inv.paymentStatus === 'Paid').length;
    const totalInvoices = data.length;

    return {
      totalSales,
      totalOutstanding,
      totalOverdue,
      totalGst,
      paidInvoices,
      totalInvoices,
    };
  }, [data]);

  const filteredData = useMemo(() => {
    let results = data.filter((invoice) => {
      const searchTerm = filter.toLowerCase();
      return (
        invoice.invoiceNumber.toLowerCase().includes(searchTerm) ||
        invoice.customerName.toLowerCase().includes(searchTerm) ||
        invoice.paymentStatus.toLowerCase().includes(searchTerm)
      );
    });

    if (activeFilters.has("paymentStatus") && filterValues.paymentStatuses.length > 0) {
      results = results.filter((p) => filterValues.paymentStatuses.includes(p.paymentStatus));
    }
    
    return results;
  }, [data, filter, activeFilters, filterValues]);

  const requestSort = (key: string) => {
    let newKey: string | null = key;
    let direction: 'ascending' | 'descending' = 'ascending';

    if (sortConfig.key === key) {
        if (sortConfig.direction === 'ascending') {
            direction = 'descending';
        } else {
            newKey = null;
        }
    }
    
    setSortConfig({ key: newKey, direction });
    setPage(0);
  };

  const sortedData = useMemo(() => {
    const dataToSort = [...filteredData];
    if (sortConfig.key) {
      dataToSort.sort((a, b) => {
        const { key, direction } = sortConfig;
        
        let valA, valB;

        switch(key) {
            case 'invoiceDate':
            case 'dueDate':
                valA = a[key].getTime();
                valB = b[key].getTime();
                break;
            default:
                valA = (a as any)[key];
                valB = (b as any)[key];
        }

        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;
        
        if (valA < valB) {
            return direction === 'ascending' ? -1 : 1;
        }
        if (valA > valB) {
            return direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return dataToSort;
  }, [filteredData, sortConfig]);

  const totalPages = useMemo(() => {
    if (rowsPerPageSelection === "all" || sortedData.length === 0) {
      return 1;
    }
    return Math.ceil(sortedData.length / Number(rowsPerPageSelection));
  }, [sortedData.length, rowsPerPageSelection]);

  const paginatedData = useMemo(() => {
    if (rowsPerPageSelection === "all") {
      return sortedData;
    }
    const rpp = Number(rowsPerPageSelection);
    const start = page * rpp;
    const end = start + rpp;
    return sortedData.slice(start, end);
  }, [sortedData, page, rowsPerPageSelection]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
        setSelectedRows(new Set(paginatedData.map(row => row.id)));
    } else {
        setSelectedRows(new Set());
    }
  };

  const toggleRowSelection = (id: string) => {
      setSelectedRows(prev => {
          const newSet = new Set(prev);
          if (newSet.has(id)) {
              newSet.delete(id);
          } else {
              newSet.add(id);
          }
          return newSet;
      });
  };

  const setPageAndClearSelection = (p: number) => {
    setPage(p);
    setSelectedRows(new Set());
  }

  const handleRowsPerPageChange = (value: string) => {
    setRowsPerPageSelection(value);
    setPageAndClearSelection(0);
  };
  
  const handleAddPaymentClick = (invoice: SalesInvoice) => {
    setInvoiceForPayment(invoice);
    setIsPaymentDialogOpen(true);
  };

  const handlePaymentSuccess = (invoiceId: string, paymentAmount: number) => {
    setData(prevData =>
      prevData.map(inv => {
        if (inv.id === invoiceId) {
          const newAmountPaid = inv.amountPaid + paymentAmount;
          const newAmountDue = inv.amountDue - paymentAmount;
          let newStatus: SalesInvoice['paymentStatus'] = 'Partially Paid';
          if (newAmountDue <= 0.01) {
            newStatus = 'Paid';
          } else if (new Date() > inv.dueDate) {
            newStatus = 'Overdue';
          }

          return {
            ...inv,
            amountPaid: newAmountPaid,
            amountDue: newAmountDue,
            paymentStatus: newStatus,
          };
        }
        return inv;
      })
    );
  };

  const tableColumns = useMemo(() => {
    const allCols = columns({ 
      density, 
      sortConfig, 
      requestSort,
      selectedRows,
      onSelectAll: handleSelectAll,
      onSelectRow: toggleRowSelection,
      paginatedData,
      onAddPaymentClick: handleAddPaymentClick,
    });
    
    const visibleCols = allCols.filter(c => columnVisibility.has(c.accessor as string));
    
    visibleCols.sort((a, b) => {
        return columnOrder.indexOf(a.accessor as string) - columnOrder.indexOf(b.accessor as string);
    });

    return visibleCols;
  }, [density, sortConfig, requestSort, columnVisibility, columnOrder, selectedRows, paginatedData]);


  const getPaginationButtons = () => {
    if (totalPages <= 1) return null;

    const pageNumbers: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 0; i < totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(0);
      if (page > 2) {
        pageNumbers.push('...');
      }
      
      const startPage = Math.max(1, page - 1);
      const endPage = Math.min(totalPages - 2, page + 1);

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (page < totalPages - 3) {
        pageNumbers.push('...');
      }
      pageNumbers.push(totalPages - 1);
    }

    const uniquePageNumbers = [...new Set(pageNumbers)];

    return uniquePageNumbers.map((p, index) =>
      typeof p === 'number' ? (
        <Button
          key={`${p}-${index}`}
          variant={page === p ? 'default' : 'outline'}
          size="icon"
          onClick={() => setPageAndClearSelection(p)}
          className="h-9 w-9"
        >
          {p + 1}
        </Button>
      ) : (
        <span key={`dots-${index}`} className="flex h-9 w-9 items-center justify-center">
          ...
        </span>
      )
    );
  };

  const toggleFilter = (filterId: string) => {
    setActiveFilters(prev => {
        const newSet = new Set(prev);
        if (newSet.has(filterId)) {
            newSet.delete(filterId);
        } else {
            newSet.add(filterId);
        }
        return newSet;
    });
    setPageAndClearSelection(0);
  };

  const removeFilter = (filterId: string) => {
    setActiveFilters(prev => {
        const newSet = new Set(prev);
        newSet.delete(filterId);
        return newSet;
    });

    switch (filterId) {
        case 'paymentStatus':
            setFilterValues(prev => ({...prev, paymentStatuses: []}));
            break;
    }
    setPageAndClearSelection(0);
  };

  const handleDragStart = (e: React.DragEvent, columnId: string) => {
    draggedColumn.current = columnId;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (draggedColumn.current && columnId !== draggedColumn.current) {
        if (columnId !== dragOverColumn) {
            setDragOverColumn(columnId);
        }
    }
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    if (!draggedColumn.current || draggedColumn.current === targetColumnId) {
      return;
    }

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

  const renderActiveFilters = () => {
    return Array.from(activeFilters).map(filterId => {
        switch(filterId) {
            case 'paymentStatus':
                return (
                    <div key={filterId} className="flex items-center gap-2">
                        <DropdownMenu>
                             <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-auto">
                                    <Tag className="mr-2 h-4 w-4" />
                                    Payment Status
                                    <Separator orientation="vertical" className="mx-2 h-4 bg-border" />
                                    {filterValues.paymentStatuses.length > 0 ? (
                                        <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                                            {filterValues.paymentStatuses.length} selected
                                        </Badge>
                                    ) : (
                                        <span className="text-muted-foreground">Any</span>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56">
                                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {uniquePaymentStatuses.map(status => (
                                    <DropdownMenuCheckboxItem key={status} checked={filterValues.paymentStatuses.includes(status)} onCheckedChange={(checked) => {
                                        setFilterValues(prev => ({ ...prev, paymentStatuses: checked ? [...prev.paymentStatuses, status] : prev.paymentStatuses.filter(s => s !== status) }));
                                    }}>{status}</DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeFilter(filterId)}><X className="h-4 w-4" /></Button>
                    </div>
                );
            default:
                return null;
        }
    });
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <SummaryCard
            icon={TrendingUp}
            title="Total Sales (BCY)"
            value={formatCurrency(summaryStats.totalSales, 'INR')}
            variant="primary"
          />
          <SummaryCard
            icon={CircleDollarSign}
            title="Total Outstanding"
            value={formatCurrency(summaryStats.totalOutstanding, 'INR')}
          />
          <SummaryCard
            icon={FileWarning}
            title="Total Overdue"
            value={formatCurrency(summaryStats.totalOverdue, 'INR')}
          />
          <SummaryCard
            icon={CheckCircle2}
            title="Invoices Paid"
            value={`${summaryStats.paidInvoices} / ${summaryStats.totalInvoices}`}
          />
          <SummaryCard
            icon={Landmark}
            title="Total GST"
            value={formatCurrency(summaryStats.totalGst, 'INR')}
          />
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter invoices..."
                value={filter}
                onChange={(e) => {
                    setFilter(e.target.value);
                    setPageAndClearSelection(0);
                }}
                className="pl-10"
              />
            </div>
            {selectedRows.size > 0 && (
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">{selectedRows.size} selected</span>
                    <Select onValueChange={() => setSelectedRows(new Set())}>
                        <SelectTrigger className="w-[120px] h-9">
                            <SelectValue placeholder="Actions" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="paid">Mark as Paid</SelectItem>
                            <SelectItem value="delete">Delete</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="density-mode"
                checked={density === "compact"}
                onCheckedChange={(checked) =>
                  setDensity(checked ? "compact" : "normal")
                }
                className="h-5 w-9 shrink-0 [&>span]:h-4 [&>span]:w-4 [&>span[data-state=checked]]:translate-x-4 [&>span[data-state=unchecked]]:translate-x-0"
              />
              <Label htmlFor="density-mode">Compact View</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="icon">
                      <FilterIcon className="h-4 w-4"/>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-4" align="end">
                    <div className="space-y-4">
                        <h4 className="font-medium leading-none">Add Filters</h4>
                        <div className="space-y-2">
                        {availableFilters.map((f) => (
                            <div key={f.id} className="flex items-center space-x-2">
                                <Checkbox id={f.id} checked={activeFilters.has(f.id)} onCheckedChange={() => toggleFilter(f.id)}/>
                                <Label htmlFor={f.id}>{f.label}</Label>
                            </div>
                        ))}
                        </div>
                    </div>
                </PopoverContent>
              </Popover>
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
                          draggable={column.id !== 'select'}
                          onDragStart={(e) => handleDragStart(e, column.id)}
                          onDragOver={(e) => handleDragOver(e, column.id)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, column.id)}
                          onDragEnd={handleDragEnd}
                          className={cn(
                            "flex items-center p-2 rounded-md transition-all text-sm",
                            column.id !== 'select' && "cursor-grab active:cursor-grabbing",
                            draggedColumn.current === column.id && "opacity-50",
                            dragOverColumn === column.id && draggedColumn.current !== column.id && "bg-accent/50"
                          )}
                        >
                          <GripVertical className={cn("h-5 w-5 text-muted-foreground mr-2 shrink-0", column.id === 'select' && "opacity-0")} />
                          <span className="flex-grow">{column.label}</span>
                          <Switch
                            checked={columnVisibility.has(column.id)}
                            onCheckedChange={(checked) => {
                              const newVisibility = new Set(columnVisibility);
                              if (checked) {
                                newVisibility.add(column.id);
                              } else {
                                newVisibility.delete(column.id);
                              }
                              setColumnVisibility(newVisibility);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            disabled={column.id === 'select'}
                            className="h-5 w-9 shrink-0 [&>span]:h-4 [&>span]:w-4 [&>span[data-state=checked]]:translate-x-4 [&>span[data-state=unchecked]]:translate-x-0"
                          />
                        </div>
                      );
                    })}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Export</span>
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
        </div>
        
        {activeFilters.size > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {renderActiveFilters()}
          </div>
        )}

        <div className="hidden md:block rounded-lg border overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                {tableColumns.map((column, index) => (
                  <TableHead key={String(column.accessor)} className={cn(
                    "whitespace-nowrap h-14 p-4",
                    index === 0 && "sticky left-0 z-20"
                  )}>
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length ? (
                paginatedData.map((row) => (
                  <TableRow key={row.id} data-state={selectedRows.has(row.id) ? "selected" : undefined} className="group/row">
                    {tableColumns.map((column, index) => (
                      <TableCell key={String(column.accessor)} className={cn(
                        "p-4",
                        density === 'compact' && 'p-2',
                        index === 0 && "sticky left-0 z-10",
                        index === 0 && (selectedRows.has(row.id) ? 'bg-muted' : 'bg-card group-hover/row:bg-muted/50'),
                      )}>
                        {column.cell(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={tableColumns.length}
                    className="h-24 text-center"
                  >
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>


        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Page {page + 1} of {totalPages}
            </p>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-muted-foreground">Rows per page:</p>
              <Select
                value={rowsPerPageSelection}
                onValueChange={handleRowsPerPageChange}
              >
                <SelectTrigger className="w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center space-x-1">
              <Button variant="outline" size="icon" onClick={() => setPageAndClearSelection(0)} disabled={page === 0}>
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setPageAndClearSelection(p => Math.max(0, p - 1))} disabled={page === 0}>
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {getPaginationButtons()}

              <Button variant="outline" size="icon" onClick={() => setPageAndClearSelection(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setPageAndClearSelection(totalPages - 1)} disabled={page >= totalPages - 1}>
                <span className="sr-only">Go to last page</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        <AddPaymentDialog
            invoice={invoiceForPayment}
            isOpen={isPaymentDialogOpen}
            onOpenChange={setIsPaymentDialogOpen}
            onPaymentSuccess={handlePaymentSuccess}
        />
      </div>
    </TooltipProvider>
  );
}
