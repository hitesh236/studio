'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Person } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CustomerTableProps {
  data: Person[];
}

export function CustomerTable({ data }: CustomerTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((person) => {
                let statusVariant: "default" | "secondary" | "destructive" | "outline";
                switch (person.status) {
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
                  default:
                    statusVariant = "outline";
                }
                return (
                  <TableRow key={person.id}>
                    <TableCell className="font-medium">{`${person.firstName} ${person.lastName}`}</TableCell>
                    <TableCell>{person.email}</TableCell>
                    <TableCell>{person.company}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant}>{person.status}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
