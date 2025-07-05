
'use client';

import * as React from 'react';
import type { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Download, Printer, Folder, FileText, ArrowUp, ArrowDown, Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { ledgerData, type Ledger } from '@/lib/ledger-data';
import { cn, formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal
} from '@/components/ui/dropdown-menu';


// Helper function to recursively calculate group totals
const calculateTotal = (node: Ledger, period: 'current' | 'previous' = 'current'): number => {
    const balanceKey = period === 'current' ? 'balance' : 'previousBalance';
    if (node.type === 'ledger') {
        // For COGS, closing stock is a credit, hence negative to reduce expense
        if (node.id === 'ledger-closing-stock') {
            return (node as any)[balanceKey] || 0;
        }
        return (node as any)[balanceKey] || 0;
    }
    if (node.children) {
        return node.children.reduce((sum, child) => sum + calculateTotal(child, period), 0);
    }
    return 0;
};

// Component to render a single row in the report
const ReportRow = ({ node, level, showPercentages, totalRevenue, showComparison }: { node: Ledger; level: number; showPercentages: boolean; totalRevenue: number; showComparison: boolean }) => {
    const isGroup = node.type === 'group';
    const currentTotal = calculateTotal(node, 'current');
    const displayTotal = node.id === 'ledger-closing-stock' ? Math.abs(currentTotal) : currentTotal;
    const percentage = totalRevenue > 0 ? (currentTotal / totalRevenue) * 100 : 0;
    
    const textOpacityClass = level === 0 ? 'opacity-100' : level === 1 ? 'opacity-90' : 'opacity-80';

    const previousTotal = calculateTotal(node, 'previous');
    const change = previousTotal !== 0 ? ((currentTotal - previousTotal) / Math.abs(previousTotal)) * 100 : (currentTotal !== 0 ? 100 : 0);
    const isIncrease = change > 0;
    const isDecrease = change < 0;

    return (
        <motion.div
            layout
            className={cn(
                "flex items-start justify-between py-1.5",
                 isGroup && `font-bold border-t mt-2 pt-2`
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
                            className="font-normal leading-[1] py-[2px] px-[4px]"
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
            
            {showComparison ? (
                <div className="flex items-baseline justify-end gap-2 font-mono text-sm shrink-0">
                    <span className={cn("w-24 text-right", textOpacityClass)}>{formatCurrency(displayTotal, 'INR')}</span>
                    <span className={cn("w-24 text-right text-muted-foreground/80", textOpacityClass)}>{formatCurrency(previousTotal, 'INR')}</span>
                    <span className={cn("w-20 text-right text-xs flex items-center justify-end gap-1", isIncrease && 'text-green-600', isDecrease && 'text-red-600', textOpacityClass)}>
                        {previousTotal !== 0 && Math.abs(change) > 0.01 ? (
                            <>
                                <span>{change.toFixed(1)}%</span>
                                {isIncrease && <ArrowUp className="h-3 w-3" />}
                                {isDecrease && <ArrowDown className="h-3 w-3" />}
                            </>
                        ) : previousTotal === 0 && currentTotal !== 0 ? 'New' : '-'}
                    </span>
                </div>
            ) : (
                <span className={cn(
                    "font-mono text-sm text-right shrink-0",
                    !isGroup && "font-normal pr-[10px]",
                    isGroup && 'pl-2',
                    textOpacityClass
                )}>
                    {isGroup || node.balance !== undefined ? formatCurrency(displayTotal, 'INR') : null}
                </span>
            )}
        </motion.div>
    );
};


// Component for a major section (Income or Expenses)
const ReportSection = ({ title, data, className, titleClassName, showPercentages, totalRevenue, showComparison }: { title: string; data: Ledger; className?: string; titleClassName?: string, showPercentages: boolean, totalRevenue: number, showComparison: boolean }) => {
    const sectionTotal = calculateTotal(data, 'current');
    const sectionPreviousTotal = calculateTotal(data, 'previous');
    const change = sectionPreviousTotal !== 0 ? ((sectionTotal - sectionPreviousTotal) / Math.abs(sectionPreviousTotal)) * 100 : (sectionTotal !== 0 ? 100 : 0);
    const isIncrease = change > 0;
    const isDecrease = change < 0;

    const renderRowsRecursive = (nodes: Ledger[], level: number, reportType: 'Income' | 'Expenses') => {
        return nodes.map(node => (
            <React.Fragment key={node.id}>
                <ReportRow node={{...node, reportType}} level={level} showPercentages={showPercentages} totalRevenue={totalRevenue} showComparison={showComparison} />
                {node.children && node.children.length > 0 && renderRowsRecursive(node.children, level + 1, reportType)}
            </React.Fragment>
        ));
    };
    
    const hasTitleBackground = titleClassName?.includes('bg-');

    return (
        <div className={cn("border rounded-lg", hasTitleBackground ? "overflow-hidden" : "p-4 space-y-2", className)}>
             <div className="flex justify-between items-baseline">
                <h3 className={cn("text-lg font-semibold", titleClassName, hasTitleBackground && "flex-grow px-4 py-2")}>{title}</h3>
                {showComparison && <div className="flex items-baseline justify-end gap-2 font-mono text-xs shrink-0 px-4 py-2 text-muted-foreground">
                    <span className="w-24 text-right">Current</span>
                    <span className="w-24 text-right">Previous</span>
                    <span className="w-20 text-right">Change</span>
                </div>}
            </div>
            
            <div className={cn(hasTitleBackground && "p-4 space-y-2")}>
                {data.children && renderRowsRecursive(data.children, 0, title as 'Income' | 'Expenses')}
                
                <Separator className="my-2" />
                
                {showComparison ? (
                    <div className="flex justify-between font-bold text-sm py-2">
                        <span>Total {title}</span>
                        <div className="flex items-baseline justify-end gap-2 font-mono text-sm">
                            <span className="w-24 text-right">{formatCurrency(sectionTotal, 'INR')}</span>
                            <span className="w-24 text-right text-muted-foreground/80">{formatCurrency(sectionPreviousTotal, 'INR')}</span>
                            <span className={cn("w-20 text-right text-xs flex items-center justify-end gap-1", isIncrease && 'text-green-600', isDecrease && 'text-red-600')}>
                                {sectionPreviousTotal !== 0 && Math.abs(change) > 0.01 ? (
                                    <>
                                        <span>{change.toFixed(1)}%</span>
                                        {isIncrease && <ArrowUp className="h-3 w-3" />}
                                        {isDecrease && <ArrowDown className="h-3 w-3" />}
                                    </>
                                ) : '-'}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-between font-bold text-sm py-2">
                        <span>Total {title}</span>
                        <span className="font-mono">{formatCurrency(sectionTotal, 'INR')}</span>
                    </div>
                )}
            </div>
        </div>
    );
};


export default function ProfitAndLossPage() {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date(),
  });
  const [showPercentages, setShowPercentages] = React.useState(true);
  const [showComparison, setShowComparison] = React.useState(false);
  const { toast } = useToast();

  const incomeData = ledgerData.find(group => group.id === 'income');
  const expenseData = ledgerData.find(group => group.id === 'expenses');

  if (!incomeData || !expenseData) {
      return <div>Error: Income or Expense group not found in ledger data.</div>;
  }
  
    const totalIncome = calculateTotal(incomeData, 'current');
    const totalPreviousIncome = calculateTotal(incomeData, 'previous');
    const totalExpenses = calculateTotal(expenseData, 'current');
    const totalPreviousExpenses = calculateTotal(expenseData, 'previous');
    const incomeTaxAmount = 85000;
    const previousIncomeTaxAmount = 75000;
    
    const profitBeforeTax = totalIncome - totalExpenses;
    const previousProfitBeforeTax = totalPreviousIncome - totalPreviousExpenses;
    const netProfitAfterTax = profitBeforeTax - incomeTaxAmount;
    const previousNetProfitAfterTax = previousProfitBeforeTax - previousIncomeTaxAmount;
    
    const totalRevenue = totalIncome;

    const profitBeforeTaxPercentage = totalRevenue > 0 ? (profitBeforeTax / totalRevenue) * 100 : 0;
    const netProfitPercentage = totalRevenue > 0 ? (netProfitAfterTax / totalRevenue) * 100 : 0;

    const profitChange = previousProfitBeforeTax !== 0 ? ((profitBeforeTax - previousProfitBeforeTax) / Math.abs(previousProfitBeforeTax)) * 100 : (profitBeforeTax !== 0 ? 100 : 0);
    const netProfitChange = previousNetProfitAfterTax !== 0 ? ((netProfitAfterTax - previousNetProfitAfterTax) / Math.abs(previousNetProfitAfterTax)) * 100 : (netProfitAfterTax !== 0 ? 100 : 0);

    const handleWipClick = (feature: string) => {
        toast({
            title: 'Work in Progress',
            description: `${feature} functionality is coming soon.`,
        });
    };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
        <Card>
            <CardHeader className="w-full">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-2xl">Profit &amp; Loss Statement</CardTitle>
                        <CardDescription>
                            For the period of {date?.from ? format(date.from, 'LLL dd, y') : ''} to {date?.to ? format(date.to, 'LLL dd, y') : ''}
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" onClick={() => setShowPercentages(!showPercentages)}>
                            {showPercentages ? 'Hide %' : 'Show %'}
                        </Button>
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                              <Settings className="h-4 w-4" />
                              <span className="sr-only">View Options</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuCheckboxItem
                              checked={showComparison}
                              onCheckedChange={setShowComparison}
                            >
                              Compare Periods
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger>
                                <Download className="mr-2 h-4 w-4" />
                                <span>Download</span>
                              </DropdownMenuSubTrigger>
                              <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                  <DropdownMenuItem onClick={() => handleWipClick('Download PDF')}>PDF</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleWipClick('Download XLS')}>XLS</DropdownMenuItem>
                                </DropdownMenuSubContent>
                              </DropdownMenuPortal>
                            </DropdownMenuSub>
                            <DropdownMenuItem onClick={() => handleWipClick('Print')}>
                              <Printer className="mr-2 h-4 w-4" />
                              <span>Print</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                 <AnimatePresence>
                    {showComparison && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -10, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mt-4 flex items-center justify-between rounded-md border border-primary bg-primary/10 py-1.5 px-2.5 text-sm"
                        >
                            <div className="text-primary font-normal">
                                Comparison View is On. Comparing with previous period data.
                            </div>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-primary" onClick={() => setShowComparison(false)}>
                                <X className="h-4 w-4" />
                                <span className="sr-only">Disable Comparison View</span>
                            </Button>
                        </motion.div>
                    )}
                 </AnimatePresence>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ReportSection title="Income" data={incomeData} titleClassName="text-primary-foreground bg-primary" showPercentages={showPercentages} totalRevenue={totalRevenue} showComparison={showComparison} />
                    <ReportSection title="Expenses" data={expenseData} titleClassName="text-destructive-foreground bg-destructive" showPercentages={showPercentages} totalRevenue={totalRevenue} showComparison={showComparison} />
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
                            {showComparison ? (
                                <div className="flex items-baseline justify-end gap-2 font-mono text-sm">
                                    <span className="w-24 text-right">{formatCurrency(profitBeforeTax, 'INR')}</span>
                                    <span className="w-24 text-right text-muted-foreground/80">{formatCurrency(previousProfitBeforeTax, 'INR')}</span>
                                    <span className={cn("w-20 text-right text-xs flex items-center justify-end gap-1", profitChange > 0 && "text-green-600", profitChange < 0 && "text-red-600")}>
                                        {Math.abs(profitChange) > 0.01 && <>{profitChange.toFixed(1)}% {profitChange > 0 ? <ArrowUp className="h-3 w-3"/> : <ArrowDown className="h-3 w-3"/>}</>}
                                    </span>
                                </div>
                            ) : (
                                <span className="font-mono">{formatCurrency(profitBeforeTax, 'INR')}</span>
                            )}
                        </div>
                        <div className="flex justify-between text-base text-muted-foreground">
                            <span>Less: Income Tax</span>
                             {showComparison ? (
                                <div className="flex items-baseline justify-end gap-2 font-mono text-sm">
                                    <span className="w-24 text-right">({formatCurrency(incomeTaxAmount, 'INR')})</span>
                                    <span className="w-24 text-right text-muted-foreground/80">({formatCurrency(previousIncomeTaxAmount, 'INR')})</span>
                                    <span className="w-20 text-right"></span>
                                </div>
                            ) : (
                                <span className="font-mono">({formatCurrency(incomeTaxAmount, 'INR')})</span>
                            )}
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
                     {showComparison ? (
                        <div className="flex items-baseline justify-end gap-2 font-mono text-xl">
                            <span className="w-32 text-right">{formatCurrency(netProfitAfterTax, 'INR')}</span>
                            <span className="w-32 text-right text-current/80">{formatCurrency(previousNetProfitAfterTax, 'INR')}</span>
                            <span className={cn("w-24 text-right text-sm flex items-center justify-end gap-1", netProfitChange > 0 && "text-green-600", netProfitChange < 0 && "text-red-600")}>
                                {Math.abs(netProfitChange) > 0.01 && <>{netProfitChange.toFixed(1)}% {netProfitChange > 0 ? <ArrowUp className="h-3 w-3"/> : <ArrowDown className="h-3 w-3"/>}</>}
                            </span>
                        </div>
                    ) : (
                        <span className="font-mono">{formatCurrency(netProfitAfterTax, 'INR')}</span>
                    )}
                </div>
            </CardContent>
            <CardFooter className="pt-6 border-t mt-4">
                <div className="text-sm text-muted-foreground w-full">
                    <h4 className="font-semibold text-foreground mb-2">Notes:</h4>
                    <ul className="list-disc pl-5 space-y-1 text-xs">
                        <li>All figures are in Indian Rupee (INR) unless otherwise stated.</li>
                        <li>This is an unaudited statement generated for internal review purposes.</li>
                        <li>GST collected and paid are accounted for under Duties &amp; Taxes and do not affect the profit calculation directly.</li>
                    </ul>
                </div>
            </CardFooter>
        </Card>
    </div>
  );
}

    
