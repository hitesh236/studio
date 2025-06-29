
"use client";

import type { Person } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronRight, Star, Eye, Edit, Trash2, ArrowUp, ArrowDown, ExternalLink } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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
            <div className="font-medium whitespace-nowrap">{`${row.firstName} ${row.lastName}`}</div>
            <div className="text-xs text-muted-foreground whitespace-nowrap">{row.email}</div>
          </div>
          <Button asChild variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
            <Link href={`/customer-portfolio?id=${row.id}`}>
                <ExternalLink className="h-4 w-4" />
                <span className="sr-only">View Customer Portfolio</span>
            </Link>
          </Button>
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
      accessor: "state",
      header: "State",
      cell: (row: Person) => <div className={cn("whitespace-nowrap", density === 'compact' && 'py-1 px-2 text-sm')}>{row.address.state}</div>,
    },
    {
      accessor: "city",
      header: "City",
      cell: (row: Person) => <div className={cn("whitespace-nowrap", density === 'compact' && 'py-1 px-2 text-sm')}>{row.address.city}</div>,
    },
    {
      accessor: "phone",
      header: "Phone",
      cell: (row: Person) => <div className={cn("font-mono whitespace-nowrap", density === 'compact' && 'py-1 px-2 text-sm')}>{row.phone}</div>,
    },
    {
      accessor: "saleAmount",
      header: getSortableHeader("Sale Amount", "saleAmount"),
      cell: (row: Person) => (
          <div className={cn("font-mono text-right whitespace-nowrap", density === 'compact' && 'py-1 px-2 text-sm')}>{formatCurrency(row.saleAmount)}</div>
      ),
    },
    {
        accessor: "rating",
        header: getSortableHeader("Rating", "rating"),
        cell: (row: Person) => (
            <div className={cn("flex items-center gap-1", density === 'compact' && 'py-1 px-2 text-sm')}>
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span>{row.rating.toFixed(1)}</span>
            </div>
        )
    },
    {
      accessor: "status",
      header: getSortableHeader("Status", "status"),
      cell: (row: Person) => {
        let variant: "default" | "secondary" | "destructive" | "outline";
        switch (row.status) {
          case "Converted":
            variant = "default";
            break;
          case "Active":
            variant = "secondary";
            break;
          case "Lost":
            variant = "destructive";
            break;
          case "Follow-Up":
            variant = "outline";
            break;
        }
        return (
          <div className={cn(density === 'compact' && 'py-1 px-2')}>
            <Badge variant={variant} className="w-[100px] justify-center font-normal">{row.status}</Badge>
          </div>
        );
      },
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
