import { cn } from '@/utils/cn'

interface SkeletonProps { className?: string }

export const Skeleton = ({ className }: SkeletonProps) => (
  <div className={cn('skeleton-bg rounded-xl', className)} />
)

export const FoodCardSkeleton = () => (
  <div className="flex items-center gap-3 p-3 bg-surface rounded-2xl">
    <Skeleton className="w-16 h-16 rounded-xl flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
    <Skeleton className="h-6 w-16" />
  </div>
)
