/**
 * Sends a message via Telegram Bot API.
 * Requires VITE_TELEGRAM_BOT_TOKEN and VITE_TELEGRAM_CHAT_ID env vars.
 */
export async function sendTelegramMessage(text) {
  const token = import.meta.env.VITE_TELEGRAM_BOT_TOKEN
  const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID
  if (!token || !chatId) throw new Error('Telegram credentials not configured')

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Telegram API error: ${body}`)
  }
}

/**
 * Builds the reminder message text for an expiring rental.
 */
export function buildReminderText(rental) {
  return (
    `🛵 <b>DOKON Reminder</b>\n` +
    `Courier: ${rental.courier?.full_name} | ${rental.courier?.phone}\n` +
    `Scooter: ${rental.scooter?.model} - ${rental.scooter?.plate}\n` +
    `Rental ends: ${rental.end_date}\n` +
    `Agreement: ${rental.agreement_no}\n\n` +
    `Action required: Renew or return scooter.`
  )
}
