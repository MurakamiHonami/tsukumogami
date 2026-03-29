import { yokaiImageMap } from '../constants/yokai'
import { formatDisplayDate } from '../utils/date'

const yokaiAppearanceEffectSrc = `/animation.mp4`

function ResultCard({ result, resultYokai }) {
  if (!result) {
    return null
  }

  const yokaiName =
    typeof resultYokai === 'string' ? resultYokai : resultYokai?.name ?? '化け猫'
  const yokaiImage = yokaiAppearanceEffectSrc && yokaiImageMap[yokaiName] ? `/${yokaiImageMap[yokaiName]}` : null

  return (
    <div className="result">
      <div className="smoke">交換期限が記録されました</div>
      <div className="yokai-appear">
        <video
          className="yokai-appear-bg"
          src={yokaiAppearanceEffectSrc}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        />
        <div className="yokai-appear-content">
          {yokaiImage ? <img src={yokaiImage} alt={yokaiName} className="yokai-display" /> : null}
          <p className="yokai-text">{yokaiName}が出現した！</p>
        </div>
      </div>
      <h2>物品情報</h2>
      <p className="product">
        ・物品名
        <br />
        <small>{result.product_name}</small>
      </p>
      <p className="category">
        ・カテゴリ
        <br />
        <small>{result.category}</small>
      </p>
      <p className="expiry">
        ・交換期限
        <br />
        <small>{formatDisplayDate(result.suggested_expiration)}</small>
      </p>
      <p className="reason">
        ・理由
        <br />
        <small>{result.reason}</small>
      </p>
      {result.product_image && <img className="item-image" src={result.product_image} alt="商品画像" />}
    </div>
  )
}

export default ResultCard
