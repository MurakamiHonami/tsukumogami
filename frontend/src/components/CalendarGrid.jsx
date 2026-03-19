import { weekdayLabels } from '../constants/calendar'
import { buildCalendarDays } from '../utils/date'

function CalendarGrid({ calendarMonth, itemsByDate }) {
  const calendarDays = buildCalendarDays(calendarMonth)

  return (
    <div className="calendar-grid-wrapper">
      <div className="calendar-grid calendar-weekdays">
        {weekdayLabels.map((label) => (
          <div key={label} className="weekday">
            {label}
          </div>
        ))}
      </div>
      <div className="calendar-grid calendar-days">
        {calendarDays.map((day) => {
          const dayItems = itemsByDate[day.iso] || []

          return (
            <div
              key={day.iso}
              className={`calendar-cell ${day.isCurrentMonth ? '' : 'outside'} ${day.isToday ? 'today' : ''}`}
            >
              <div className="calendar-cell-head">
                <span className="calendar-date">{day.dayNumber}</span>
                {dayItems.length > 0 && <span className="calendar-count">{dayItems.length}件</span>}
              </div>
              <div className="calendar-events">
                {dayItems.slice(0, 2).map((entry) => (
                  <div key={entry.id} className="calendar-event" title={entry.productName}>
                    {entry.productName}
                  </div>
                ))}
                {dayItems.length > 2 && <div className="calendar-more">+{dayItems.length - 2}件</div>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CalendarGrid
