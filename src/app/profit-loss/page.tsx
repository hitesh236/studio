
'use client';

import * as React from 'react';
import type { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { ledgerData, type Ledger } from '@/lib/ledger-data';
import { cn, formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';

// Helper function to recursively calculate group totals
const calculateTotal = (node: Ledger): number => {
    if (node.type === 'ledger') {
        return node.balance || 0;
    }
    if (node.children) {
        return node.children.reduce((sum, child) => sum + calculateTotal(child), 0);
    }
    return 0;
};

// Component to render a single row in the report
const ReportRow = ({ node, level, baseValue, showPercentages }: { node: Ledger; level: number; baseValue?: number; showPercentages: boolean }) => {
    const isGroup = node.type === 'group';
    const total = calculateTotal(node);
    const percentage = baseValue && baseValue !== 0 ? (Math.abs(total) / Math.abs(baseValue)) * 100 : 0;

    return (
        <div>
            <div className={cn(
                "flex items-center justify-between py-2 text-sm",
                isGroup && "font-semibold"
            )} style={{ paddingLeft: `${level * 1.5}rem` }}>
                <span className="pr-4">
                    {node.name}
                    {showPercentages && percentage > 0.01 && (
                        <span className="font-normal text-muted-foreground ml-2">({percentage.toFixed(0)}%)</span>
                    )}
                </span>
                <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="w-32 text-right font-mono">{formatCurrency(total, 'INR')}</span>
                </div>
            </div>
            {node.children && node.children.map(child => (
                <ReportRow key={child.id} node={child} level={level + 1} baseValue={baseValue} showPercentages={showPercentages} />
            ))}
        </div>
    );
};

// Component for a major section (Income or Expenses)
const ReportSection = ({ title, data, className, titleClassName, showPercentages }: { title: string; data: Ledger; className?: string; titleClassName?: string, showPercentages: boolean }) => {
    const sectionTotal = calculateTotal(data);
    
    return (
        <div className={cn("space-y-2", className)}>
             <div className="flex justify-between items-baseline">
                <h3 className={cn("text-lg font-semibold mb-2", titleClassName)}>{title}</h3>
            </div>

            {data.children?.map(node => (
                <ReportRow key={node.id} node={node} level={0} baseValue={sectionTotal} showPercentages={showPercentages} />
            ))}
            <Separator className="my-2" />
            <div className="flex justify-between font-bold text-base py-2">
                <span>Total {title}</span>
                 <div className="flex items-center gap-4">
                    <span className="w-32 text-right font-mono">{formatCurrency(sectionTotal, 'INR')}</span>
                </div>
            </div>
        </div>
    );
};

const AnimatedToggleButton = ({ show, onToggle }: { show: boolean, onToggle: () => void }) => {
  return (
    <div
      onClick={onToggle}
      className={cn(
        "flex h-9 w-[110px] cursor-pointer items-center rounded-full bg-muted p-1 transition-colors",
        show ? "justify-end" : "justify-start"
      )}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
        className="flex h-7 items-center justify-center rounded-full bg-primary px-3 text-sm font-medium text-primary-foreground"
      >
        {show ? 'Hide %' : 'Show %'}
      </motion.div>
    </div>
  );
};


export default function ProfitAndLossPage() {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date(),
  });
  const [showPercentages, setShowPercentages] = React.useState(true);

  const incomeData = ledgerData.find(group => group.id === 'income');
  const expenseData = ledgerData.find(group => group.id === 'expenses');

  if (!incomeData || !expenseData) {
      return <div>Error: Income or Expense group not found in ledger data.</div>;
  }
  
  const totalIncome = calculateTotal(incomeData);
  const totalExpenses = calculateTotal(expenseData);
  const netProfit = totalIncome - totalExpenses;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
        <Card className="max-w-4xl mx-auto">
            <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-2xl">Profit & Loss Statement</CardTitle>
                        <CardDescription>
                            For the period of {date?.from ? format(date.from, 'LLL dd, y') : ''} to {date?.to ? format(date.to, 'LLL dd, y') : ''}
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <AnimatedToggleButton show={showPercentages} onToggle={() => setShowPercentages(prev => !prev)} />
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button id="date" variant="outline" className={cn("w-[260px] justify-start text-left font-normal", !date && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date?.from ? (date.to ? <>{format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}</> : format(date.from, "LLL dd, y")) : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <Calendar initialFocus mode="range" defaultMonth={date?.from} selected={date} onSelect={setDate} numberOfMonths={2} />
                            </PopoverContent>
                        </Popover>
                         <Button variant="outline" size="icon"><Printer className="h-4 w-4" /></Button>
                         <Button variant="outline" size="icon"><Download className="h-4 w-4" /></Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    <ReportSection title="Income" data={incomeData} titleClassName="text-primary" showPercentages={showPercentages} />
                    <ReportSection title="Expenses" data={expenseData} className="md:border-l md:pl-12" titleClassName="text-destructive" showPercentages={showPercentages} />
                </div>
                <Separator className="my-4" />
                <div className={cn(
                    "flex justify-between font-bold text-xl p-4 rounded-md",
                    netProfit >= 0 ? "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300" : "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300"
                )}>
                    <span>{netProfit >= 0 ? 'Net Profit' : 'Net Loss'}</span>
                    <span className="font-mono">{formatCurrency(netProfit, 'INR')}</span>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
