
"use client";

import type { PurchaseBill } from "./data";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Eye, Edit, CreditCard, Undo2, FileX2 } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from 'next/link';

type ColumnProps = {
  sortConfig: { key: string | null; direction: 'ascending' | 'descending' };
  requestSort: (key: string) => void;
};

export const columns = ({ 
  sortConfig, 
  requestSort,
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
          <ArrowUp className="ml-2 h-4 w-4" />
        ) : (
          <ArrowDown className="ml-2 h-4 w-4" />
        )}
      </Button>
    );
  };
  
  return [
    {
      accessor: "billNumber",
      header: getSortableHeader("Bill #", "billNumber"),
      cell: (row: PurchaseBill) => (
        <div className="font-medium whitespace-nowrap">
           <Link href="/purchase-preview" className="hover:underline">{row.billNumber}</Link>
        </div>
      ),
    },
    {
      accessor: "vendorName",
      header: getSortableHeader("Vendor", "vendorName"),
      cell: (row: PurchaseBill) => (
        <div className="whitespace-nowrap">
          {row.vendorName}
        </div>
      ),
    },
    {
      accessor: "billDate",
      header: getSortableHeader("Bill Date", "billDate"),
      cell: (row: PurchaseBill) => (
        <div className="whitespace-nowrap">
          {format(row.billDate, "MMM d, yyyy")}
        </div>
      ),
    },
    {
      accessor: "dueDate",
      header: getSortableHeader("Due Date", "dueDate"),
      cell: (row: PurchaseBill) => (
        <div className="whitespace-nowrap">
          {format(row.dueDate, "MMM d, yyyy")}
        </div>
      ),
    },
    {
      accessor: "amount",
      header: getSortableHeader("Amount", "amount"),
      cell: (row: PurchaseBill) => (
        <div className="font-mono text-right whitespace-nowrap">{formatCurrency(row.amount, 'INR')}</div>
      ),
    },
    {
      accessor: "paymentStatus",
      header: getSortableHeader("Status", "paymentStatus"),
      cell: (row: PurchaseBill) => {
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
          default:
            variant = "outline";
            break;
        }
        return (
          <div>
            <Badge variant={variant} className="w-[110px] justify-center font-normal whitespace-nowrap">{row.paymentStatus}</Badge>
          </div>
        );
      },
    },
    {
      accessor: "amountDue",
      header: getSortableHeader("Amount Due", "amountDue"),
      cell: (row: PurchaseBill) => (
        <div className="font-mono text-right whitespace-nowrap text-destructive">{formatCurrency(row.amountDue, 'INR')}</div>
      ),
    },
    {
      accessor: "actions",
      header: "Actions",
      cell: (row: PurchaseBill) => (
        <TooltipProvider>
            <div className="flex items-center gap-1">
                <Tooltip>
                    <TooltipTrigger asChild><Button asChild variant="ghost" size="icon"><Link href="/purchase-preview"><Eye /></Link></Button></TooltipTrigger>
                    <TooltipContent><p>View Bill</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild><Button asChild variant="ghost" size="icon"><Link href="/purchase/new"><Edit /></Link></Button></TooltipTrigger>
                    <TooltipContent><p>Edit Bill</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild><Button variant="ghost" size="icon"><CreditCard /></Button></TooltipTrigger>
                    <TooltipContent><p>Record Payment</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button asChild variant="ghost" size="icon">
                            <Link href={`/purchase-returns/new?billData=${encodeURIComponent(JSON.stringify(row))}`}>
                                <Undo2 />
                            </Link>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Create Return</p></TooltipContent>
                </Tooltip>
                 <Tooltip>
                    <TooltipTrigger asChild><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><FileX2 /></Button></TooltipTrigger>
                    <TooltipContent><p>Cancel Bill</p></TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
      ),
    },
  ];
};
