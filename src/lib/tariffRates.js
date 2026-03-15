/**
 * Daily rates (per day) for each tariff type.
 * Adjust these values to reflect actual pricing.
 */
export const TARIFF_RATES = {
  daily: 500,    // per day
  weekly: 450,   // per day (7 days)
  monthly: 400,  // per day (30 days)
}

/**
 * Calculate the total charge for a rental based on tariff + duration.
 * @param {string} tariff - 'daily' | 'weekly' | 'monthly'
 * @param {string} startDate - ISO date string
 * @param {string} endDate - ISO date string
 * @returns {number} total amount charged
 */
export function calcTotalCharged(tariff, startDate, endDate) {
  if (!tariff || !startDate || !endDate) return 0
  const start = new Date(startDate)
  const end = new Date(endDate)
  const days = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1
  const rate = TARIFF_RATES[tariff] ?? 0
  return days * rate
}
