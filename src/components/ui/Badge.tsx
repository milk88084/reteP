import { cn } from '@/utils/cn'

type BadgeVariant = 'protein' | 'carbs' | 'fat' | 'calories'

interface BadgeProps {
  variant: BadgeVariant
  label: string
  value: string
  className?: string
}

const styles: Record<BadgeVariant, string> = {
  protein: 'bg-[#EEF3FF] text-[#3B6BCC]',
  carbs: 'bg-[#FFF8E6] text-[#A07000]',
  fat: 'bg-[#FFF0EC] text-[#CC4A2A]',
  calories: 'bg-[#F3EDE4] text-ink',
}

export const Badge = ({ variant, label, value, className }: BadgeProps) => (
  <div className={cn('px-3 py-1.5 rounded-full text-xs font-semibold', styles[variant], className)}>
    <span className="opacity-70">{label} </span>
    {value}
  </div>
)
