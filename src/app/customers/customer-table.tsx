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
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

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
                <TableHead className="text-right">Actions</TableHead>
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
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
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
