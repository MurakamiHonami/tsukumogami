import CalendarGrid from '../components/CalendarGrid'
import MonthlyDeadlineList from '../components/MonthlyDeadlineList'
import PageHeader from '../components/PageHeader'
import { formatMonthLabel } from '../utils/date'

function CalendarPage({ calendarMonth, itemsByDate, monthlyEntries, savedEntries, onMoveMonth }) {
  return (
    <div className="calendar-page">
      <PageHeader
        title="期限カレンダー"
        subtitle="登録した交換期限を年月日で一覧し、月ごとに確認する。"
        badge={{ variant: 'count', label: `登録 ${savedEntries.length} 件` }}
      />

      <div className="calendar-controls">
        <button type="button" className="month-button" onClick={() => onMoveMonth(-1)}>
          前の月
        </button>
        <div className="calendar-month">{formatMonthLabel(calendarMonth)}</div>
        <button type="button" className="month-button" onClick={() => onMoveMonth(1)}>
          次の月
        </button>
      </div>

      {savedEntries.length === 0 ? (
        <div className="empty-state">登録ページで期限を推測すると、ここにカレンダー表示されます。</div>
      ) : (
        <div className="calendar-layout">
          <CalendarGrid calendarMonth={calendarMonth} itemsByDate={itemsByDate} />
          <MonthlyDeadlineList calendarMonth={calendarMonth} monthlyEntries={monthlyEntries} />
        </div>
      )}
    </div>
  )
}

export default CalendarPage
