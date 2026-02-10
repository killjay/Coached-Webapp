import { useState, useMemo, useCallback } from 'react';

export interface UseTableOptions<T> {
  data: T[];
  initialPageSize?: number;
  initialSortKey?: keyof T;
  initialSortDirection?: 'asc' | 'desc';
}

export function useTable<T extends Record<string, any>>({
  data,
  initialPageSize = 10,
  initialSortKey,
  initialSortDirection = 'asc',
}: UseTableOptions<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortKey, setSortKey] = useState<keyof T | undefined>(initialSortKey);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(initialSortDirection);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Partial<Record<keyof T, any>>>({});

  // Filter data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply filters
    Object.keys(filters).forEach((key) => {
      const filterValue = filters[key as keyof T];
      if (filterValue !== undefined && filterValue !== null && filterValue !== '') {
        result = result.filter((item) => {
          const itemValue = item[key];
          if (Array.isArray(filterValue)) {
            return filterValue.includes(itemValue);
          }
          return itemValue === filterValue;
        });
      }
    });

    // Apply search
    if (searchQuery) {
      result = result.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    return result;
  }, [data, filters, searchQuery]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue === bValue) return 0;

      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else if (aValue && bValue && typeof aValue === 'object' && typeof bValue === 'object' && 'getTime' in aValue && 'getTime' in bValue) {
        comparison = (aValue as any).getTime() - (bValue as any).getTime();
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortKey, sortDirection]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, pageSize]);

  // Total pages
  const totalPages = useMemo(() => {
    return Math.ceil(sortedData.length / pageSize);
  }, [sortedData.length, pageSize]);

  // Handlers
  const handleSort = useCallback(
    (key: keyof T) => {
      if (sortKey === key) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
      } else {
        setSortKey(key);
        setSortDirection('asc');
      }
      setCurrentPage(1);
    },
    [sortKey, sortDirection]
  );

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const handleFilter = useCallback((key: keyof T, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchQuery('');
    setCurrentPage(1);
  }, []);

  return {
    data: paginatedData,
    currentPage,
    pageSize,
    totalPages,
    totalItems: sortedData.length,
    sortKey,
    sortDirection,
    searchQuery,
    filters,
    handleSort,
    handlePageChange,
    handlePageSizeChange,
    handleSearch,
    handleFilter,
    clearFilters,
  };
}
