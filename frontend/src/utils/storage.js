const STORAGE_KEY = 'tsukumogami-expiration-entries'
const AUTH_STORAGE_KEY = 'tsukumogami-current-user'

export function loadSavedEntries() {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    const parsed = stored ? JSON.parse(stored) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveSavedEntries(savedEntries) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedEntries))
}

export function loadCurrentUser() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const stored = window.localStorage.getItem(AUTH_STORAGE_KEY)
    const parsed = stored ? JSON.parse(stored) : null
    if (!parsed || typeof parsed !== 'object') {
      return null
    }

    if (!parsed.id || !parsed.username) {
      return null
    }

    return { id: parsed.id, username: parsed.username }
  } catch {
    return null
  }
}

export function saveCurrentUser(user) {
  if (typeof window === 'undefined') {
    return
  }

  if (!user) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    return
  }

  window.localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({ id: user.id, username: user.username }),
  )
}
