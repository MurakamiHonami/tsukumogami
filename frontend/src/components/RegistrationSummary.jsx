import { formatDisplayDate } from '../utils/date'

function RegistrationSummary({ savedEntriesCount, upcomingEntry }) {
  return (
    <div className="summary-strip">
      <div className="summary-item">
        <span className="summary-label">登録件数</span>
        <strong>{savedEntriesCount}件</strong>
      </div>
      <div className="summary-item">
        <span className="summary-label">直近の期限</span>
        <strong>{upcomingEntry ? formatDisplayDate(upcomingEntry.suggestedExpiration) : '未登録'}</strong>
      </div>
    </div>
  )
}

export default RegistrationSummary
