
'use client';

import * as React from 'react';
import type { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Download, Printer, Folder, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { ledgerData, type Ledger } from '@/lib/ledger-data';
import { cn, formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

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
const ReportRow = ({ node, level, showPercentages, totalRevenue }: { node: Ledger; level: number; showPercentages: boolean; totalRevenue: number }) => {
    const isGroup = node.type === 'group';
    const total = calculateTotal(node);
    const displayTotal = node.id === 'ledger-closing-stock' ? Math.abs(total) : total;
    const percentage = totalRevenue > 0 ? (total / totalRevenue) * 100 : 0;
    
    const textOpacityClass = level === 0 ? 'opacity-100' : level === 1 ? 'opacity-90' : 'opacity-80';

    return (
        <motion.div
            layout
            className={cn(
                "flex items-start justify-between py-1.5",
                 isGroup && `rounded-md font-bold border-t mt-2 pt-2`
            )}
            style={{ paddingLeft: `${level * 10}px` }}
        >
            <span className={cn(
                "flex items-center gap-1 pr-4 break-words",
                 isGroup ? (node.reportType === 'Income' ? 'text-primary' : 'text-destructive') : 'text-foreground',
                !isGroup && "font-normal",
                textOpacityClass
            )}>
                {isGroup ? (
                    <Folder className={cn("h-3.5 w-3.5 shrink-0")} />
                ) : (
                    <FileText className="h-3.5 w-3.5 shrink-0" />
                )}
                <span className="text-sm flex items-center gap-2">
                    {node.name}
                     {showPercentages && isGroup && (
                        <Badge 
                            variant='secondary' 
                            className="text-[10px] font-normal leading-[1] py-[2px] px-[4px]"
                        >
                            {percentage.toFixed(2)}%
                        </Badge>
                    )}
                     {showPercentages && !isGroup && (
                        <Badge 
                            variant='outline' 
                            className="text-[10px] font-normal leading-[1] py-[2px] px-[4px]"
                        >
                            {percentage.toFixed(2)}%
                        </Badge>
                    )}
                </span>
            </span>
            
            <span className={cn(
                "font-mono text-sm text-right shrink-0",
                 !isGroup && "font-normal pr-[10px]",
                 isGroup && 'pl-2',
                 textOpacityClass
            )}>
                {isGroup || node.balance !== undefined ? formatCurrency(displayTotal, 'INR') : null}
            </span>
        </motion.div>
    );
};


// Component for a major section (Income or Expenses)
const ReportSection = ({ title, data, className, titleClassName, showPercentages, totalRevenue }: { title: string; data: Ledger; className?: string; titleClassName?: string, showPercentages: boolean, totalRevenue: number }) => {
    const sectionTotal = calculateTotal(data);
    
    const renderRowsRecursive = (nodes: Ledger[], level: number, reportType: 'Income' | 'Expenses') => {
        return nodes.map(node => (
            <React.Fragment key={node.id}>
                <ReportRow node={{...node, reportType}} level={level} showPercentages={showPercentages} totalRevenue={totalRevenue} />
                {node.children && node.children.length > 0 && renderRowsRecursive(node.children, level + 1, reportType)}
            </React.Fragment>
        ));
    };
    
    const hasTitleBackground = titleClassName?.includes('bg-');

    return (
        <div className={cn("border rounded-lg", hasTitleBackground ? "overflow-hidden" : "p-4 space-y-2", className)}>
             <div className="flex justify-between items-baseline">
                <h3 className={cn("text-lg font-semibold", titleClassName, hasTitleBackground && "flex-grow px-4 py-2")}>{title}</h3>
            </div>
            
            <div className={cn(hasTitleBackground && "p-4 space-y-2")}>
                {data.children && renderRowsRecursive(data.children, 0, title as 'Income' | 'Expenses')}
                
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-sm py-2">
                    <span>Total {title}</span>
                    <span className="font-mono">{formatCurrency(sectionTotal, 'INR')}</span>
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
  const { toast } = useToast();

  const incomeData = ledgerData.find(group => group.id === 'income');
  const expenseData = ledgerData.find(group => group.id === 'expenses');

  if (!incomeData || !expenseData) {
      return <div>Error: Income or Expense group not found in ledger data.</div>;
  }
  
    const totalIncome = calculateTotal(incomeData);
    const totalExpenses = calculateTotal(expenseData);
    const incomeTaxAmount = 85000; // Assuming a fixed tax amount for this example
    
    const profitBeforeTax = totalIncome - totalExpenses;
    const netProfitAfterTax = profitBeforeTax - incomeTaxAmount;
    
    const totalRevenue = totalIncome;

    const profitBeforeTaxPercentage = totalRevenue > 0 ? (profitBeforeTax / totalRevenue) * 100 : 0;
    const netProfitPercentage = totalRevenue > 0 ? (netProfitAfterTax / totalRevenue) * 100 : 0;

    const handleWipClick = (feature: string) => {
        toast({
            title: 'Work in Progress',
            description: `${feature} functionality is coming soon.`,
        });
    };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
        <Card className="w-full max-w-5xl mx-auto">
            <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-2xl">Profit &amp; Loss Statement</CardTitle>
                        <CardDescription>
                            For the period of {date?.from ? format(date.from, 'LLL dd, y') : ''} to {date?.to ? format(date.to, 'LLL dd, y') : ''}
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-start sm:justify-end">
                        <Button variant="outline" disabled>Compare Periods</Button>
                        <AnimatedToggleButton show={showPercentages} onToggle={() => setShowPercentages(prev => !prev)} />
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button id="date" variant="outline" className={cn("w-full sm:w-[260px] justify-start text-left font-normal", !date && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date?.from ? (date.to ? <>{format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}</> : format(date.from, "LLL dd, y")) : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <Calendar initialFocus mode="range" defaultMonth={date?.from} selected={date} onSelect={setDate} numberOfMonths={2} />
                            </PopoverContent>
                        </Popover>
                         <Button variant="outline" size="icon" onClick={() => handleWipClick('Print')}><Printer className="h-4 w-4" /></Button>
                         <Button variant="outline" size="icon" onClick={() => handleWipClick('Download')}><Download className="h-4 w-4" /></Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ReportSection title="Income" data={incomeData} titleClassName="text-primary-foreground bg-primary" showPercentages={showPercentages} totalRevenue={totalRevenue} />
                    <ReportSection title="Expenses" data={expenseData} titleClassName="text-destructive-foreground bg-destructive" showPercentages={showPercentages} totalRevenue={totalRevenue} />
                </div>
                
                <Separator className="my-4" />

                <div className="md:pl-[50%]">
                    <div className="p-4 border rounded-lg space-y-2">
                         <div className="flex justify-between font-bold text-base">
                            <span className="flex items-center gap-2">
                                Profit Before Tax
                                {showPercentages && (
                                    <Badge variant="outline" className="text-[10px] font-normal border-current text-current py-[2px] px-[4px] leading-none">
                                        {profitBeforeTaxPercentage.toFixed(2)}%
                                    </Badge>
                                )}
                            </span>
                            <span className="font-mono">{formatCurrency(profitBeforeTax, 'INR')}</span>
                        </div>
                        <div className="flex justify-between text-base text-muted-foreground">
                            <span>Less: Income Tax</span>
                            <span className="font-mono">({formatCurrency(incomeTaxAmount, 'INR')})</span>
                        </div>
                    </div>
                </div>
                
                <div className={cn(
                    "flex justify-between font-bold text-xl p-4 rounded-md mt-4",
                    netProfitAfterTax >= 0 ? "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300" : "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300"
                )}>
                    <span className="flex items-center gap-2">
                        {netProfitAfterTax >= 0 ? 'Net Profit' : 'Net Loss'}
                        {showPercentages && (
                            <Badge variant="outline" className="text-[10px] font-normal border-current text-current py-[2px] px-[4px] leading-none">
                                {netProfitPercentage.toFixed(2)}%
                            </Badge>
                        )}
                    </span>
                    <span className="font-mono">{formatCurrency(netProfitAfterTax, 'INR')}</span>
                </div>
            </CardContent>
            <CardFooter className="pt-6 border-t mt-4">
                <div className="text-sm text-muted-foreground w-full">
                    <h4 className="font-semibold text-foreground mb-2">Notes:</h4>
                    <ul className="list-disc pl-5 space-y-1 text-xs">
                        <li>All figures are in Indian Rupee (INR) unless otherwise stated.</li>
                        <li>This is an unaudited statement generated for internal review purposes.</li>
                        <li>GST collected and paid are accounted for under Duties & Taxes and do not affect the profit calculation directly.</li>
                    </ul>
                </div>
            </CardFooter>
        </Card>
    </div>
  );
}
