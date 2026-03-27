import { yokaiList } from '../constants/yokai'

function hashText(value) {
  return [...value].reduce((total, char) => total + char.charCodeAt(0), 0)
}

export function getEntryYokai(entry) {
  if (entry.yokai && yokaiList.includes(entry.yokai)) {
    return entry.yokai
  }

  const fallbackSeed = `${entry.productName ?? ''}-${entry.category ?? ''}-${entry.id ?? ''}`
  return yokaiList[hashText(fallbackSeed) % yokaiList.length]
}

export function createSavedEntry({ barcode, purchaseDate, estimate, yokai }) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    barcode,
    purchaseDate,
    productName: estimate.product_name,
    category: estimate.category,
    suggestedExpiration: estimate.suggested_expiration,
    reason: estimate.reason,
    productImage: estimate.product_image,
    yokai: yokai ?? yokaiList[hashText(`${estimate.product_name}-${estimate.category}`) % yokaiList.length],
    completed: false,
    completedAt: null,
  }
}

export function getItemsByDate(savedEntries) {
  return savedEntries.reduce((grouped, entry) => {
    if (!grouped[entry.suggestedExpiration]) {
      grouped[entry.suggestedExpiration] = []
    }

    grouped[entry.suggestedExpiration].push({
      ...entry,
      completed: Boolean(entry.completed),
      completedAt: entry.completedAt ?? null,
    })
    return grouped
  }, {})
}

export function getMonthlyEntries(savedEntries, calendarMonth) {
  const monthKey = `${calendarMonth.getFullYear()}-${`${calendarMonth.getMonth() + 1}`.padStart(2, '0')}`

  return [...savedEntries]
    .filter((entry) => entry.suggestedExpiration.startsWith(monthKey))
    .sort((left, right) => left.suggestedExpiration.localeCompare(right.suggestedExpiration))
    .map((entry) => ({
      ...entry,
      completed: Boolean(entry.completed),
      completedAt: entry.completedAt ?? null,
    }))
}

export function getUpcomingEntry(savedEntries) {
  return [...savedEntries]
    .filter((entry) => !entry.completed)
    .sort((left, right) => left.suggestedExpiration.localeCompare(right.suggestedExpiration))[0]
}

export function getYokaiDex(savedEntries) {
  const statsByYokai = savedEntries.reduce((accumulator, entry) => {
    const yokai = getEntryYokai(entry)
    const current = accumulator[yokai] ?? {
      yokai,
      encountered: false,
      totalCount: 0,
      completedCount: 0,
      pendingCount: 0,
      latestProductName: null,
      latestEncounterDate: null,
    }

    current.encountered = true
    current.totalCount += 1
    current.completedCount += entry.completed ? 1 : 0
    current.pendingCount += entry.completed ? 0 : 1
    current.latestProductName = entry.productName ?? current.latestProductName
    current.latestEncounterDate = entry.suggestedExpiration ?? current.latestEncounterDate

    accumulator[yokai] = current
    return accumulator
  }, {})

  return yokaiList.map((yokai) => {
    const stats = statsByYokai[yokai]
    if (stats) {
      return stats
    }

    return {
      yokai,
      encountered: false,
      totalCount: 0,
      completedCount: 0,
      pendingCount: 0,
      latestProductName: null,
      latestEncounterDate: null,
    }
  })
}
