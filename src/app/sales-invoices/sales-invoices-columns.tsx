
"use client";

import type { SalesInvoice } from "./data";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUp, ArrowDown, Eye, Pencil, FileX2, CreditCard, Undo2 } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";


type ColumnProps = {
  density: 'normal' | 'compact';
  sortConfig: { key: string | null; direction: 'ascending' | 'descending' };
  requestSort: (key: string) => void;
  selectedRows: Set<string>;
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (id: string) => void;
  paginatedData: SalesInvoice[];
  onAddPaymentClick: (invoice: SalesInvoice) => void;
};

export const columns = ({ 
  density, 
  sortConfig, 
  requestSort,
  selectedRows,
  onSelectAll,
  onSelectRow,
  paginatedData,
  onAddPaymentClick,
}: ColumnProps) => {
  const getSortableHeader = (title: string, accessor: string) => {
    const isSorted = sortConfig.key === accessor;
    return (
      <Button variant="ghost" onClick={() => requestSort(accessor)} className={cn(
        "font-bold text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground p-2 whitespace-nowrap w-full justify-start",
        isSorted && "bg-accent hover:bg-accent"
        )}>
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
  
  return [
    {
      accessor: "select",
      header: (() => {
        const numSelected = selectedRows.size;
        const rowCount = paginatedData.length;
        const isAllSelected = rowCount > 0 && numSelected === rowCount;
        const isIndeterminate = numSelected > 0 && !isAllSelected;
        return (
          <div className="px-2">
            <Checkbox
              checked={isAllSelected ? true : isIndeterminate ? 'indeterminate' : false}
              onCheckedChange={(checked) => onSelectAll(checked === true)}
              aria-label="Select all"
              className={cn("translate-y-[2px]", density === 'compact' && "h-3.5 w-3.5")}
            />
          </div>
        );
      })(),
      cell: (row: SalesInvoice) => (
        <div className="px-2 whitespace-nowrap">
            <Checkbox
                checked={selectedRows.has(row.id)}
                onCheckedChange={() => onSelectRow(row.id)}
                aria-label="Select row"
                className={cn("translate-y-[2px]", density === 'compact' && "h-3.5 w-3.5")}
            />
        </div>
      ),
    },
    {
      accessor: "invoiceNumber",
      header: getSortableHeader("Invoice Number", "invoiceNumber"),
      cell: (row: SalesInvoice) => (
        <div className={cn("font-medium whitespace-nowrap", density === 'compact' && 'py-1 px-2 text-sm')}>
          <Link href="/invoice-preview" className="hover:underline">{row.invoiceNumber}</Link>
        </div>
      ),
    },
    {
        accessor: "invoiceType",
        header: getSortableHeader("Type", "invoiceType"),
        cell: (row: SalesInvoice) => (
          <div className={cn("whitespace-nowrap", density === 'compact' && 'py-1 px-2 text-sm')}>
            <Badge variant="outline">{row.invoiceType}</Badge>
          </div>
        ),
    },
    {
      accessor: "customerName",
      header: getSortableHeader("Customer Name", "customerName"),
      cell: (row: SalesInvoice) => (
        <div className={cn("whitespace-nowrap", density === 'compact' && 'py-1 px-2 text-sm')}>
          {row.customerName}
        </div>
      ),
    },
    {
      accessor: "invoiceDate",
      header: getSortableHeader("Invoice Date", "invoiceDate"),
      cell: (row: SalesInvoice) => (
        <div className={cn("whitespace-nowrap", density === 'compact' && 'py-1 px-2 text-sm')}>
          {format(row.invoiceDate, "MMM d, yyyy")}
        </div>
      ),
    },
    {
      accessor: "dueDate",
      header: getSortableHeader("Due Date", "dueDate"),
      cell: (row: SalesInvoice) => (
        <div className={cn("whitespace-nowrap", density === 'compact' && 'py-1 px-2 text-sm')}>
          {format(row.dueDate, "MMM d, yyyy")}
        </div>
      ),
    },
    {
      accessor: "amountBase",
      header: getSortableHeader("Amount", "amountBase"),
      cell: (row: SalesInvoice) => (
        <div className={cn("font-mono text-right whitespace-nowrap", density === 'compact' && 'py-1 px-2 text-sm')}>{formatCurrency(row.amountBase, 'INR')}</div>
      ),
    },
    {
      accessor: "paymentStatus",
      header: getSortableHeader("Payment Status", "paymentStatus"),
      cell: (row: SalesInvoice) => {
        let variant: "default" | "secondary" | "destructive" | "outline" | "warning";
        switch (row.paymentStatus) {
          case "Paid":
            variant = "default";
            break;
          case "Partially Paid":
            variant = "secondary";
            break;
          case "Overdue":
            variant = "destructive";
            break;
          case "Outstanding":
          default:
            variant = "outline";
            break;
        }
        return (
          <div className={cn(density === 'compact' && 'py-1 px-2')}>
            <Badge variant={variant} className="w-[110px] justify-center font-normal whitespace-nowrap">{row.paymentStatus}</Badge>
          </div>
        );
      },
    },
    {
      accessor: "amountPaid",
      header: getSortableHeader("Paid", "amountPaid"),
      cell: (row: SalesInvoice) => (
        <div className={cn("font-mono text-right whitespace-nowrap", density === 'compact' && 'py-1 px-2 text-sm')}>{formatCurrency(row.amountPaid, 'INR')}</div>
      ),
    },
    {
      accessor: "salesReturnAmount",
      header: getSortableHeader("Return", "salesReturnAmount"),
      cell: (row: SalesInvoice) => (
        <div className={cn("font-mono text-right whitespace-nowrap text-green-600", density === 'compact' && 'py-1 px-2 text-sm')}>
          {row.salesReturnAmount ? formatCurrency(row.salesReturnAmount, 'INR') : '-'}
        </div>
      ),
    },
    {
      accessor: "amountDue",
      header: getSortableHeader("Due", "amountDue"),
      cell: (row: SalesInvoice) => (
        <div className={cn("font-mono text-right whitespace-nowrap", density === 'compact' && 'py-1 px-2 text-sm', row.amountDue > 0 ? 'text-destructive' : 'text-foreground')}>{formatCurrency(row.amountDue, 'INR')}</div>
      ),
    },
    {
      accessor: "actions",
      header: "Actions",
      cell: (row: SalesInvoice) => {
        const canAddPayment = row.paymentStatus === 'Outstanding' || row.paymentStatus === 'Partially Paid' || row.paymentStatus === 'Overdue';
        return (
          <div className={cn("flex items-center justify-center gap-1", density === 'compact' && 'p-0')}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className={cn("h-8 w-8", density === 'compact' && 'h-6 w-6')}>
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">View Invoice</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>View Invoice</p></TooltipContent>
            </Tooltip>
            {canAddPayment && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className={cn("h-8 w-8", density === 'compact' && 'h-6 w-6')} onClick={() => onAddPaymentClick(row)}>
                    <CreditCard className="h-4 w-4" />
                    <span className="sr-only">Add Payment</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Add Payment</p></TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                 <Button asChild variant="ghost" size="icon" className={cn("h-8 w-8", density === 'compact' && 'h-6 w-6')}>
                    <Link href={`/sales-invoice-returns/new?invoiceData=${encodeURIComponent(JSON.stringify(row))}`}>
                        <Undo2 className="h-4 w-4" />
                        <span className="sr-only">Create Sales Return</span>
                    </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Create Sales Return</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className={cn("h-8 w-8 text-destructive hover:text-destructive", density === 'compact' && 'h-6 w-6')}>
                  <FileX2 className="h-4 w-4" />
                  <span className="sr-only">Cancel Invoice</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Cancel Invoice</p></TooltipContent>
            </Tooltip>
          </div>
        )
      },
    },
  ];
};
