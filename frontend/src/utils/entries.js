export function createSavedEntry({ barcode, purchaseDate, estimate }) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    barcode,
    purchaseDate,
    productName: estimate.product_name,
    category: estimate.category,
    suggestedExpiration: estimate.suggested_expiration,
    reason: estimate.reason,
    productImage: estimate.product_image,
  }
}

export function getItemsByDate(savedEntries) {
  return savedEntries.reduce((grouped, entry) => {
    if (!grouped[entry.suggestedExpiration]) {
      grouped[entry.suggestedExpiration] = []
    }

    grouped[entry.suggestedExpiration].push(entry)
    return grouped
  }, {})
}

export function getMonthlyEntries(savedEntries, calendarMonth) {
  const monthKey = `${calendarMonth.getFullYear()}-${`${calendarMonth.getMonth() + 1}`.padStart(2, '0')}`

  return [...savedEntries]
    .filter((entry) => entry.suggestedExpiration.startsWith(monthKey))
    .sort((left, right) => left.suggestedExpiration.localeCompare(right.suggestedExpiration))
}

export function getUpcomingEntry(savedEntries) {
  return [...savedEntries]
    .sort((left, right) => left.suggestedExpiration.localeCompare(right.suggestedExpiration))[0]
}
