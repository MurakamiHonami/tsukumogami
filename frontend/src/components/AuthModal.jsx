import { useState } from 'react'

function AuthModal({ isOpen, onClose, onLogin, onRegister, submitting, error }) {
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  if (!isOpen) {
    return null
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const payload = { username: username.trim(), password }

    if (mode === 'login') {
      await onLogin(payload)
      return
    }

    await onRegister(payload)
  }

  return (
    <div className="calendar-modal-backdrop" onClick={onClose}>
      <div className="calendar-modal auth-modal" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="calendar-modal-close auth-modal-close" onClick={onClose} aria-label="閉じる">
          ×
        </button>

        <div className="auth-mode-switch">
          <button
            type="button"
            className={`auth-mode-button ${mode === 'register' ? 'active' : ''}`}
            onClick={() => setMode('register')}
          >
            登録
          </button>
          <button
            type="button"
            className={`auth-mode-button ${mode === 'login' ? 'active' : ''}`}
            onClick={() => setMode('login')}
          >
            ログイン
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="auth-username">ユーザー名</label>
          <input
            id="auth-username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="例: taro"
            maxLength={64}
            required
          />

          <label htmlFor="auth-password">パスワード</label>
          <input
            id="auth-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="8文字以上"
            minLength={8}
            required
          />

          {error && <p className="error">{error}</p>}

          <button type="submit" className="auth-submit-button" disabled={submitting}>
            {submitting ? '送信中...' : mode === 'login' ? 'ログインする' : '登録する'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AuthModal
