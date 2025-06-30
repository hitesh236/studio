'use client';

import { Bar, BarChart, Line, LineChart, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { chartData } from './data';
import { formatCurrency } from '@/lib/utils';
import {
  ChartTooltip,
  ChartTooltipContent,
  ChartContainer,
} from "@/components/ui/chart"

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


export function DashboardCharts() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Financial Overview</CardTitle>
                <CardDescription>An overview of your income, expenses, and cash flow.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="income-expense">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="income-expense">Income & Expense</TabsTrigger>
                        <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
                    </TabsList>
                    <TabsContent value="income-expense">
                        <ChartContainer config={chartConfig} className="h-[300px] w-full">
                            <BarChart data={chartData.incomeExpense}>
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
                            <LineChart data={chartData.cashFlow}>
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
