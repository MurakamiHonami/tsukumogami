import { yokaiImageMap } from '../constants/yokai'

function PageHeader({ title, subtitle, badge }) {
  return (
    <div className={`header ${badge.variant === 'count' ? 'calendar-header' : ''}`}>
      <div>
        <h1>{title}</h1>
        <p className="sub">{subtitle}</p>
      </div>
      <div className={`yokai ${badge.variant === 'count' ? 'calendar-yokai' : ''}`}>
        {badge.variant === 'image' ? (
          <>
            <img src={`/${yokaiImageMap[badge.yokai]}`} alt={badge.yokai} className="yokai-img" />
            <span className="yokai-badge-label">{badge.label}</span>
          </>
        ) : (
          <span>{badge.label}</span>
        )}
      </div>
    </div>
  )
}

export default PageHeader
