import React, {
  useEffect,
  useState
} from 'react';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Sales User';
}

export interface LeadEntity {
  _id: string;
  name: string;
  email: string;

  status:
    | 'New'
    | 'Contacted'
    | 'Qualified'
    | 'Lost';

  source:
    | 'Website'
    | 'Instagram'
    | 'Referral';

  createdAt: string;
}

export interface PaginationMeta {
  totalRecords: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

export function useDebounce<T>(
  value: T,
  delay: number
): T {
  const [debouncedValue, setDebouncedValue] =
    useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600" />

    <span className="ml-2 text-sm text-slate-500">
      Loading...
    </span>
  </div>
);

export const ErrorMessage = ({
  message
}: {
  message: string;
}) => (
  <div className="my-2 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
    <strong>Error:</strong> {message}
  </div>
);

export const EmptyState = () => (
  <div className="rounded-lg border border-dashed border-slate-300 py-12 text-center">
    <p className="text-sm text-slate-500">
      No leads found.
    </p>
  </div>
);