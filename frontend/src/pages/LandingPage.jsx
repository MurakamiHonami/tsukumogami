import './LandingPage.css'

const painPoints = [
  '冷蔵庫の奥で、買ったことすら忘れた食品が見つかる',
  '消費期限・賞味期限を覚えておけず、気づいたときには手遅れ',
  '家族と在庫情報が共有できず、同じものをまた買ってしまう',
]

const featureCards = [
  {
    title: 'バーコード登録',
    description:
      '商品コードと購入日を入れるだけで、期限の目安をすばやく整理。入力の面倒さを減らして、続けやすくします。',
  },
  {
    title: '妖怪モチーフ通知',
    description:
      'ただのリマインドではなく、気になる演出で「見たくなる管理」に変換。放置しがちな期限確認を習慣化します。',
  },
  {
    title: 'カレンダーで一覧化',
    description:
      'いつ何を食べ切るべきかがひと目で分かるので、献立や買い足しの判断がしやすくなります。',
  },
]

const valuePoints = [
  '食品ロスを減らして、家計のムダを抑えられる',
  '管理の心理的ハードルを下げて、三日坊主になりにくい',
  '楽しい世界観で、家族も巻き込みやすい',
]

function LandingPage() {
  return (
    <main className="lp-page">
      <section className="lp-hero">
        <div className="lp-hero-copy">
          <p className="lp-kicker">TSUKUMOGAMI FOOD WATCH</p>
          <h1>面倒な交換作業を、忘れない体験に。</h1>
          <p className="lp-lead">
            つくモニは、忘れがちな交換期限管理を「面倒な作業」から「続けられる習慣」へ変える、
            タスクマネジメントサービスです。
          </p>
          <div className="lp-hero-actions">
            <a className="lp-primary-action" href="/">
              アプリを使ってみる
            </a>
            <a className="lp-secondary-action" href="#lp-value">
              価値を見る
            </a>
          </div>
          <ul className="lp-proof-list" aria-label="主な価値">
            <li>期限切れの見逃しを防ぐ</li>
            <li>食品ロスと重複購入を減らす</li>
            <li>和風で印象に残る体験設計</li>
          </ul>
        </div>

        <div className="lp-stage">
          <div className="lp-stage-paper">
            <img src="/chouchin.png" alt="" className="lp-stage-float lp-stage-float-lantern" />
            <img src="/kitsune.png" alt="" className="lp-stage-character lp-stage-character-main" />
            <img src="/kappa.png" alt="" className="lp-stage-character lp-stage-character-sub" />
            <div className="lp-stage-card lp-stage-card-top">
              <span>買った日を登録</span>
              <strong>期限の目安を整理</strong>
            </div>
            <div className="lp-stage-card lp-stage-card-bottom">
              <span>カレンダーで確認</span>
              <strong>食べ忘れを先回り</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="lp-section lp-problem">
        <div className="lp-section-heading">
          <p className="lp-kicker">Problem</p>
          <h2>冷蔵庫の中の「見えない損失」を減らす</h2>
        </div>
        <div className="lp-problem-grid">
          {painPoints.map((point) => (
            <article key={point} className="lp-problem-card">
              <p>{point}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="lp-section lp-value" id="lp-value">
        <div className="lp-section-heading">
          <p className="lp-kicker">Value</p>
          <h2>つくもがみが提供する価値</h2>
        </div>
        <div className="lp-value-layout">
          <div className="lp-value-copy">
            <p>
              つくもがみは、期限情報を記録するだけで終わりません。忘れやすさ、面倒くささ、
              見返さなさまで含めて設計し、管理そのものを続けやすくします。
            </p>
            <div className="lp-value-points">
              {valuePoints.map((point) => (
                <div key={point} className="lp-value-point">
                  {point}
                </div>
              ))}
            </div>
          </div>
          <div className="lp-value-visual" aria-hidden="true">
            <div className="lp-value-orbit lp-value-orbit-one" />
            <div className="lp-value-orbit lp-value-orbit-two" />
            <img src="/manekineko.png" alt="" className="lp-value-image lp-value-image-main" />
            <img src="/oni.png" alt="" className="lp-value-image lp-value-image-accent" />
          </div>
        </div>
      </section>

      <section className="lp-section lp-features">
        <div className="lp-section-heading">
          <p className="lp-kicker">Appeal Point</p>
          <h2>続けやすさを支える3つの仕組み</h2>
        </div>
        <div className="lp-feature-grid">
          {featureCards.map((feature) => (
            <article key={feature.title} className="lp-feature-card">
              <p className="lp-feature-index">{feature.title}</p>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="lp-section lp-flow">
        <div className="lp-section-heading">
          <p className="lp-kicker">How It Works</p>
          <h2>使い方はシンプル</h2>
        </div>
        <div className="lp-flow-steps">
          <article className="lp-flow-step">
            <span>01</span>
            <h3>商品を登録</h3>
            <p>バーコードと購入日を入力して、管理をスタート。</p>
          </article>
          <article className="lp-flow-step">
            <span>02</span>
            <h3>期限を見える化</h3>
            <p>推定された期限をもとに、優先して食べるべき食材を整理。</p>
          </article>
          <article className="lp-flow-step">
            <span>03</span>
            <h3>通知とカレンダーで回収</h3>
            <p>見返したくなる UI で、食べ忘れの前に気づけます。</p>
          </article>
        </div>
      </section>

      <section className="lp-section lp-cta">
        <p className="lp-kicker">Start</p>
        <h2>面倒な期限管理を、ちょっと楽しみに変える。</h2>
        <p>
          まずは `/` の登録画面から、ひとつ食材を入れてみてください。つくもがみの世界観ごと、
          冷蔵庫管理の手触りが変わります。
        </p>
        <a className="lp-primary-action" href="/">
          つくもがみをはじめる
        </a>
      </section>
    </main>
  )
}

export default LandingPage
