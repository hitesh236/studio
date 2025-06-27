"use client";

import type { SalesInvoice } from "./data";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUp, ArrowDown } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

type ColumnProps = {
  density: 'normal' | 'compact';
  sortConfig: { key: string | null; direction: 'ascending' | 'descending' };
  requestSort: (key: string) => void;
  selectedRows: Set<string>;
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (id: string) => void;
  paginatedData: SalesInvoice[];
};

export const columns = ({ 
  density, 
  sortConfig, 
  requestSort,
  selectedRows,
  onSelectAll,
  onSelectRow,
  paginatedData 
}: ColumnProps) => {
  const getSortableHeader = (title: string, accessor: string) => {
    const isSorted = sortConfig.key === accessor;
    return (
      <Button variant="ghost" onClick={() => requestSort(accessor)} className="text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground p-2">
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
        <div className="px-2">
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
        <div className={cn("font-medium", density === 'compact' && 'py-1 px-2 text-sm')}>
          {row.invoiceNumber}
        </div>
      ),
    },
    {
      accessor: "customerName",
      header: getSortableHeader("Customer Name", "customerName"),
      cell: (row: SalesInvoice) => (
        <div className={cn(density === 'compact' && 'py-1 px-2 text-sm')}>
          {row.customerName}
        </div>
      ),
    },
    {
      accessor: "invoiceDate",
      header: getSortableHeader("Invoice Date", "invoiceDate"),
      cell: (row: SalesInvoice) => (
        <div className={cn(density === 'compact' && 'py-1 px-2 text-sm')}>
          {format(row.invoiceDate, "MMM d, yyyy")}
        </div>
      ),
    },
    {
      accessor: "dueDate",
      header: getSortableHeader("Due Date", "dueDate"),
      cell: (row: SalesInvoice) => (
        <div className={cn(density === 'compact' && 'py-1 px-2 text-sm')}>
          {format(row.dueDate, "MMM d, yyyy")}
        </div>
      ),
    },
    {
      accessor: "currencyCode",
      header: "Currency",
      cell: (row: SalesInvoice) => (
        <div className={cn(density === 'compact' && 'py-1 px-2 text-sm')}>{row.currencyCode}</div>
      ),
    },
    {
      accessor: "exchangeRate",
      header: "Exch. Rate",
      cell: (row: SalesInvoice) => (
        <div className={cn("text-right", density === 'compact' && 'py-1 px-2 text-sm')}>{row.exchangeRate.toFixed(2)}</div>
      ),
    },
    {
      accessor: "amountForeign",
      header: getSortableHeader("Amount (FCY)", "amountForeign"),
      cell: (row: SalesInvoice) => (
        <div className={cn("font-mono text-right", density === 'compact' && 'py-1 px-2 text-sm')}>{formatCurrency(row.amountForeign)}</div>
      ),
    },
    {
      accessor: "amountBase",
      header: getSortableHeader("Amount (BCY)", "amountBase"),
      cell: (row: SalesInvoice) => (
        <div className={cn("font-mono text-right", density === 'compact' && 'py-1 px-2 text-sm')}>{formatCurrency(row.amountBase)}</div>
      ),
    },
    {
      accessor: "totalTaxableValue",
      header: getSortableHeader("Taxable Value", "totalTaxableValue"),
      cell: (row: SalesInvoice) => (
        <div className={cn("font-mono text-right", density === 'compact' && 'py-1 px-2 text-sm')}>{formatCurrency(row.totalTaxableValue)}</div>
      ),
    },
    {
      accessor: "totalGstAmount",
      header: getSortableHeader("GST Amount", "totalGstAmount"),
      cell: (row: SalesInvoice) => (
        <div className={cn("font-mono text-right", density === 'compact' && 'py-1 px-2 text-sm')}>{formatCurrency(row.totalGstAmount)}</div>
      ),
    },
    {
      accessor: "gstType",
      header: "GST Type",
      cell: (row: SalesInvoice) => (
        <div className={cn(density === 'compact' && 'py-1 px-2 text-sm')}>
          <Badge variant="outline">{row.gstType}</Badge>
        </div>
      ),
    },
    {
      accessor: "placeOfSupply",
      header: "Place of Supply",
      cell: (row: SalesInvoice) => (
        <div className={cn(density === 'compact' && 'py-1 px-2 text-sm')}>{row.placeOfSupply}</div>
      ),
    },
    {
      accessor: "paymentStatus",
      header: getSortableHeader("Payment Status", "paymentStatus"),
      cell: (row: SalesInvoice) => {
        let variant: "default" | "secondary" | "destructive" | "outline";
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
            variant = "outline";
            break;
        }
        return (
          <div className={cn(density === 'compact' && 'py-1 px-2')}>
            <Badge variant={variant} className="w-[110px] justify-center font-normal">{row.paymentStatus}</Badge>
          </div>
        );
      },
    },
    {
      accessor: "amountPaid",
      header: getSortableHeader("Amount Paid", "amountPaid"),
      cell: (row: SalesInvoice) => (
        <div className={cn("font-mono text-right", density === 'compact' && 'py-1 px-2 text-sm')}>{formatCurrency(row.amountPaid)}</div>
      ),
    },
    {
      accessor: "amountDue",
      header: getSortableHeader("Amount Due", "amountDue"),
      cell: (row: SalesInvoice) => (
        <div className={cn("font-mono text-right", density === 'compact' && 'py-1 px-2 text-sm')}>{formatCurrency(row.amountDue)}</div>
      ),
    },
    {
      accessor: "createdBy",
      header: "Created By",
      cell: (row: SalesInvoice) => (
        <div className={cn(density === 'compact' && 'py-1 px-2 text-sm')}>{row.createdBy}</div>
      ),
    },
  ];
};
