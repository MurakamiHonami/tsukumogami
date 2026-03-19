export function toISODate(date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function parseISODate(value) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatDisplayDate(value) {
  if (!value) {
    return '未設定'
  }

  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(parseISODate(value))
}

export function formatMonthLabel(value) {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
  }).format(value)
}

export function buildCalendarDays(monthDate) {
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const startDate = new Date(year, month, 1 - firstDay.getDay())

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + index)

    return {
      iso: toISODate(date),
      dayNumber: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
      isToday: toISODate(date) === toISODate(new Date()),
    }
  })
}

export function getInitialCalendarMonth() {
  const today = new Date()
  return new Date(today.getFullYear(), today.getMonth(), 1)
}
