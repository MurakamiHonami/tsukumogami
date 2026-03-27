function AppNavigation({ activePage, onPageChange }) {
  return (
    <nav className="nav">
      <button
        type="button"
        className={`nav-button ${activePage === 'register' ? 'active' : ''}`}
        onClick={() => onPageChange('register')}
      >
        登録
      </button>
      <button
        type="button"
        className={`nav-button ${activePage === 'calendar' ? 'active' : ''}`}
        onClick={() => onPageChange('calendar')}
      >
        カレンダー
      </button>
      <button
        type="button"
        className={`nav-button ${activePage === 'dex' ? 'active' : ''}`}
        onClick={() => onPageChange('dex')}
      >
        図鑑
      </button>
    </nav>
  )
}

export default AppNavigation
