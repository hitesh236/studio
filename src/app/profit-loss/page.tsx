
'use client';

import * as React from 'react';
import type { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Download, Printer, Folder, FileText } from 'lucide-react';
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
        // For COGS, closing stock is a credit, hence negative to reduce expense
        if (node.id === 'ledger-closing-stock') {
            return node.balance || 0;
        }
        return node.balance || 0;
    }
    if (node.children) {
        return node.children.reduce((sum, child) => sum + calculateTotal(child), 0);
    }
    return 0;
};

// Component to render a single row in the report
const ReportRow = ({ node, showPercentages, totalRevenue }: { node: Ledger; showPercentages: boolean; totalRevenue: number }) => {
    const isGroup = node.type === 'group';
    const total = calculateTotal(node);
    const displayTotal = node.id === 'ledger-closing-stock' ? Math.abs(total) : total;
    const percentage = totalRevenue > 0 ? (total / totalRevenue) * 100 : 0;

    return (
        <div>
             <div className={cn(
                "flex items-start justify-between py-1.5",
                isGroup ? 'font-bold' : 'font-normal'
            )}>
                <span className="flex flex-1 items-center gap-2 pr-4 break-words">
                    {isGroup ? (
                        <Folder className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    ) : (
                        <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    )}
                    <span className="flex-1">
                        {node.name}
                        {!isGroup && showPercentages && <span className="font-normal text-muted-foreground ml-2">({percentage.toFixed(2)}%)</span>}
                    </span>
                </span>
                
                <div className="flex items-center flex-shrink-0 ml-4">
                    <span className="w-32 text-right font-mono">
                        {!isGroup ? formatCurrency(displayTotal, 'INR') : ''}
                    </span>
                </div>
            </div>
        </div>
    );
};


// Component for a major section (Income or Expenses)
const ReportSection = ({ title, data, className, titleClassName, showPercentages, totalRevenue }: { title: string; data: Ledger; className?: string; titleClassName?: string, showPercentages: boolean, totalRevenue: number }) => {
    const sectionTotal = calculateTotal(data);
    
    const allNodes: Ledger[] = [];
    const collectNodes = (node: Ledger) => {
        allNodes.push(node);
        if (node.children) {
            node.children.forEach(child => collectNodes(child));
        }
    };
    collectNodes(data);
    // remove the top level group itself from the list
    allNodes.shift();
    
    return (
        <div className={cn("space-y-2 border rounded-lg p-4", className)}>
             <div className="flex justify-between items-baseline mb-2">
                <h3 className={cn("text-lg font-semibold", titleClassName)}>{title}</h3>
                <div className="flex items-center text-sm font-semibold text-muted-foreground flex-shrink-0">
                    <span className="w-32 text-right">Amount</span>
                </div>
            </div>

            {allNodes.map(node => (
                <ReportRow key={node.id} node={node} showPercentages={showPercentages} totalRevenue={totalRevenue} />
            ))}
            <Separator className="my-2" />
            <div className="flex justify-between font-bold text-base py-2">
                <span>Total {title}</span>
                 <div className="flex items-center flex-shrink-0">
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
        "flex h-7 w-[90px] cursor-pointer items-center rounded-full bg-muted p-1 transition-colors",
        show ? "justify-end" : "justify-start"
      )}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
        className="flex h-5 items-center justify-center rounded-full bg-primary px-3 text-xs font-medium text-primary-foreground"
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
  const netProfitPercentage = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
        <Card className="w-[90%] mx-auto">
            <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-2xl">Profit &amp; Loss Statement</CardTitle>
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
                    <ReportSection title="Income" data={incomeData} titleClassName="text-primary" showPercentages={showPercentages} totalRevenue={totalIncome} />
                    <ReportSection title="Expenses" data={expenseData} titleClassName="text-destructive" showPercentages={showPercentages} totalRevenue={totalIncome} />
                </div>
                <Separator className="my-4" />
                <div className={cn(
                    "flex justify-between font-bold text-xl p-4 rounded-md",
                    netProfit >= 0 ? "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300" : "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300"
                )}>
                    <span>
                        {netProfit >= 0 ? 'Net Profit' : 'Net Loss'}
                        {showPercentages && <span className="font-normal text-muted-foreground ml-2">({netProfitPercentage.toFixed(2)}%)</span>}
                    </span>
                    <span className="font-mono">{formatCurrency(netProfit, 'INR')}</span>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
