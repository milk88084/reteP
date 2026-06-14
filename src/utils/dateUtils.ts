import { format, parseISO, isToday, isYesterday, subDays } from 'date-fns'
import { zhTW } from 'date-fns/locale'

export const getTodayStr = (): string => format(new Date(), 'yyyy-MM-dd')

export const getDateStr = (date: Date): string => format(date, 'yyyy-MM-dd')

export const formatTime = (dateStr: string): string => {
  try {
    return format(parseISO(dateStr), 'HH:mm')
  } catch {
    return ''
  }
}

export const formatDisplayDate = (dateStr: string): string => {
  try {
    const date = parseISO(dateStr)
    if (isToday(date)) return '今天'
    if (isYesterday(date)) return '昨天'
    return format(date, 'M月d日 EEEE', { locale: zhTW })
  } catch {
    return dateStr
  }
}

export const formatDateHeader = (dateStr: string): string => {
  try {
    const date = parseISO(dateStr)
    return format(date, 'M月d日 EEEE', { locale: zhTW })
  } catch {
    return dateStr
  }
}

export const getLast7Days = (): Array<{ dateStr: string; label: string; isToday: boolean }> => {
  return Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), i)
    const dateStr = getDateStr(date)
    let label: string
    if (i === 0) label = '今天'
    else if (i === 1) label = '昨天'
    else label = format(date, 'M/d', { locale: zhTW })
    return { dateStr, label, isToday: i === 0 }
  })
}
