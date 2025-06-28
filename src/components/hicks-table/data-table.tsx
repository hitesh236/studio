"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Person } from "@/lib/data";
import { cn } from "@/lib/utils";

interface DataTableProps {
  columns: {
    header: React.ReactNode;
    accessor: keyof Person | "expander" | "name" | "phone" | "actions" | "select";
    cell: (row: Person) => React.ReactNode;
  }[];
  data: Person[];
  expandedRows: Set<string>;
  toggleRowExpansion: (id: string) => void;
  selectedRows: Set<string>;
  onSelectRow: (id: string) => void;
  density: 'normal' | 'compact';
}

export function DataTable({
  columns,
  data,
  expandedRows,
  toggleRowExpansion,
  selectedRows,
  onSelectRow,
  density
}: DataTableProps) {
  return (
    <div className="w-full">
      {/* 
        This component now uses a standard table layout for all screen sizes.
        The parent container in ui/table.tsx provides horizontal scrolling on smaller screens, 
        making the table responsive by default.
      */}
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={String(column.accessor)}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length ? (
            data.map((row) => (
              <React.Fragment key={row.id}>
                <TableRow
                  data-state={expandedRows.has(row.id) || selectedRows.has(row.id) ? "selected" : undefined}
                >
                  {columns.map((column) => (
                    <TableCell 
                      key={String(column.accessor)} 
                      className={cn(density === 'compact' && 'p-0')}
                    >
                      {column.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
                {expandedRows.has(row.id) && (
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableCell colSpan={columns.length} className={cn(density === 'compact' && 'p-2')}>
                      <div className="p-4 space-y-2">
                        <p className="font-semibold">Details:</p>
                        <p className="text-sm">
                          <span className="font-medium text-muted-foreground">
                            Address:
                          </span>{" "}
                          {row.address.street}, {row.address.city},{" "}
                          {row.address.state} {row.address.zip}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium text-muted-foreground">
                            Bio:
                          </span>{" "}
                          {row.bio}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center"
              >
                No results found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
