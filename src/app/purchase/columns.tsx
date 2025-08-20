
"use client";

import type { PurchaseBill } from "./data";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Eye, Edit, CreditCard, Undo2, FileX2 } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
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
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"><Eye className="mr-1 h-3.5 w-3.5" /> View</Button>
            <Button variant="outline" size="sm"><Edit className="mr-1 h-3.5 w-3.5" /> Edit</Button>
            <Button variant="outline" size="sm"><CreditCard className="mr-1 h-3.5 w-3.5" /> Pay</Button>
            <Button variant="outline" size="sm"><Undo2 className="mr-1 h-3.5 w-3.5" /> Return</Button>
            <Button variant="outline" size="sm" className="text-destructive border-destructive/50 hover:bg-destructive/5 hover:text-destructive">
                <FileX2 className="mr-1 h-3.5 w-3.5" /> Cancel
            </Button>
        </div>
      ),
    },
  ];
};
