import PageHeader from '../components/PageHeader'
import { yokaiImageMap, yokaiList } from '../constants/yokai'
import { formatDisplayDate } from '../utils/date'

function YokaiDexPage({ yokaiDex }) {
  const discoveredCount = yokaiDex.filter((item) => item.encountered).length
  const completedTotal = yokaiDex.reduce((total, item) => total + item.completedCount, 0)
  const showcaseBadges = yokaiList.slice(0, 3).map((yokai) => ({
    variant: 'image',
    yokai,
    label: yokai,
  }))

  return (
    <div className="dex-page">
      <PageHeader
        title="妖怪図鑑"
        subtitle="出会った付喪神の記録を集める、あなただけの図鑑です。"
      />

      {discoveredCount === 0 ? (
        <div className="empty-state">まだ妖怪に出会っていません。登録して最初の一体を見つけましょう。</div>
      ) : null}

      <div className="dex-grid">
        {yokaiDex.map((entry) => (
          <article key={entry.yokai} className={`dex-card ${entry.encountered ? 'is-discovered' : 'is-hidden'}`}>
            <div className="dex-card-art">
              <img
                src={`/${yokaiImageMap[entry.yokai]}`}
                alt={entry.encountered ? entry.yokai : '未発見の妖怪'}
                className="dex-card-image"
              />
              <span className="dex-card-number">{`No.${String(yokaiList.indexOf(entry.yokai) + 1).padStart(2, '0')}`}</span>
            </div>

            <div className="dex-card-body">
              <h3 className="dex-card-name">{entry.encountered ? entry.yokai : '???'}</h3>

              {entry.encountered ? (
                <div className="dex-card-stats">
                  <p>{`遭遇: ${entry.totalCount}回`}</p>
                  <p>{`交換: ${entry.completedCount}回`}</p>
                  <p>{`未交換: ${entry.pendingCount}件`}</p>
                  {entry.latestEncounterDate ? (
                    <p>{`記録日: ${formatDisplayDate(entry.latestEncounterDate)}`}</p>
                  ) : null}
                </div>
              ) : (
                <p className="dex-card-unknown">まだ出会っていない妖怪です</p>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default YokaiDexPage
