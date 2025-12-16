import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  searchPlaceholder?: string;
  searchColumn?: string;
  onRowClick?: (row: T) => void;
  pageSize?: number;
  enablePagination?: boolean;
  // Server-side pagination
  serverPagination?: {
    pageIndex: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  };
}

export function DataTable<T>({
  data,
  columns,
  searchPlaceholder = 'Search...',
  searchColumn,
  onRowClick,
  pageSize = 10,
  enablePagination = true,
  serverPagination,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns: columns as ColumnDef<T, unknown>[],
    state: {
      sorting,
      globalFilter,
      ...(serverPagination ? {} : {}),
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: searchColumn ? getFilteredRowModel() : undefined,
    getPaginationRowModel: enablePagination && !serverPagination ? getPaginationRowModel() : undefined,
    initialState: {
      pagination: { pageSize },
    },
  });

  const pageSizes = useMemo(() => [10, 25, 50], []);

  return (
    <div className="space-y-4">
      {/* Search */}
      {searchColumn && (
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-sm px-4 py-2 text-sm rounded-lg border border-border-light dark:border-border-dark bg-bg-card-light dark:bg-bg-tertiary text-text-primary-light dark:text-text-primary-dark placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-border-light dark:border-border-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="border-b border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-secondary"
                >
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={cn(
                        'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary',
                        header.column.getCanSort() && 'cursor-pointer select-none hover:text-text-primary-light dark:hover:text-text-primary-dark'
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <span className="text-text-muted">
                            {header.column.getIsSorted() === 'asc' ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : header.column.getIsSorted() === 'desc' ? (
                              <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronsUpDown className="w-3.5 h-3.5" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-12 text-center text-text-muted"
                  >
                    No data available
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={cn(
                      'border-b border-border-light dark:border-border-dark last:border-0',
                      'bg-bg-card-light dark:bg-bg-primary',
                      'hover:bg-bg-light dark:hover:bg-bg-tertiary',
                      onRowClick && 'cursor-pointer'
                    )}
                    onClick={() => onRowClick?.(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-4 py-3 text-text-primary-light dark:text-text-primary-dark"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {(enablePagination || serverPagination) && (
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <span>Rows per page:</span>
            <select
              value={serverPagination?.pageSize ?? table.getState().pagination.pageSize}
              onChange={(e) => {
                const size = Number(e.target.value);
                if (serverPagination) {
                  serverPagination.onPageSizeChange(size);
                } else {
                  table.setPageSize(size);
                }
              }}
              className="px-2 py-1 rounded-md border border-border-light dark:border-border-dark bg-bg-card-light dark:bg-bg-tertiary text-text-primary-light dark:text-text-primary-dark text-sm"
            >
              {pageSizes.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-text-secondary">
              Page {(serverPagination?.pageIndex ?? table.getState().pagination.pageIndex) + 1} of{' '}
              {serverPagination?.totalPages ?? table.getPageCount()}
            </span>
            <button
              onClick={() => {
                if (serverPagination) {
                  serverPagination.onPageChange(serverPagination.pageIndex - 1);
                } else {
                  table.previousPage();
                }
              }}
              disabled={serverPagination ? serverPagination.pageIndex === 0 : !table.getCanPreviousPage()}
              className="p-1.5 rounded-lg border border-border-light dark:border-border-dark text-text-secondary hover:text-text-primary-light dark:hover:text-text-primary-dark disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (serverPagination) {
                  serverPagination.onPageChange(serverPagination.pageIndex + 1);
                } else {
                  table.nextPage();
                }
              }}
              disabled={
                serverPagination
                  ? serverPagination.pageIndex >= serverPagination.totalPages - 1
                  : !table.getCanNextPage()
              }
              className="p-1.5 rounded-lg border border-border-light dark:border-border-dark text-text-secondary hover:text-text-primary-light dark:hover:text-text-primary-dark disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
