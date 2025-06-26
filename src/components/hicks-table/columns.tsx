"use client";

import type { Person } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ColumnProps = {
  expandedRows: Set<string>;
  toggleRowExpansion: (id: string) => void;
  density: 'normal' | 'compact';
};

export const columns = ({ expandedRows, toggleRowExpansion, density }: ColumnProps) => [
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
    header: "User",
    cell: (row: Person) => (
      <div className={cn("p-2", density === 'compact' && 'p-1')}>
        <div className="font-medium">{`${row.firstName} ${row.lastName}`}</div>
        <div className="text-xs text-muted-foreground">{row.email}</div>
      </div>
    ),
  },
  {
    accessor: "company",
    header: "Company",
    cell: (row: Person) => <div className={cn("p-2", density === 'compact' && 'p-1')}>{row.company}</div>,
  },
  {
    accessor: "phone",
    header: "Phone",
    cell: (row: Person) => <div className={cn("p-2 font-mono", density === 'compact' && 'p-1')}>{row.phone}</div>,
  },
  {
    accessor: "saleAmount",
    header: "Sale Amount",
    cell: (row: Person) => (
        <div className={cn("p-2 font-mono text-right", density === 'compact' && 'p-1')}>{formatCurrency(row.saleAmount)}</div>
    ),
  },
  {
      accessor: "rating",
      header: "Rating",
      cell: (row: Person) => (
          <div className={cn("p-2 flex items-center gap-1", density === 'compact' && 'p-1')}>
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span>{row.rating.toFixed(1)}</span>
          </div>
      )
  },
  {
    accessor: "status",
    header: "Status",
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
    header: "Last Seen",
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
];
