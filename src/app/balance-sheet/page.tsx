
'use client';

import * as React from 'react';
import type { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Download, Printer, Folder, FileText, ArrowUp, ArrowDown, Settings, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { type Ledger } from '@/lib/ledger-data';
import { assetsData, liabilitiesData } from './data';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


// Helper function to recursively calculate group totals
const calculateTotal = (node: Ledger, period: 'current' | 'previous' = 'current'): number => {
    const balanceKey = period === 'current' ? 'balance' : 'previousBalance';
    if (node.type === 'ledger') {
        return (node as any)[balanceKey] || 0;
    }
    if (node.children) {
        return node.children.reduce((sum, child) => sum + calculateTotal(child, period), 0);
    }
    return 0;
};

// Component to render a single row in the report
const ReportRow = ({ node, level, showPercentages, totalAssets, showComparison }: { node: Ledger & { reportType: 'Assets' | 'Liabilities' }; level: number; showPercentages: boolean; totalAssets: number; showComparison: boolean }) => {
    const isGroup = node.type === 'group';
    const currentTotal = calculateTotal(node, 'current');
    const percentage = totalAssets > 0 ? (currentTotal / totalAssets) * 100 : 0;
    
    const textOpacityClass = level === 0 ? 'opacity-100' : level === 1 ? 'opacity-90' : 'opacity-80';

    const previousTotal = calculateTotal(node, 'previous');
    const change = previousTotal !== 0 ? ((currentTotal - previousTotal) / Math.abs(previousTotal)) * 100 : (currentTotal !== 0 ? 100 : 0);
    const isIncrease = change > 0;
    const isDecrease = change < 0;

    const groupBgClass = isGroup
      ? {
          1: 'bg-slate-200 dark:bg-slate-800/40',
          2: 'bg-slate-100 dark:bg-slate-800/30',
          3: 'bg-slate-50 dark:bg-slate-800/20',
        }[level] || 'bg-slate-50/50 dark:bg-slate-800/10'
      : '';

    let basePadding: number;
    if (isGroup) {
      basePadding = level === 1 ? 10 : 20;
    } else {
      basePadding = 25;
    }

    const indentation = (level - 1) * 15;
    const finalPaddingLeft = basePadding + indentation;
    const finalPaddingRight = basePadding;

    return (
        <motion.div
            layout
            className={cn(
                "flex items-start justify-between py-1.5",
                 isGroup && `font-bold border-t mt-2 pt-2 rounded-md`,
                 groupBgClass
            )}
            style={{ paddingLeft: `${finalPaddingLeft}px`, paddingRight: `${finalPaddingRight}px` }}
        >
            <span className={cn(
                "flex items-center gap-1 pr-4 break-words",
                 isGroup ? (node.reportType === 'Assets' ? 'text-primary' : 'text-destructive') : 'text-foreground',
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
                    <span className={cn("w-24 text-right", textOpacityClass)}>{formatCurrency(currentTotal, 'INR')}</span>
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
                    !isGroup && "font-normal",
                    isGroup && 'pl-2',
                    textOpacityClass
                )}>
                    {isGroup || node.balance !== undefined ? formatCurrency(currentTotal, 'INR') : null}
                </span>
            )}
        </motion.div>
    );
};


// Component for a major section (Assets or Liabilities)
const ReportSection = ({ title, data, className, titleClassName, showPercentages, totalAssets, showComparison }: { title: string; data: Ledger; className?: string; titleClassName?: string, showPercentages: boolean, totalAssets: number, showComparison: boolean }) => {
    const sectionTotal = calculateTotal(data, 'current');
    const sectionPreviousTotal = calculateTotal(data, 'previous');
    const change = sectionPreviousTotal !== 0 ? ((sectionTotal - sectionPreviousTotal) / Math.abs(sectionPreviousTotal)) * 100 : (sectionTotal !== 0 ? 100 : 0);
    const isIncrease = change > 0;
    const isDecrease = change < 0;

    const renderRowsRecursive = (nodes: Ledger[], level: number, reportType: 'Assets' | 'Liabilities') => {
        return nodes.map(node => (
            <React.Fragment key={node.id}>
                <ReportRow node={{...node, reportType}} level={level} showPercentages={showPercentages} totalAssets={totalAssets} showComparison={showComparison} />
                {node.children && node.children.length > 0 && renderRowsRecursive(node.children, level + 1, reportType)}
            </React.Fragment>
        ));
    };
    
    const hasTitleBackground = titleClassName?.includes('bg-');

    return (
        <div className={cn("border rounded-lg", hasTitleBackground ? "overflow-hidden" : "p-4 space-y-2", className)}>
             <div className="flex justify-between items-baseline">
                <h3 className={cn("text-lg", titleClassName, hasTitleBackground && "flex-grow px-4 py-2")}>{title}</h3>
                {showComparison && <div className="flex items-baseline justify-end gap-2 font-mono text-xs shrink-0 px-4 py-2 text-muted-foreground">
                    <span className="w-24 text-right">Current</span>
                    <span className="w-24 text-right">Previous</span>
                    <span className="w-20 text-right">Change</span>
                </div>}
            </div>
            
            <div className={cn(hasTitleBackground && "p-4 space-y-2")}>
                {data.children && renderRowsRecursive(data.children, 1, title as 'Assets' | 'Liabilities')}
                
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


export default function BalanceSheetPage() {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date(),
  });
  const [showPercentages, setShowPercentages] = React.useState(false);
  const [showComparison, setShowComparison] = React.useState(false);
  const [isFullWidth, setIsFullWidth] = React.useState(false);
  const { toast } = useToast();

  const totalAssets = calculateTotal(assetsData, 'current');
  const totalLiabilities = calculateTotal(liabilitiesData, 'current');

  const handleWipClick = (feature: string) => {
    toast({
        title: 'Work in Progress',
        description: `${feature} functionality is coming soon.`,
    });
  };

  const PercentageToggle = ({
    checked,
    onCheckedChange,
    }: {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    }) => {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          'relative h-7 w-[88px] shrink-0 cursor-pointer rounded-full border-2 p-0.5 transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          checked ? 'bg-primary border-primary' : 'bg-input border-input'
        )}
      >
        <span className="sr-only">Toggle Percentages</span>
        
        <div className="absolute inset-y-0 left-3 flex items-center">
            <span className={cn("text-xs font-semibold whitespace-nowrap transition-opacity duration-200", checked ? 'opacity-100 text-primary-foreground' : 'opacity-0')}>
                Hide %
            </span>
        </div>
        <div className="absolute inset-y-0 right-3 flex items-center">
             <span className={cn("text-xs font-semibold whitespace-nowrap transition-opacity duration-200", !checked ? 'opacity-100 text-primary' : 'opacity-0')}>
                Show %
            </span>
        </div>

        <motion.div
          className="h-6 w-6 rounded-full bg-background shadow-lg"
          initial={false}
          animate={{ x: checked ? '60px' : '0px' }}
          transition={{ duration: 0.5 }}
        />
      </button>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
        <Card>
            <CardHeader className="w-full">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-2xl">Balance Sheet</CardTitle>
                        <CardDescription>
                            As at {date?.to ? format(date.to, 'LLL dd, y') : ''}
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                        <PercentageToggle checked={showPercentages} onCheckedChange={setShowPercentages} />
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button id="date" variant="outline" className={cn("w-full sm:w-[260px] justify-start text-left font-normal", !date && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date?.to ? format(date.to, "LLL dd, y") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <Calendar initialFocus mode="single" defaultMonth={date?.to} selected={date?.to} onSelect={(day) => setDate({from: date?.from, to: day})} />
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
                              checked={isFullWidth}
                              onCheckedChange={setIsFullWidth}
                            >
                              Full Width View
                            </DropdownMenuCheckboxItem>
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
                            className="mt-4 flex items-center justify-between rounded-md border border-primary bg-primary/10 py-1 px-2.5"
                        >
                            <div className="font-normal text-primary text-sm">
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
                <div className={cn("grid gap-4", isFullWidth ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2")}>
                    <ReportSection title="Assets" data={assetsData} titleClassName="text-primary-foreground bg-primary" showPercentages={showPercentages} totalAssets={totalAssets} showComparison={showComparison} />
                    <ReportSection title="Liabilities" data={liabilitiesData} titleClassName="text-destructive-foreground bg-destructive" showPercentages={showPercentages} totalAssets={totalAssets} showComparison={showComparison} />
                </div>
            </CardContent>
            <CardFooter className="pt-6 border-t mt-4 flex-col items-start gap-4">
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-primary/10 border-primary/20">
                        <CardHeader className="flex flex-row items-center justify-between p-3">
                            <CardTitle className="text-base text-primary">Total Assets</CardTitle>
                            <CardDescription className="font-mono text-base font-bold text-primary">{formatCurrency(totalAssets, 'INR')}</CardDescription>
                        </CardHeader>
                    </Card>
                    <Card className="bg-destructive/10 border-destructive/20">
                        <CardHeader className="flex flex-row items-center justify-between p-3">
                            <CardTitle className="text-base text-destructive">Total Liabilities</CardTitle>
                            <CardDescription className="font-mono text-base font-bold text-destructive">{formatCurrency(totalLiabilities, 'INR')}</CardDescription>
                        </CardHeader>
                    </Card>
                </div>
                {Math.abs(totalAssets - totalLiabilities) > 0.01 && (
                    <Alert variant="destructive">
                        <Info className="h-4 w-4" />
                        <AlertTitle>Out of Balance!</AlertTitle>
                        <AlertDescription>
                            Total Assets do not equal Total Liabilities. The difference is {formatCurrency(Math.abs(totalAssets - totalLiabilities), 'INR')}.
                        </AlertDescription>
                    </Alert>
                )}
                 <div className="text-sm text-muted-foreground w-full pt-4">
                    <h4 className="font-semibold text-foreground mb-2">Notes:</h4>
                    <ul className="list-disc pl-5 space-y-1 text-xs">
                        <li>All figures are in Indian Rupee (INR) unless otherwise stated.</li>
                        <li>This is an unaudited statement generated for internal review purposes.</li>
                    </ul>
                </div>
            </CardFooter>
        </Card>
    </div>
  );
}
