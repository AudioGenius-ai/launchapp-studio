import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { cn } from '../utils/cn';

export interface Column<T> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  render?: (value: any, item: T, index: number) => React.ReactNode;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  className?: string;
  headerClassName?: string;
  rowClassName?: string | ((item: T, index: number) => string);
  onRowClick?: (item: T, index: number) => void;
  loading?: boolean;
  emptyMessage?: string;
  sortable?: boolean;
  defaultSortKey?: keyof T;
  defaultSortDirection?: 'asc' | 'desc';
}

export function DataTable<T>({
  data,
  columns,
  className,
  headerClassName,
  rowClassName,
  onRowClick,
  loading = false,
  emptyMessage = 'No data available',
  sortable = true,
  defaultSortKey,
  defaultSortDirection = 'asc',
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(defaultSortKey || null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDirection);

  const handleSort = (key: keyof T) => {
    if (!sortable) return;
    
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortKey) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue === bValue) return 0;

      let comparison = 0;
      if (aValue < bValue) comparison = -1;
      if (aValue > bValue) comparison = 1;

      return sortDirection === 'desc' ? -comparison : comparison;
    });
  }, [data, sortKey, sortDirection]);

  const getSortIcon = (columnKey: keyof T) => {
    if (sortKey !== columnKey) {
      return <ChevronsUpDown className="h-4 w-4" />;
    }
    return sortDirection === 'asc' ? 
      <ChevronUp className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-auto', className)}>
      <table className="w-full caption-bottom text-sm">
        <thead>
          <tr className={cn('border-b transition-colors hover:bg-muted/50', headerClassName)}>
            {columns.map((column) => (
              <th
                key={column.key as string}
                className={cn(
                  'h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0',
                  column.align === 'center' && 'text-center',
                  column.align === 'right' && 'text-right',
                  sortable && column.sortable !== false && 'cursor-pointer select-none'
                )}
                style={{ width: column.width }}
                onClick={() => {
                  if (sortable && column.sortable !== false) {
                    handleSort(column.key);
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  {column.title}
                  {sortable && column.sortable !== false && getSortIcon(column.key)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="h-24 text-center">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((item, index) => (
              <tr
                key={index}
                className={cn(
                  'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
                  onRowClick && 'cursor-pointer',
                  typeof rowClassName === 'function' ? rowClassName(item, index) : rowClassName
                )}
                onClick={() => onRowClick?.(item, index)}
              >
                {columns.map((column) => (
                  <td
                    key={column.key as string}
                    className={cn(
                      'p-4 align-middle [&:has([role=checkbox])]:pr-0',
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right'
                    )}
                  >
                    {column.render 
                      ? column.render(item[column.key], item, index)
                      : String(item[column.key] ?? '')
                    }
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}