'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Customer } from "./data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Mail, MoreVertical, Phone, Send } from "lucide-react";
import { format } from "date-fns";
import { cn, formatCurrency } from "@/lib/utils";

interface CustomerTableProps {
  data: Customer[];
}

export function CustomerTable({ data }: CustomerTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customers</CardTitle>
        <CardDescription>
          A list of your B2B and B2C customers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer Name</TableHead>
                <TableHead>GSTIN</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-right">Balance Due</TableHead>
                <TableHead>Last Transaction</TableHead>
                <TableHead>Place of Supply</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell className="font-mono">{customer.gstin}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {customer.contact.phone && (
                        <span className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {customer.contact.phone}
                        </span>
                      )}
                      {customer.contact.email && (
                        <span className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          {customer.contact.email}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className={cn(
                    "text-right font-mono",
                    customer.balanceDue > 0 ? "text-destructive" : "text-green-600"
                  )}>
                    {formatCurrency(customer.balanceDue, 'INR')}
                  </TableCell>
                  <TableCell>{format(customer.lastTransaction, "dd-MMM-yyyy")}</TableCell>
                  <TableCell>{customer.placeOfSupply.code} ({customer.placeOfSupply.abbr})</TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View</DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        {customer.balanceDue > 0 && (
                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                                <Send className="mr-2 h-4 w-4" />
                                Remind
                            </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
