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
        交換期限
      </button>
    </nav>
  )
}

export default AppNavigation
