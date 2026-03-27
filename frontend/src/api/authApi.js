const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '')

async function parseJson(response) {
  return response.json().catch(() => ({}))
}

async function postAuth(path, username, password) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

  const body = await parseJson(response)
  if (!response.ok) {
    throw new Error(body.detail || '認証に失敗しました')
  }

  return body
}

export function registerUser({ username, password }) {
  return postAuth('/api/auth/register', username, password)
}

export function loginUser({ username, password }) {
  return postAuth('/api/auth/login', username, password)
}
