
"use client";

import type { Person } from "@/lib/data";
import { useMemo, useState, useRef } from "react";
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
  Download,
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
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { format, startOfMonth, endOfMonth, subMonths, startOfYear } from "date-fns";
import { Separator } from "../ui/separator";

const availableFilters = [
  { id: "status", label: "Status" },
  { id: "company", label: "Company" },
];

const ALL_COLUMNS = [
    { id: 'select', label: 'Select' },
    { id: 'name', label: 'User' },
    { id: 'company', label: 'Company' },
    { id: 'type', label: 'Type' },
    { id: 'phone', label: 'Phone' },
    { id: 'balance', label: 'Balance' },
    { id: 'status', label: 'Status' },
    { id: 'actions', label: 'Actions' },
  ];

export function HicksTableContainer({ data }: { data: Person[] }) {
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
    statuses: string[];
    companies: string[];
    rating: number;
  }>({
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

  const handleDragStart = (e: React.DragEvent, columnId: string) => {
    draggedColumn.current = columnId;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (draggedColumn.current && columnId !== draggedColumn.current) {
        if (columnId !== dragOverColumn) {
            setDragOverColumn(columnId);
        }
    }
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    if (!draggedColumn.current || draggedColumn.current === targetColumnId) {
      return;
    }

    const newOrder = [...columnOrder];
    const draggedIndex = newOrder.indexOf(draggedColumn.current);
    const targetIndex = newOrder.indexOf(targetColumnId);
    
    if (draggedIndex > -1) {
        const [removed] = newOrder.splice(draggedIndex, 1);
        newOrder.splice(targetIndex, 0, removed);
    }
    
    setColumnOrder(newOrder);
    draggedColumn.current = null;
    setDragOverColumn(null);
  };

  const handleDragEnd = () => {
    draggedColumn.current = null;
    setDragOverColumn(null);
  };

  const renderActiveFilters = () => {
    return Array.from(activeFilters).map(filterId => {
        switch(filterId) {
            case 'status':
                return (
                    <div key={filterId} className="flex items-center gap-2">
                        <DropdownMenu>
                             <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-auto">
                                    <Tag className="mr-2 h-4 w-4" />
                                    Status
                                    <Separator orientation="vertical" className="mx-2 h-4 bg-border" />
                                    {filterValues.statuses.length > 0 ? (
                                        <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                                            {filterValues.statuses.length} selected
                                        </Badge>
                                    ) : (
                                        <span className="text-muted-foreground">Any</span>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
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
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeFilter(filterId)}><X className="h-4 w-4" /></Button>
                    </div>
                );
            case 'company':
                return (
                    <div key={filterId} className="flex items-center gap-2">
                        <DropdownMenu>
                             <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-auto">
                                    <Building className="mr-2 h-4 w-4" />
                                    Company
                                    <Separator orientation="vertical" className="mx-2 h-4 bg-border" />
                                    {filterValues.companies.length > 0 ? (
                                        <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                                            {filterValues.companies.length} selected
                                        </Badge>
                                    ) : (
                                        <span className="text-muted-foreground">Any</span>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
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
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeFilter(filterId)}><X className="h-4 w-4" /></Button>
                    </div>
                );
            case 'rating':
                return (
                    <div key={filterId} className="flex items-center gap-2">
                        <div className="flex items-center rounded-md border h-10 px-3 text-sm">
                             <Star className="w-4 h-4 mr-2 text-yellow-400 fill-yellow-400" />
                            <span className="font-medium text-muted-foreground">Rating:</span>
                            <span className="ml-1 font-semibold">&ge; {filterValues.rating.toFixed(1)}</span>
                        </div>
                        <Slider value={[filterValues.rating]} max={5} step={0.1} className="w-32" onValueChange={(value) => setFilterValues(prev => ({ ...prev, rating: value[0] }))} />
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeFilter(filterId)}><X className="h-4 w-4" /></Button>
                    </div>
                );
            default:
                return null;
        }
    });
  };

  return (
    <div className="space-y-6">
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Export</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>PDF</DropdownMenuItem>
                <DropdownMenuItem>Excel</DropdownMenuItem>
                <DropdownMenuItem>CSV</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      
      {activeFilters.size > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {renderActiveFilters()}
        </div>
      )}

      <div className="rounded-lg border bg-card">
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
            <Button variant="outline" size="icon" onClick={() => setPageAndClearSelection(0)} disabled={page === 0}>
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setPageAndClearSelection(p => Math.max(0, p - 1))} disabled={page === 0}>
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {getPaginationButtons()}

            <Button variant="outline" size="icon" onClick={() => setPageAndClearSelection(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setPageAndClearSelection(totalPages - 1)} disabled={page >= totalPages - 1}>
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
