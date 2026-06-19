import { Card, CardContent, CardHeader } from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';

interface DataTableSkeletonProps {
  
  columns?: number;
  
  rows?: number;
  
  showHeader?: boolean;
  
  showPagination?: boolean;
}

export function DataTableSkeleton({
  columns = 5,
  rows = 10,
  showHeader = true,
  showPagination = true
}: DataTableSkeletonProps) {
  return (
    <div className="space-y-6 p-6">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
      </div>

      {showHeader && (
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      )}

      <Card>
        {showHeader && (
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-10 w-64" />
            </div>
          </CardHeader>
        )}

        <CardContent>
          <div className="space-y-4">
            {/* Table header */}
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>

            {/* Table rows */}
            <div className="space-y-2">
              {Array.from({ length: rows }).map((_, i) => (
                <div
                  key={i}
                  className="grid gap-4"
                  style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
                >
                  {Array.from({ length: columns }).map((_, j) => (
                    <Skeleton key={j} className="h-12" />
                  ))}
                </div>
              ))}
            </div>

            {showPagination && (
              <div className="flex items-center justify-between pt-4">
                <Skeleton className="h-4 w-48" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
