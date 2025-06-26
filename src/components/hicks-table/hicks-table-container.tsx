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
} from "lucide-react";

import { SummaryCard } from "./summary-card";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

const ROWS_PER_PAGE = 10;

export function HicksTableContainer({ data }: { data: Person[] }) {
  const [filter, setFilter] = useState("");
  const [density, setDensity] = useState<"normal" | "compact">("normal");
  const [page, setPage] = useState(0);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: "ascending" | "descending";
  }>({ key: null, direction: "ascending" });

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
    return data.filter((person) => {
      const searchTerm = filter.toLowerCase();
      return (
        person.firstName.toLowerCase().includes(searchTerm) ||
        person.lastName.toLowerCase().includes(searchTerm) ||
        person.email.toLowerCase().includes(searchTerm) ||
        person.company.toLowerCase().includes(searchTerm) ||
        person.status.toLowerCase().includes(searchTerm)
      );
    });
  }, [data, filter]);

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

  const totalPages = Math.ceil(sortedData.length / ROWS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const start = page * ROWS_PER_PAGE;
    const end = start + ROWS_PER_PAGE;
    return sortedData.slice(start, end);
  }, [sortedData, page]);

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
      </div>
      
      <div className="rounded-lg border overflow-hidden bg-card">
        <DataTable
            columns={tableColumns}
            data={paginatedData}
            expandedRows={expandedRows}
            toggleRowExpansion={toggleRowExpansion}
        />
      </div>


      <div className="flex items-center justify-between flex-wrap gap-4">
        <p className="text-sm text-muted-foreground">
          Page {page + 1} of {totalPages > 0 ? totalPages : 1}
        </p>
        {totalPages > 0 && (
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
