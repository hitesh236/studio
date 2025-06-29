
'use client';

import * as React from 'react';
import type { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, FileSpreadsheet, Download } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { GstSummaryTable } from '../gst-summary/gst-summary-table';
import { gstSummaryData } from '../gst-summary/data';
import { Separator } from '@/components/ui/separator';

const gstReports = [
  { value: 'gstr-1', label: 'GSTR-1', description: 'Outward Supplies' },
  { value: 'gstr-3b', label: 'GSTR-3B', description: 'Monthly Summary Return' },
  { value: 'gstr-2a-2b', label: 'GSTR-2A/2B', description: 'Auto-Drafted ITC' },
  { value: 'gstr-9', label: 'GSTR-9', description: 'Annual Return' },
  { value: 'gstr-4', label: 'GSTR-4 (CMP-08)', description: 'Composition Scheme Return' },
  { value: 'gstr-5-5a', label: 'GSTR-5/5A', description: 'Non-Resident/ODA Suppliers' },
  { value: 'gstr-6', label: 'GSTR-6', description: 'Input Service Distributor (ISD)' },
  { value: 'gstr-7', label: 'GSTR-7', description: 'TDS Deductions' },
  { value: 'gstr-8', label: 'GSTR-8', description: 'TCS - E-Commerce Operators' },
];

export function ReportsGenerator() {
  const { toast } = useToast();
  const [selectedReport, setSelectedReport] = React.useState<string | undefined>(undefined);
  const [period, setPeriod] = React.useState<string>('monthly');
  const [date, setDate] = React.useState<DateRange | undefined>();
  const [showReport, setShowReport] = React.useState(false);
  const [reportTitle, setReportTitle] = React.useState('');

  const handleGenerateReport = () => {
    if (!selectedReport || !date?.from || !date?.to) {
        toast({
            variant: 'destructive',
            title: 'Missing Information',
            description: 'Please select a report type and a date range.',
        });
        return;
    }
    const reportLabel = gstReports.find(r => r.value === selectedReport)?.label;
    setReportTitle(`${reportLabel} Report`);

    toast({
        title: 'Report Generation Started',
        description: `Generating ${reportLabel} for the period ${format(date.from, 'LLL dd, y')} to ${format(date.to, 'LLL dd, y')}.`,
    });
    setShowReport(true);
  };

  return (
    <div className="space-y-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-8 w-8 text-primary" />
              <div>
                  <CardTitle>GST Report Generator</CardTitle>
                  <CardDescription>
                      Select a report type and date range to generate your GST compliance reports.
                  </CardDescription>
              </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="report-type">Report Type</Label>
              <Select onValueChange={setSelectedReport} value={selectedReport}>
                <SelectTrigger id="report-type">
                  <SelectValue placeholder="Select a report to generate" />
                </SelectTrigger>
                <SelectContent>
                  {gstReports.map(report => (
                    <SelectItem key={report.value} value={report.value}>
                      <div className="flex flex-col">
                          <span className="font-semibold">{report.label}</span>
                          <span className="text-xs text-muted-foreground">{report.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="period">Period</Label>
              <Select onValueChange={setPeriod} defaultValue={period}>
                <SelectTrigger id="period">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Date Range</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={'outline'}
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
                      </>
                    ) : (
                      format(date.from, 'LLL dd, y')
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleGenerateReport}>
            <Download className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </CardFooter>
      </Card>

      {showReport && (
        <>
          <Separator />
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">{reportTitle}</h2>
            <GstSummaryTable data={gstSummaryData} />
          </div>
        </>
      )}
    </div>
  );
}
