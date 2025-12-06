'use client';

import { Button } from './buttons';
import { DEFAULT_PAGE_SIZE } from '@/constants/page';

const generatePageNumbers = (
  currentPage: number,
  totalPages: number,
): (number | '...')[] => {
  const maxVisible = 7;

  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 3) {
    return [...Array.from({ length: 5 }, (_, i) => i + 1), '...', totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [
      1,
      '...',
      ...Array.from({ length: 5 }, (_, i) => totalPages - 4 + i),
    ];
  }

  return [
    1,
    '...',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    '...',
    totalPages,
  ];
};

export type TableColumn<T> = {
  key: keyof T | string;
  label: string;
  render?: (value: unknown, row: T) => React.ReactNode;
};

type TableProps<T> = {
  columns: TableColumn<T>[];
  data: T[];
  emptyMessage?: string;
  className?: string;
  onRowClick?: (row: T) => void;
  pagination?: {
    page: number;
    total: number;
    onPageChange: (page: number) => void;
    pageSize?: number;
  };
};

export const Table = <T extends Record<string, unknown>>({
  columns,
  data,
  emptyMessage = 'データがありません',
  className = '',
  onRowClick,
  pagination,
}: TableProps<T>) => {
  const pageSize = pagination?.pageSize ?? DEFAULT_PAGE_SIZE;
  const totalPages = pagination ? Math.ceil(pagination.total / pageSize) : 0;

  const getValue = (row: T, key: keyof T | string) => {
    if (typeof key === 'string' && key.includes('.')) {
      return key.split('.').reduce((obj, k) => obj?.[k] as T, row);
    }
    return row[key as keyof T];
  };

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-4 text-center text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => {
              const rowKey =
                (row.id as string | number) ||
                (row.key as string | number) ||
                JSON.stringify(row);
              const isEven = index % 2 !== 0;
              return (
                <tr
                  key={rowKey}
                  className={`${
                    isEven ? 'bg-gray-50' : 'bg-white'
                  } hover:bg-gray-100 ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => {
                    const value = getValue(row, column.key);
                    let displayValue: React.ReactNode;
                    if (column.render) {
                      displayValue = column.render(value, row);
                    } else if (typeof value === 'object' && value !== null) {
                      displayValue = JSON.stringify(value);
                    } else {
                      displayValue = String(value ?? '');
                    }
                    return (
                      <td
                        key={String(column.key)}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                        onClick={(e) => {
                          if (onRowClick) {
                            e.stopPropagation();
                          }
                        }}
                      >
                        {displayValue}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      {pagination && pagination.total > pageSize && (
        <div className="mt-4">
          <div className="mb-4 text-sm text-gray-600">
            全 {pagination.total} 件中{' '}
            {Math.min((pagination.page - 1) * pageSize + 1, pagination.total)} -{' '}
            {Math.min(pagination.page * pageSize, pagination.total)} 件を表示
          </div>
          <div className="flex justify-center items-center gap-1">
            <Button
              variant="outline"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1 text-sm"
            >
              前へ
            </Button>
            {generatePageNumbers(pagination.page, totalPages).map((pageNum) => {
              if (pageNum === '...') {
                return (
                  <span key="ellipsis" className="px-2 text-gray-500">
                    ...
                  </span>
                );
              }
              return (
                <Button
                  key={pageNum}
                  variant={pagination.page === pageNum ? 'primary' : 'outline'}
                  onClick={() => pagination.onPageChange(pageNum)}
                  className="px-3 py-1 text-sm min-w-10"
                >
                  {pageNum}
                </Button>
              );
            })}
            <Button
              variant="outline"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= totalPages}
              className="px-3 py-1 text-sm"
            >
              次へ
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
