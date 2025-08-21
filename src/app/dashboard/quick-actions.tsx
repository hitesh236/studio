
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, PlusCircle, Receipt, BookOpen, FileSpreadsheet } from "lucide-react";
import Link from "next/link";
import useUserRole from "@/hooks/use-user-role";

export function QuickActions() {
    const { role } = useUserRole();
    const canCreate = role === 'Admin' || role === 'Accountant';

    return (
        <Card>
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                {canCreate && (
                    <>
                        <Button asChild variant="outline" className="justify-start">
                            <Link href="/sales-invoices/new">
                                <PlusCircle className="mr-2 h-4 w-4" /> New Invoice
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="justify-start">
                            <Link href="/purchase/new">
                                <PlusCircle className="mr-2 h-4 w-4" /> New Bill
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="justify-start">
                            <Link href="/journal-entries/new">
                                <PlusCircle className="mr-2 h-4 w-4" /> New Journal Entry
                            </Link>
                        </Button>
                    </>
                )}
                 <Button asChild variant="outline" className="justify-start">
                     <Link href="/gst-reports">
                        <FileSpreadsheet className="mr-2 h-4 w-4" /> View Reports
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}
