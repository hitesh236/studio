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

interface DataTableProps {
  columns: {
    header: React.ReactNode;
    accessor: keyof Person | "expander" | "name";
    cell: (row: Person) => React.ReactNode;
  }[];
  data: Person[];
}

export function DataTable({ columns, data }: DataTableProps) {
  return (
    <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={String(column.accessor)}>{column.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length ? (
              data.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow data-state={row.isExpanded ? "selected" : undefined}>
                    {columns.map((column) => (
                      <TableCell key={String(column.accessor)}>
                        {column.cell(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                  {row.isExpanded && (
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableCell colSpan={columns.length}>
                        <div className="p-4 space-y-2">
                            <p className="font-semibold">Details:</p>
                            <p className="text-sm"><span className="font-medium text-muted-foreground">Address:</span> {row.address.street}, {row.address.city}, {row.address.state} {row.address.zip}</p>
                            <p className="text-sm"><span className="font-medium text-muted-foreground">Bio:</span> {row.bio}</p>
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
