import { Card, CardContent, CardHeader } from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';

interface FormSkeletonProps {
  
  fields?: number;
  
  showHeader?: boolean;
  
  showActions?: boolean;
}

export function FormSkeleton({
  fields = 6,
  showHeader = true,
  showActions = true
}: FormSkeletonProps) {
  return (
    <div className='space-y-6 p-6'>
      {/* Breadcrumb skeleton */}
      <div className='flex items-center gap-2'>
        <Skeleton className='h-4 w-16' />
        <Skeleton className='h-4 w-4' />
        <Skeleton className='h-4 w-24' />
        <Skeleton className='h-4 w-4' />
        <Skeleton className='h-4 w-32' />
      </div>

      <Card>
        {showHeader && (
          <CardHeader>
            <Skeleton className='h-8 w-64' />
            <Skeleton className='h-4 w-96' />
          </CardHeader>
        )}

        <CardContent>
          <div className='space-y-6'>
            {/* Form fields */}
            <div className='grid gap-6 md:grid-cols-2'>
              {Array.from({ length: fields }).map((_, i) => (
                <div key={i} className='space-y-2'>
                  <Skeleton className='h-4 w-32' />
                  <Skeleton className='h-10 w-full' />
                </div>
              ))}
            </div>

            {showActions && (
              <div className='flex justify-end gap-2 pt-4'>
                <Skeleton className='h-10 w-24' />
                <Skeleton className='h-10 w-24' />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
