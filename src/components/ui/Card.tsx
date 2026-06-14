import { HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean
  padding?: 'sm' | 'md' | 'lg' | 'none'
}

export const Card = ({ elevated, padding = 'md', children, className, ...props }: CardProps) => {
  const paddings = { none: '', sm: 'p-3', md: 'p-4', lg: 'p-6' }
  return (
    <div
      className={cn(
        'bg-surface rounded-2xl',
        elevated && 'shadow-sm',
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
