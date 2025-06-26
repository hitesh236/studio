"use client";

import type { Person } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Star, Eye, Edit, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ColumnProps = {
  expandedRows: Set<string>;
  toggleRowExpansion: (id: string) => void;
  density: 'normal' | 'compact';
  sortConfig: { key: string | null; direction: 'ascending' | 'descending' };
  requestSort: (key: string) => void;
};

export const columns = ({ expandedRows, toggleRowExpansion, density, sortConfig, requestSort }: ColumnProps) => {
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
      accessor: "expander",
      header: <span className="sr-only">Expand</span>,
      cell: (row: Person) => {
        const isExpanded = expandedRows.has(row.id);
        row.isExpanded = isExpanded;
        return (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleRowExpansion(row.id)}
            className={cn("h-8 w-8", density === 'compact' && 'h-6 w-6')}
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        );
      },
    },
    {
      accessor: "name",
      header: getSortableHeader("User", "name"),
      cell: (row: Person) => (
        <div className={cn("p-2", density === 'compact' && 'p-1')}>
          <div className="font-medium">{`${row.firstName} ${row.lastName}`}</div>
          <div className="text-xs text-muted-foreground">{row.email}</div>
        </div>
      ),
    },
    {
      accessor: "company",
      header: getSortableHeader("Company", "company"),
      cell: (row: Person) => <div className={cn("p-2", density === 'compact' && 'p-1')}>{row.company}</div>,
    },
    {
      accessor: "phone",
      header: "Phone",
      cell: (row: Person) => <div className={cn("p-2 font-mono", density === 'compact' && 'p-1')}>{row.phone}</div>,
    },
    {
      accessor: "saleAmount",
      header: getSortableHeader("Sale Amount", "saleAmount"),
      cell: (row: Person) => (
          <div className={cn("p-2 font-mono text-right", density === 'compact' && 'p-1')}>{formatCurrency(row.saleAmount)}</div>
      ),
    },
    {
        accessor: "rating",
        header: getSortableHeader("Rating", "rating"),
        cell: (row: Person) => (
            <div className={cn("p-2 flex items-center gap-1", density === 'compact' && 'p-1')}>
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
          <div className={cn("p-2", density === 'compact' && 'p-1')}>
            <Badge variant={variant}>{row.status}</Badge>
          </div>
        );
      },
    },
    {
      accessor: "lastSeen",
      header: getSortableHeader("Last Seen", "lastSeen"),
      cell: (row: Person) => {
          const date = row.lastSeen;
          const isRecent = new Date().getTime() - date.getTime() < 1000 * 60 * 60 * 24 * 7;
          return (
              <div className={cn("p-2 flex flex-col items-start gap-1", density === 'compact' && 'p-1')}>
                  <span>{format(date, "MMM d, yyyy")}</span>
                  {isRecent && <Badge variant="secondary">Recent</Badge>}
              </div>
          )
      },
    },
    {
      accessor: "actions",
      header: "Actions",
      cell: () => (
        <div className={cn("flex items-center gap-1 p-2", density === 'compact' && 'p-1')}>
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
