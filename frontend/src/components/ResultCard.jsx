import { yokaiImageMap } from '../constants/yokai'
import { formatDisplayDate } from '../utils/date'

function ResultCard({ result, resultYokai }) {
  if (!result) {
    return null
  }

  return (
    <div className="result">
      <div className="smoke">煙が漂い… カレンダーにも記録されました</div>
      <div className="yokai-appear">
        <img src={`/${yokaiImageMap[resultYokai]}`} alt={resultYokai} className="yokai-display" />
        <p className="yokai-text">{resultYokai}が出現した！</p>
      </div>
      <h2>物品情報</h2>
      <p className="product">📦 {result.product_name}</p>
      <p className="category">🪓 カテゴリ: {result.category}</p>
      <p className="expiry">⏳ 期限日: {formatDisplayDate(result.suggested_expiration)}</p>
      <p className="reason">✍️ {result.reason}</p>
      {result.product_image && <img className="item-image" src={result.product_image} alt="商品" />}
    </div>
  )
}

export default ResultCard
