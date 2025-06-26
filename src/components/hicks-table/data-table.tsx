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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Person } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Star, ChevronDown, ChevronRight } from "lucide-react";

interface DataTableProps {
  columns: {
    header: React.ReactNode;
    accessor: keyof Person | "expander" | "name" | "phone";
    cell: (row: Person) => React.ReactNode;
  }[];
  data: Person[];
  expandedRows: Set<string>;
  toggleRowExpansion: (id: string) => void;
}

const MobileRowCard = ({
  row,
  toggleRowExpansion,
  expandedRows,
}: {
  row: Person;
  toggleRowExpansion: (id: string) => void;
  expandedRows: Set<string>;
}) => {
  const isExpanded = expandedRows.has(row.id);

  let statusVariant: "default" | "secondary" | "destructive" | "outline";
  switch (row.status) {
    case "Converted":
      statusVariant = "default";
      break;
    case "Active":
      statusVariant = "secondary";
      break;
    case "Lost":
      statusVariant = "destructive";
      break;
    case "Follow-Up":
      statusVariant = "outline";
      break;
  }

  return (
    <Card
      onClick={() => toggleRowExpansion(row.id)}
      className="cursor-pointer transition-shadow hover:shadow-md"
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base">{`${row.firstName} ${row.lastName}`}</CardTitle>
            <p className="text-sm text-muted-foreground">{row.company}</p>
          </div>
          <Badge variant={statusVariant}>{row.status}</Badge>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-4 text-sm">
          <Separator />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
            <div>
              <strong className="text-muted-foreground block">Email</strong>
              {row.email}
            </div>
            <div>
              <strong className="text-muted-foreground block">Phone</strong>
              {row.phone}
            </div>
            <div>
              <strong className="text-muted-foreground block">Sale Amount</strong>
              {formatCurrency(row.saleAmount)}
            </div>
            <div className="flex items-center">
              <strong className="text-muted-foreground mr-1">Rating:</strong>{" "}
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="ml-1">{row.rating.toFixed(1)}</span>
            </div>
            <div>
              <strong className="text-muted-foreground block">Last Seen</strong>
              {format(row.lastSeen, "MMM d, yyyy")}
            </div>
          </div>
          <Separator />
          <div>
            <p>
              <strong className="text-muted-foreground">Address:</strong>{" "}
              {row.address.street}, {row.address.city}, {row.address.state}{" "}
              {row.address.zip}
            </p>
            <p className="mt-1">
              <strong className="text-muted-foreground">Bio:</strong> {row.bio}
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export function DataTable({
  columns,
  data,
  expandedRows,
  toggleRowExpansion,
}: DataTableProps) {
  return (
    <div className="w-full">
      {/* Mobile View */}
      <div className="grid gap-4 md:hidden">
        {data.length > 0 ? (
          data.map((row) => (
            <MobileRowCard
              key={row.id}
              row={row}
              expandedRows={expandedRows}
              toggleRowExpansion={toggleRowExpansion}
            />
          ))
        ) : (
          <p className="text-center text-muted-foreground py-12">
            No results found.
          </p>
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden w-full overflow-x-auto md:block">
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
                    data-state={expandedRows.has(row.id) ? "selected" : undefined}
                  >
                    {columns.map((column) => (
                      <TableCell key={String(column.accessor)}>
                        {column.cell(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                  {expandedRows.has(row.id) && (
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableCell colSpan={columns.length}>
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
    </div>
  );
}
