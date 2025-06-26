
"use client";

import type { Person } from "@/lib/data";
import { useMemo, useState } from "react";
import {
  DollarSign,
  Search,
  Star,
  TrendingUp,
  Users,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter as FilterIcon,
  X,
  Calendar as CalendarIcon,
} from "lucide-react";

import { SummaryCard } from "./summary-card";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { formatCurrency, cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { format } from "date-fns";

const availableFilters = [
  { id: "status", label: "Status" },
  { id: "company", label: "Company" },
  { id: "dateRange", label: "Date Range" },
  { id: "rating", label: "Rating" },
];

export function HicksTableContainer({ data }: { data: Person[] }) {
  const [filter, setFilter] = useState("");
  const [density, setDensity] = useState<"normal" | "compact">("normal");
  const [page, setPage] = useState(0);
  const [rowsPerPageSelection, setRowsPerPageSelection] = useState("10");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: "ascending" | "descending";
  }>({ key: null, direction: "ascending" });

  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [filterValues, setFilterValues] = useState<{
    dateRange: { from: Date | undefined; to: Date | undefined };
    statuses: string[];
    companies: string[];
    rating: number;
  }>({
    dateRange: { from: undefined, to: undefined },
    statuses: [],
    companies: [],
    rating: 2.5,
  });

  const uniqueStatuses = useMemo(() => Array.from(new Set(data.map((p) => p.status))).sort(), [data]);
  const uniqueCompanies = useMemo(() => Array.from(new Set(data.map((p) => p.company))).sort(), [data]);


  const summaryStats = useMemo(() => {
    const totalRecords = data.length;
    const averageSale =
      data.reduce((acc, person) => acc + person.saleAmount, 0) / totalRecords;
    const averageRating =
      data.reduce((acc, person) => acc + person.rating, 0) / totalRecords;

    const sortedBySale = [...data].sort((a, b) => b.saleAmount - a.saleAmount);
    const top10PercentCount = Math.floor(totalRecords * 0.1);
    const top10PercentSales = sortedBySale.slice(0, top10PercentCount);
    const top10PercentAverageSale =
      top10PercentSales.reduce((acc, person) => acc + person.saleAmount, 0) /
      (top10PercentCount || 1);

    return {
      totalRecords,
      averageSale,
      averageRating,
      top10PercentAverageSale,
    };
  }, [data]);

  const filteredData = useMemo(() => {
    let results = data.filter((person) => {
      const searchTerm = filter.toLowerCase();
      return (
        person.firstName.toLowerCase().includes(searchTerm) ||
        person.lastName.toLowerCase().includes(searchTerm) ||
        person.email.toLowerCase().includes(searchTerm) ||
        person.company.toLowerCase().includes(searchTerm) ||
        person.status.toLowerCase().includes(searchTerm)
      );
    });

    if (activeFilters.has("dateRange")) {
      const { from, to } = filterValues.dateRange;
      if (from) {
        results = results.filter((p) => p.lastSeen >= from);
      }
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        results = results.filter((p) => p.lastSeen <= toDate);
      }
    }

    if (activeFilters.has("status") && filterValues.statuses.length > 0) {
      results = results.filter((p) => filterValues.statuses.includes(p.status));
    }

    if (activeFilters.has("company") && filterValues.companies.length > 0) {
      results = results.filter((p) => filterValues.companies.includes(p.company));
    }

    if (activeFilters.has("rating")) {
      results = results.filter((p) => p.rating >= filterValues.rating);
    }
    
    return results;
  }, [data, filter, activeFilters, filterValues]);

  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
    setPage(0);
  };

  const sortedData = useMemo(() => {
    const dataToSort = [...filteredData];
    if (sortConfig.key) {
      dataToSort.sort((a, b) => {
        const { key, direction } = sortConfig;
        
        let valA, valB;

        switch(key) {
            case 'name':
                valA = `${a.firstName} ${a.lastName}`;
                valB = `${b.firstName} ${b.lastName}`;
                break;
            case 'lastSeen':
                valA = a.lastSeen.getTime();
                valB = b.lastSeen.getTime();
                break;
            default:
                valA = (a as any)[key];
                valB = (b as any)[key];
        }

        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;
        
        if (valA < valB) {
            return direction === 'ascending' ? -1 : 1;
        }
        if (valA > valB) {
            return direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return dataToSort;
  }, [filteredData, sortConfig]);

  const totalPages = useMemo(() => {
    if (rowsPerPageSelection === "all" || sortedData.length === 0) {
      return 1;
    }
    return Math.ceil(sortedData.length / Number(rowsPerPageSelection));
  }, [sortedData.length, rowsPerPageSelection]);

  const paginatedData = useMemo(() => {
    if (rowsPerPageSelection === "all") {
      return sortedData;
    }
    const rpp = Number(rowsPerPageSelection);
    const start = page * rpp;
    const end = start + rpp;
    return sortedData.slice(start, end);
  }, [sortedData, page, rowsPerPageSelection]);

  const toggleRowExpansion = (id: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };
  
  const tableColumns = useMemo(() => columns({ expandedRows, toggleRowExpansion, density, sortConfig, requestSort }), [expandedRows, density, sortConfig]);

  const getPaginationButtons = () => {
    if (totalPages <= 1) return null;

    const pageNumbers: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 0; i < totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(0);
      if (page > 2) {
        pageNumbers.push('...');
      }
      
      const startPage = Math.max(1, page - 1);
      const endPage = Math.min(totalPages - 2, page + 1);

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (page < totalPages - 3) {
        pageNumbers.push('...');
      }
      pageNumbers.push(totalPages - 1);
    }

    const uniquePageNumbers = [...new Set(pageNumbers)];

    return uniquePageNumbers.map((p, index) =>
      typeof p === 'number' ? (
        <Button
          key={`${p}-${index}`}
          variant={page === p ? 'default' : 'outline'}
          size="icon"
          onClick={() => setPage(p)}
          className="h-9 w-9"
        >
          {p + 1}
        </Button>
      ) : (
        <span key={`dots-${index}`} className="flex h-9 w-9 items-center justify-center">
          ...
        </span>
      )
    );
  };

  const handleRowsPerPageChange = (value: string) => {
    setRowsPerPageSelection(value);
    setPage(0);
  };

  const toggleFilter = (filterId: string) => {
    setActiveFilters(prev => {
        const newSet = new Set(prev);
        if (newSet.has(filterId)) {
            newSet.delete(filterId);
        } else {
            newSet.add(filterId);
        }
        return newSet;
    });
    setPage(0);
  };

  const removeFilter = (filterId: string) => {
    setActiveFilters(prev => {
        const newSet = new Set(prev);
        newSet.delete(filterId);
        return newSet;
    });

    // Reset filter values
    switch (filterId) {
        case 'dateRange':
            setFilterValues(prev => ({...prev, dateRange: { from: undefined, to: undefined }}));
            break;
        case 'status':
            setFilterValues(prev => ({...prev, statuses: []}));
            break;
        case 'company':
            setFilterValues(prev => ({...prev, companies: []}));
            break;
        case 'rating':
            setFilterValues(prev => ({...prev, rating: 2.5}));
            break;
    }
    setPage(0);
  };

  const renderActiveFilters = () => {
    return Array.from(activeFilters).map(filterId => {
        switch(filterId) {
            case 'dateRange':
                return (
                    <Badge key={filterId} variant="outline" className="flex items-center gap-2 p-2">
                        <span className="font-semibold">Date:</span>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant={"outline"} size="sm" className={cn("w-[150px] justify-start text-left font-normal", !filterValues.dateRange.from && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {filterValues.dateRange.from ? format(filterValues.dateRange.from, "LLL dd, y") : <span>Start date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={filterValues.dateRange.from} onSelect={(date) => setFilterValues(prev => ({ ...prev, dateRange: { ...prev.dateRange, from: date } }))} initialFocus /></PopoverContent>
                        </Popover>
                        -
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant={"outline"} size="sm" className={cn("w-[150px] justify-start text-left font-normal", !filterValues.dateRange.to && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {filterValues.dateRange.to ? format(filterValues.dateRange.to, "LLL dd, y") : <span>End date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={filterValues.dateRange.to} onSelect={(date) => setFilterValues(prev => ({ ...prev, dateRange: { ...prev.dateRange, to: date } }))} initialFocus /></PopoverContent>
                        </Popover>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFilter(filterId)}><X className="h-4 w-4" /></Button>
                    </Badge>
                );
            case 'status':
                return (
                    <Badge key={filterId} variant="outline" className="flex items-center gap-2 p-2">
                        <span className="font-semibold">Status:</span>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="outline" size="sm">{filterValues.statuses.length > 0 ? `${filterValues.statuses.length} selected` : 'Select Status'}</Button></DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56">
                                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {uniqueStatuses.map(status => (
                                    <DropdownMenuCheckboxItem key={status} checked={filterValues.statuses.includes(status)} onCheckedChange={(checked) => {
                                        setFilterValues(prev => ({ ...prev, statuses: checked ? [...prev.statuses, status] : prev.statuses.filter(s => s !== status) }));
                                    }}>{status}</DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFilter(filterId)}><X className="h-4 w-4" /></Button>
                    </Badge>
                );
            case 'company':
                return (
                    <Badge key={filterId} variant="outline" className="flex items-center gap-2 p-2">
                        <span className="font-semibold">Company:</span>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="outline" size="sm">{filterValues.companies.length > 0 ? `${filterValues.companies.length} selected` : 'Select Company'}</Button></DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 h-72 overflow-y-auto">
                                <DropdownMenuLabel>Filter by Company</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {uniqueCompanies.map(company => (
                                    <DropdownMenuCheckboxItem key={company} checked={filterValues.companies.includes(company)} onCheckedChange={(checked) => {
                                        setFilterValues(prev => ({ ...prev, companies: checked ? [...prev.companies, company] : prev.companies.filter(c => c !== company) }));
                                    }}>{company}</DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFilter(filterId)}><X className="h-4 w-4" /></Button>
                    </Badge>
                );
            case 'rating':
                return (
                    <Badge key={filterId} variant="outline" className="flex items-center gap-2 p-2">
                        <span className="font-semibold">Rating &ge; {filterValues.rating.toFixed(1)}</span>
                        <Slider value={[filterValues.rating]} max={5} step={0.1} className="w-32" onValueChange={(value) => setFilterValues(prev => ({ ...prev, rating: value[0] }))} />
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFilter(filterId)}><X className="h-4 w-4" /></Button>
                    </Badge>
                );
            default:
                return null;
        }
    });
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline">HicksTable</h1>
        <p className="text-muted-foreground">
          A demonstration of data interaction following Hick's Law.
        </p>
      </header>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon={Users}
          title="Total Records"
          value={summaryStats.totalRecords.toLocaleString()}
          variant="primary"
        />
        <SummaryCard
          icon={DollarSign}
          title="Average Sale"
          value={formatCurrency(summaryStats.averageSale)}
        />
        <SummaryCard
          icon={TrendingUp}
          title="Top 10% Avg. Sale"
          value={formatCurrency(summaryStats.top10PercentAverageSale)}
        />
        <SummaryCard
          icon={Star}
          title="Average Rating"
          value={`${summaryStats.averageRating.toFixed(1)} / 5.0`}
        />
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter records..."
            value={filter}
            onChange={(e) => {
                setFilter(e.target.value);
                setPage(0);
            }}
            className="pl-10"
          />
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="density-mode"
              checked={density === "compact"}
              onCheckedChange={(checked) =>
                setDensity(checked ? "compact" : "normal")
              }
            />
            <Label htmlFor="density-mode">Compact View</Label>
          </div>
          <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline"><FilterIcon className="mr-2 h-4 w-4"/>Filter</Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-4" align="end">
                <div className="space-y-4">
                    <h4 className="font-medium leading-none">Add Filters</h4>
                    <div className="space-y-2">
                    {availableFilters.map((f) => (
                        <div key={f.id} className="flex items-center space-x-2">
                            <Checkbox id={f.id} checked={activeFilters.has(f.id)} onCheckedChange={() => toggleFilter(f.id)}/>
                            <Label htmlFor={f.id}>{f.label}</Label>
                        </div>
                    ))}
                    </div>
                </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      {activeFilters.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-4 border rounded-lg bg-muted/50">
          {renderActiveFilters()}
        </div>
      )}

      <div className="rounded-lg border overflow-hidden bg-card">
        <DataTable
            columns={tableColumns}
            data={paginatedData}
            expandedRows={expandedRows}
            toggleRowExpansion={toggleRowExpansion}
        />
      </div>


      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex items-center space-x-2">
            <p className="text-sm text-muted-foreground">Rows per page:</p>
            <Select
              value={rowsPerPageSelection}
              onValueChange={handleRowsPerPageChange}
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center space-x-1">
            <Button variant="outline" size="icon" onClick={() => setPage(0)} disabled={page === 0}>
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {getPaginationButtons()}

            <Button variant="outline" size="icon" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1}>
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
