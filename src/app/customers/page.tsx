
'use client';

import { HicksTableContainer } from "@/components/hicks-table/hicks-table-container";
import { generateData, Person } from "@/lib/data";
import { useMemo, useState, useEffect } from 'react';
import Loading from "../loading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

export default function CustomersPage() {
  const [data, setData] = useState<Person[]>([]);

  useEffect(() => {
    // In a real app, you'd fetch this data. Here we generate it.
    setData(generateData(250).filter(p => p.type === 'Customer'));
  }, []);

  if (data.length === 0) {
    return <Loading />;
  }

  return (
    <div data-section="main-content" className="p-4 sm:p-6 lg:p-8 space-y-6">
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle>Customers</CardTitle>
                        <CardDescription>A list of all your customers.</CardDescription>
                    </div>
                    <Button asChild>
                        <Link href="/parties/new">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Customer
                        </Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <HicksTableContainer data={data} />
            </CardContent>
        </Card>
    </div>
  );
}
