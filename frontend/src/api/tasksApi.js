const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '')

function buildUserHeaders(userId) {
  if (!userId) {
    return {}
  }

  return { 'X-User-Id': String(userId) }
}

function toEntry(task) {
  return {
    id: task.id,
    barcode: task.barcode ?? '',
    purchaseDate: task.purchase_date ?? '',
    productName: task.product_name ?? task.task_name ?? '',
    category: task.category ?? '',
    suggestedExpiration: task.suggested_expiration ?? '',
    reason: task.reason ?? '',
    productImage: task.product_image ?? null,
    yokai: task.yokai ?? null,
    completed: Boolean(task.task_is_done),
    completedAt: task.completed_at ?? null,
  }
}

async function parseJson(response) {
  return response.json().catch(() => ({}))
}

export async function fetchTasks(userId) {
  const response = await fetch(`${API_BASE}/api/tasks`, {
    headers: buildUserHeaders(userId),
  })
  const body = await parseJson(response)

  if (!response.ok) {
    throw new Error(body.detail || 'タスクの取得に失敗しました')
  }

  return Array.isArray(body) ? body.map(toEntry) : []
}

export async function createTask({ barcode, purchaseDate, estimate, yokai, userId }) {
  const response = await fetch(`${API_BASE}/api/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...buildUserHeaders(userId) },
    body: JSON.stringify({
      barcode,
      purchase_date: purchaseDate,
      product_name: estimate.product_name,
      category: estimate.category,
      suggested_expiration: estimate.suggested_expiration,
      reason: estimate.reason,
      product_image: estimate.product_image,
      yokai,
    }),
  })

  const body = await parseJson(response)
  if (!response.ok) {
    throw new Error(body.detail || 'タスクの登録に失敗しました')
  }

  return toEntry(body)
}

export async function completeTask(taskId, userId) {
  const response = await fetch(`${API_BASE}/api/tasks/${taskId}/done`, {
    method: 'PUT',
    headers: buildUserHeaders(userId),
  })

  const body = await parseJson(response)
  if (!response.ok) {
    throw new Error(body.detail || 'タスクの完了更新に失敗しました')
  }

  return toEntry(body)
}
