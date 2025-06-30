'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, PlusCircle, Receipt, BookOpen, FileSpreadsheet } from "lucide-react";
import Link from "next/link";

export function QuickActions() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
                <Button asChild variant="outline">
                    <Link href="/sales-invoices/new">
                        <PlusCircle className="mr-2 h-4 w-4" /> New Invoice
                    </Link>
                </Button>
                <Button asChild variant="outline">
                     <Link href="#">
                        <PlusCircle className="mr-2 h-4 w-4" /> New Bill
                    </Link>
                </Button>
                <Button asChild variant="outline">
                     <Link href="/journal-entries/new">
                        <PlusCircle className="mr-2 h-4 w-4" /> New Journal Entry
                    </Link>
                </Button>
                 <Button asChild variant="outline">
                     <Link href="/gst-reports">
                        <FileSpreadsheet className="mr-2 h-4 w-4" /> View Reports
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}
