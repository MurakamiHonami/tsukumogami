function SceneHeader({ currentUser, onOpenAuthModal, onLogout }) {
  return (
    <div className="scene">
      <div className="auth-area">
        {currentUser ? (
          <button type="button" className="auth-button" onClick={onLogout}>
            ログアウト
          </button>
        ) : (
          <button type="button" className="auth-button" onClick={onOpenAuthModal}>
            登録・ログイン
          </button>
        )}
      </div>

      <h1 className="cloud">
        <span className="cloud-title">つくモニ</span>
        <span className="cloud-subtitle">付喪神モニタリング</span>
        <img src="/chouchin.png" alt="" className="floating-lantern" aria-hidden="true" />
      </h1>
    </div>
  )
}

export default SceneHeader
