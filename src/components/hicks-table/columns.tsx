
"use client";

import type { Person } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronRight, Star, Eye, Edit, Trash2, ArrowUp, ArrowDown, ExternalLink } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

type ColumnProps = {
  expandedRows: Set<string>;
  toggleRowExpansion: (id: string) => void;
  density: 'normal' | 'compact';
  sortConfig: { key: string | null; direction: 'ascending' | 'descending' };
  requestSort: (key: string) => void;
  selectedRows: Set<string>;
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (id: string) => void;
  paginatedData: Person[];
};

export const columns = ({ 
  expandedRows, 
  toggleRowExpansion, 
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
      <Button variant="ghost" onClick={() => requestSort(accessor)} className={cn(
        "text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground p-2",
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
      cell: (row: Person) => (
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
      accessor: "name",
      header: getSortableHeader("User", "name"),
      cell: (row: Person) => (
        <div className={cn("flex items-center gap-2", density === 'compact' && 'py-1 px-2 text-sm')}>
          <div>
             <Link href={`/customer-portfolio?customerData=${encodeURIComponent(JSON.stringify(row))}`} className="font-medium whitespace-nowrap hover:underline hover:text-primary">
              {`${row.firstName} ${row.lastName}`}
            </Link>
            <div className="text-xs text-muted-foreground whitespace-nowrap">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      accessor: "company",
      header: getSortableHeader("Company", "company"),
      cell: (row: Person) => (
        <div 
          onClick={() => toggleRowExpansion(row.id)} 
          className={cn("cursor-pointer whitespace-nowrap", density === 'compact' && 'py-1 px-2 text-sm')}>
          <div className="flex items-center gap-2">
             {row.company}
            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-60 hover:opacity-100 data-[state=open]:opacity-100">
               {expandedRows.has(row.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
               <span className="sr-only">Expand row</span>
            </Button>
          </div>
        </div>
      )
    },
    {
      accessor: "type",
      header: getSortableHeader("Type", "type"),
      cell: (row: Person) => (
        <div className={cn("whitespace-nowrap", density === 'compact' && 'py-1 px-2 text-sm')}>
          <Badge variant={row.type === 'Customer' ? 'secondary' : 'outline'}>{row.type}</Badge>
        </div>
      ),
    },
    {
      accessor: "phone",
      header: "Phone",
      cell: (row: Person) => <div className={cn("font-mono whitespace-nowrap", density === 'compact' && 'py-1 px-2 text-sm')}>{row.phone}</div>,
    },
    {
      accessor: "balance",
      header: getSortableHeader("Balance", "balance"),
      cell: (row: Person) => {
        if (row.balance === 0) {
          return <div className={cn("font-mono text-right whitespace-nowrap text-muted-foreground", density === 'compact' && 'py-1 px-2 text-sm')}>-</div>
        }

        const isCustomer = row.type === 'Customer';
        const isPayable = isCustomer ? row.balance > 0 : row.balance < 0; // Payable from your perspective
        const isReceivable = isCustomer ? row.balance < 0 : row.balance > 0; // Receivable by you
        
        let colorClass = '';
        if(isReceivable) colorClass = 'text-green-600';
        if(isPayable) colorClass = 'text-destructive';

        const formattedAmount = formatCurrency(Math.abs(row.balance));

        return (
          <div className={cn("font-mono text-right whitespace-nowrap", colorClass, density === 'compact' && 'py-1 px-2 text-sm')}>
            {isPayable ? `(${formattedAmount})` : formattedAmount}
          </div>
        )
      },
    },
    {
      accessor: "status",
      header: getSortableHeader("Status", "status"),
      cell: (row: Person) => (
        <div className={cn(density === 'compact' && 'py-1 px-2')}>
          <Badge variant={row.status === 'Active' ? 'default' : 'outline'} className="w-[100px] justify-center font-normal">{row.status}</Badge>
        </div>
      ),
    },
    {
      accessor: "actions",
      header: "Actions",
      cell: () => (
        <div className={cn("flex items-center gap-1", density === 'compact' && 'p-1')}>
          <Button variant="ghost" size="icon" className={cn("h-8 w-8", density === 'compact' && 'h-6 w-6')}>
            <Eye className="h-4 w-4" />
            <span className="sr-only">View</span>
          </Button>
          <Button variant="ghost" size="icon" className={cn("h-8 w-8", density === 'compact' && 'h-6 w-6')}>
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button variant="ghost" size="icon" className={cn("h-8 w-8 text-destructive hover:text-destructive", density === 'compact' && 'h-6 w-6')}>
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      ),
    },
  ];
}
