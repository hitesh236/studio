
'use client';

import { Bar, BarChart, Line, LineChart, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from '@/lib/utils';
import {
  ChartTooltip,
  ChartTooltipContent,
  ChartContainer,
} from "@/components/ui/chart"
import type { SalesInvoice } from '../sales-invoices/data';
import type { PurchaseBill } from '../purchase/data';
import * as React from 'react';
import { endOfMonth, format, startOfMonth, subMonths } from 'date-fns';


const chartConfig = {
  income: {
    label: "Income",
    color: "hsl(var(--chart-2))",
  },
  expense: {
    label: "Expense",
    color: "hsl(var(--chart-5))",
  },
  cashIn: {
    label: "Cash In",
    color: "hsl(var(--chart-2))",
  },
  cashOut: {
    label: "Cash Out",
    color: "hsl(var(--chart-5))",
  }
} satisfies import("@/components/ui/chart").ChartConfig;

interface DashboardChartsProps {
    salesData: SalesInvoice[];
    purchaseData: PurchaseBill[];
}

export function DashboardCharts({ salesData, purchaseData }: DashboardChartsProps) {
    const triggerClasses = "rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:border data-[state=inactive]:border-border data-[state=inactive]:bg-transparent";

    const incomeExpenseData = React.useMemo(() => {
        const data = [];
        for (let i = 5; i >= 0; i--) {
            const date = subMonths(new Date(), i);
            const monthStart = startOfMonth(date);
            const monthEnd = endOfMonth(date);

            const income = salesData
                .filter(inv => inv.invoiceDate >= monthStart && inv.invoiceDate <= monthEnd)
                .reduce((acc, inv) => acc + inv.amountBase, 0);

            const expense = purchaseData
                .filter(bill => bill.billDate >= monthStart && bill.billDate <= monthEnd)
                .reduce((acc, bill) => acc + bill.amount, 0);
            
            data.push({
                month: format(date, 'MMM'),
                income,
                expense,
            });
        }
        return data;
    }, [salesData, purchaseData]);

    const cashFlowData = React.useMemo(() => {
        const data = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            const cashIn = salesData
                .filter(inv => format(inv.invoiceDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
                .reduce((acc, inv) => acc + inv.amountPaid, 0);

            const cashOut = purchaseData
                .filter(bill => format(bill.billDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
                .reduce((acc, bill) => acc + bill.amountPaid, 0);
            
            data.push({
                date: format(date, 'dd/MM'),
                cashIn,
                cashOut,
            });
        }
        return data;
    }, [salesData, purchaseData]);


    return (
        <Card>
            <CardHeader>
                <CardTitle>Financial Overview</CardTitle>
                <CardDescription>An overview of your income, expenses, and cash flow.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="income-expense">
                    <TabsList className="bg-transparent p-0 justify-start gap-2 h-auto flex-wrap">
                        <TabsTrigger value="income-expense" className={triggerClasses}>Income & Expense</TabsTrigger>
                        <TabsTrigger value="cash-flow" className={triggerClasses}>Cash Flow</TabsTrigger>
                    </TabsList>
                    <TabsContent value="income-expense">
                        <ChartContainer config={chartConfig} className="h-[300px] w-full">
                            <BarChart data={incomeExpenseData}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                                <YAxis tickFormatter={(value) => formatCurrency(value as number, 'INR').slice(0, -3)} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Legend />
                                <Bar dataKey="income" fill="var(--color-income)" radius={4} />
                                <Bar dataKey="expense" fill="var(--color-expense)" radius={4} />
                            </BarChart>
                        </ChartContainer>
                    </TabsContent>
                    <TabsContent value="cash-flow">
                        <ChartContainer config={chartConfig} className="h-[300px] w-full">
                            <LineChart data={cashFlowData}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
                                <YAxis tickFormatter={(value) => formatCurrency(value as number, 'INR').slice(0, -3)} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Legend />
                                <Line type="monotone" dataKey="cashIn" stroke="var(--color-cashIn)" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="cashOut" stroke="var(--color-cashOut)" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ChartContainer>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
