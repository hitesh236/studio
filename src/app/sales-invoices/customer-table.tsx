'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMemo, useState, useRef } from "react";
import type { Person } from "@/lib/data";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { columns } from "@/components/ui/columns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { formatCurrency, cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  Tag,
  Building,
  Columns,
  GripVertical,
} from "lucide-react";
interface CustomerTableProps {
  data: Person[];
}


const availableFilters = [
  { id: "status", label: "Status" },
  { id: "company", label: "Company" },
  { id: "dateRange", label: "Date Range" },
  { id: "rating", label: "Rating" },
];

const ALL_COLUMNS = [
    { id: 'select', label: 'Select' },
    { id: 'name', label: 'User' },
    { id: 'company', label: 'Company' },
    { id: 'phone', label: 'Phone' },
    { id: 'saleAmount', label: 'Sale Amount' },
    { id: 'rating', label: 'Rating' },
    { id: 'status', label: 'Status' },
    { id: 'lastSeen', label: 'Last Seen' },
    { id: 'actions', label: 'Actions' },
  ];




export function CustomerTable({ data }: CustomerTableProps) {


  const [filter, setFilter] = useState("");
  const [density, setDensity] = useState<"normal" | "compact">("normal");
  const [page, setPage] = useState(0);
  const [rowsPerPageSelection, setRowsPerPageSelection] = useState("10");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
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

  const [columnVisibility, setColumnVisibility] = useState<Set<string>>(
    new Set(ALL_COLUMNS.map(c => c.id))
  );
  const [columnOrder, setColumnOrder] = useState<string[]>(
    ALL_COLUMNS.map(c => c.id)
  );
  const draggedColumn = useRef<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

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
    let newKey: string | null = key;
    let direction: 'ascending' | 'descending' = 'ascending';

    if (sortConfig.key === key) {
        if (sortConfig.direction === 'ascending') {
            direction = 'descending';
        } else {
            // It was descending, so turn off sort
            newKey = null;
        }
    }
    
    setSortConfig({ key: newKey, direction });
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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
        setSelectedRows(new Set(paginatedData.map(row => row.id)));
    } else {
        setSelectedRows(new Set());
    }
  };

  const toggleRowSelection = (id: string) => {
      setSelectedRows(prev => {
          const newSet = new Set(prev);
          if (newSet.has(id)) {
              newSet.delete(id);
          } else {
              newSet.add(id);
          }
          return newSet;
      });
  };

  const setPageAndClearSelection = (p: number) => {
    setPage(p);
    setSelectedRows(new Set());
  }

  const handleRowsPerPageChange = (value: string) => {
    setRowsPerPageSelection(value);
    setPageAndClearSelection(0);
  };

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
  
  const tableColumns = useMemo(() => {
    const allCols = columns({ 
      expandedRows, 
      toggleRowExpansion, 
      density, 
      sortConfig, 
      requestSort,
      selectedRows,
      onSelectAll: handleSelectAll,
      onSelectRow: toggleRowSelection,
      paginatedData,
    });
    
    const visibleCols = allCols.filter(c => columnVisibility.has(c.accessor as string));
    
    visibleCols.sort((a, b) => {
        return columnOrder.indexOf(a.accessor as string) - columnOrder.indexOf(b.accessor as string);
    });

    return visibleCols;
  }, [expandedRows, toggleRowExpansion, density, sortConfig, requestSort, columnVisibility, columnOrder, selectedRows, paginatedData]);


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
          onClick={() => setPageAndClearSelection(p)}
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
    setPageAndClearSelection(0);
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
    setPageAndClearSelection(0);
  };


    
  const handleDragLeave = (e: React.DragEvent) => {
    setDragOverColumn(null);
  };


  const handleDragEnd = () => {
    draggedColumn.current = null;
    setDragOverColumn(null);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales</CardTitle>


        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter records..."
              value={filter}
              onChange={(e) => {
                  setFilter(e.target.value);
                  setPageAndClearSelection(0);
              }}
              className="pl-10"
            />
          </div>
          {selectedRows.size > 0 && (
              <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">{selectedRows.size} selected</span>
                  <Select onValueChange={() => setSelectedRows(new Set())}>
                      <SelectTrigger className="w-[120px] h-9">
                          <SelectValue placeholder="Assign" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="user1">User 1</SelectItem>
                          <SelectItem value="user2">User 2</SelectItem>
                          <SelectItem value="user3">User 3</SelectItem>
                      </SelectContent>
                  </Select>
              </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="density-mode"
              checked={density === "compact"}
              onCheckedChange={(checked) =>
                setDensity(checked ? "compact" : "normal")
              }
              className="h-5 w-9 shrink-0 [&>span]:h-4 [&>span]:w-4 [&>span[data-state=checked]]:translate-x-4 [&>span[data-state=unchecked]]:translate-x-0"
            />
            <Label htmlFor="density-mode">Compact View</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                  <Button variant="outline" size="icon">
                    <FilterIcon className="h-4 w-4"/>
                  </Button>
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Columns className="h-4 w-4" />
                    <span className="sr-only">Toggle Columns</span>
                  </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" onMouseLeave={() => setDragOverColumn(null)}>
                <DropdownMenuLabel>Toggle & Reorder</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="flex flex-col gap-1 p-1">
                  {columnOrder.map((columnId) => {
                    const column = ALL_COLUMNS.find((c) => c.id === columnId)!;
                    return (
                      <div
                        key={column.id}
                        draggable={column.id !== 'select'}
                        onDragStart={(e) => handleDragStart(e, column.id)}
                        onDragOver={(e) => handleDragOver(e, column.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, column.id)}
                        onDragEnd={handleDragEnd}
                        className={cn(
                          "flex items-center p-2 rounded-md transition-all text-sm",
                          column.id !== 'select' && "cursor-grab active:cursor-grabbing",
                          draggedColumn.current === column.id && "opacity-50",
                          dragOverColumn === column.id && draggedColumn.current !== column.id && "bg-accent/50"
                        )}
                      >
                        <GripVertical className={cn("h-5 w-5 text-muted-foreground mr-2 shrink-0", column.id === 'select' && "opacity-0")} />
                        <span className="flex-grow">{column.label}</span>
                        <Switch
                          checked={columnVisibility.has(column.id)}
                          onCheckedChange={(checked) => {
                            const newVisibility = new Set(columnVisibility);
                            if (checked) {
                              newVisibility.add(column.id);
                            } else {
                              newVisibility.delete(column.id);
                            }
                            setColumnVisibility(newVisibility);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          disabled={column.id === 'select'}
                          className="h-5 w-9 shrink-0 [&>span]:h-4 [&>span]:w-4 [&>span[data-state=checked]]:translate-x-4 [&>span[data-state=unchecked]]:translate-x-0"
                        />
                      </div>
                    );
                  })}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
        
      <div className="rounded-lg border overflow-hidden bg-card">
        <DataTable
            columns={tableColumns}
            data={paginatedData}
            expandedRows={expandedRows}
            toggleRowExpansion={toggleRowExpansion}
            selectedRows={selectedRows}
            onSelectRow={toggleRowSelection}
            density={density}
        />
      </div>
  
      </CardHeader>
     
    </Card>
  );
}
