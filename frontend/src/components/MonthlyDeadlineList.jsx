import { formatDisplayDate, formatMonthLabel } from '../utils/date'

function MonthlyDeadlineList({ calendarMonth, monthlyEntries }) {
  return (
    <aside className="calendar-sidebar">
      <h2>{formatMonthLabel(calendarMonth)}の期限一覧</h2>
      {monthlyEntries.length === 0 ? (
        <p className="sidebar-empty">この月に期限が来る登録はありません。</p>
      ) : (
        <div className="deadline-list">
          {monthlyEntries.map((entry) => (
            <div key={entry.id} className="deadline-item">
              <p className="deadline-date">{formatDisplayDate(entry.suggestedExpiration)}</p>
              <p className="deadline-name">{entry.productName}</p>
              <p className="deadline-meta">購入日: {formatDisplayDate(entry.purchaseDate)}</p>
              <p className="deadline-meta">カテゴリ: {entry.category}</p>
            </div>
          ))}
        </div>
      )}
    </aside>
  )
}

export default MonthlyDeadlineList
