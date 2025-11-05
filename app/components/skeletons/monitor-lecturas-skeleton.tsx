import { Card, CardContent } from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';

export function MonitorLecturasSkeleton() {
  return (
    <div className='space-y-6 p-6'>
      {/* Header skeleton */}
      <div className='space-y-2'>
        <Skeleton className='h-8 w-64' />
        <Skeleton className='h-4 w-96' />
      </div>

      {/* Filters card skeleton */}
      <Card>
        <CardContent className='pt-6'>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            {/* Período */}
            <div className='space-y-2'>
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-10 w-full' />
            </div>

            {/* Sector */}
            <div className='space-y-2'>
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-10 w-full' />
            </div>

            {/* Clave */}
            <div className='space-y-2'>
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-10 w-full' />
            </div>

            {/* Medidor */}
            <div className='space-y-2'>
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-10 w-full' />
            </div>
          </div>

          {/* Advanced filters */}
          <div className='mt-4 grid gap-4 md:grid-cols-3'>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-10 w-full' />
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-10 w-full' />
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-10 w-full' />
            </div>
          </div>

          {/* Action buttons */}
          <div className='mt-6 flex gap-2'>
            <Skeleton className='h-10 w-32' />
            <Skeleton className='h-10 w-32' />
          </div>
        </CardContent>
      </Card>

      {/* Results table skeleton */}
      <Card>
        <CardContent className='pt-6'>
          <div className='space-y-4'>
            {/* Table header */}
            <div className='flex items-center justify-between'>
              <Skeleton className='h-6 w-48' />
              <Skeleton className='h-10 w-32' />
            </div>

            {/* Table rows */}
            <div className='space-y-2'>
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className='flex gap-4'>
                  <Skeleton className='h-12 flex-1' />
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className='flex items-center justify-between'>
              <Skeleton className='h-4 w-32' />
              <div className='flex gap-2'>
                <Skeleton className='h-10 w-24' />
                <Skeleton className='h-10 w-24' />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
