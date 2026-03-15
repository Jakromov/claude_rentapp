import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { sendTelegramMessage, buildReminderText } from '@/lib/telegram'
import { calcTotalCharged } from '@/lib/tariffRates'
import StatusBadge from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Bell, Loader2 } from 'lucide-react'

function StatCard({ label, value }) {
  return (
    <div className="rounded-lg border bg-card p-4 flex flex-col gap-1">
      <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
      <span className="text-2xl font-bold">{value ?? '—'}</span>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [expiring, setExpiring] = useState([])
  const [overdue, setOverdue] = useState([])
  const [active, setActive] = useState([])
  const [loading, setLoading] = useState(true)
  const [sendingId, setSendingId] = useState(null)
  const [sentIds, setSentIds] = useState(new Set())

  useEffect(() => {
    fetchDashboard()
  }, [])

  async function fetchDashboard() {
    setLoading(true)
    try {
      const { data: scooters } = await supabase.from('scooters').select('status')
      const total = scooters?.length ?? 0
      const rented = scooters?.filter((s) => s.status === 'rented').length ?? 0
      const available = scooters?.filter((s) => s.status === 'available').length ?? 0
      const maintenance = scooters?.filter((s) => s.status === 'maintenance').length ?? 0

      const { data: activeRentals } = await supabase
        .from('rentals')
        .select(`*, courier:couriers(id, full_name, phone), scooter:scooters(id, model, plate)`)
        .eq('status', 'active')
        .order('end_date', { ascending: true })

      const rentalsArr = activeRentals || []

      const now = new Date()
      const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
      const { data: monthPayments } = await supabase
        .from('payments')
        .select('amount')
        .gte('paid_at', monthStart)
      const monthlyRevenue = (monthPayments || []).reduce((s, p) => s + Number(p.amount), 0)

      setStats({ total, rented, available, maintenance, monthlyRevenue })

      const todayStr = now.toISOString().split('T')[0]
      const in2Days = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      setExpiring(rentalsArr.filter((r) => r.end_date >= todayStr && r.end_date <= in2Days))

      const { data: allPayments } = await supabase.from('payments').select('rental_id, amount')
      const paidMap = {}
      ;(allPayments || []).forEach((p) => {
        paidMap[p.rental_id] = (paidMap[p.rental_id] || 0) + Number(p.amount)
      })
      setOverdue(
        rentalsArr
          .map((r) => ({
            ...r,
            totalCharged: calcTotalCharged(r.tariff, r.start_date, r.end_date),
            totalPaid: paidMap[r.id] || 0,
          }))
          .filter((r) => r.totalCharged - r.totalPaid > 0),
      )
      setActive(rentalsArr)
    } finally {
      setLoading(false)
    }
  }

  async function handleSendReminder(rental) {
    setSendingId(rental.id)
    try {
      await sendTelegramMessage(buildReminderText(rental))
      setSentIds((prev) => new Set([...prev, rental.id]))
    } catch (err) {
      alert(`Failed to send: ${err.message}`)
    } finally {
      setSendingId(null)
    }
  }

  if (loading) return <p className="p-6 text-muted-foreground text-sm">Loading...</p>

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <StatCard label="Total Scooters" value={stats?.total} />
        <StatCard label="Rented" value={stats?.rented} />
        <StatCard label="Available" value={stats?.available} />
        <StatCard label="Maintenance" value={stats?.maintenance} />
        <StatCard label="Monthly Revenue" value={stats?.monthlyRevenue?.toLocaleString()} />
      </div>

      {/* Expiring Soon */}
      <section>
        <h2 className="text-lg font-semibold mb-3">
          Expiring Soon
          {expiring.length > 0 && (
            <span className="ml-2 text-sm text-orange-600 font-normal">
              ({expiring.length})
            </span>
          )}
        </h2>
        {expiring.length === 0 ? (
          <p className="text-sm text-muted-foreground">No rentals expiring in the next 2 days.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agreement</TableHead>
                  <TableHead>Courier</TableHead>
                  <TableHead>Scooter</TableHead>
                  <TableHead>Ends</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expiring.map((r) => (
                  <TableRow
                    key={r.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/rentals/${r.id}`)}
                  >
                    <TableCell className="font-mono text-xs">{r.agreement_no}</TableCell>
                    <TableCell>{r.courier?.full_name}</TableCell>
                    <TableCell>{r.scooter?.plate}</TableCell>
                    <TableCell className="text-orange-600 font-medium">{r.end_date}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant={sentIds.has(r.id) ? 'ghost' : 'outline'}
                        disabled={sendingId === r.id || sentIds.has(r.id)}
                        onClick={() => handleSendReminder(r)}
                      >
                        {sendingId === r.id ? (
                          <Loader2 size={12} className="mr-1 animate-spin" />
                        ) : (
                          <Bell size={12} className="mr-1" />
                        )}
                        {sentIds.has(r.id) ? 'Sent' : 'Remind'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      {/* Overdue Payments */}
      <section>
        <h2 className="text-lg font-semibold mb-3">
          Overdue Payments
          {overdue.length > 0 && (
            <span className="ml-2 text-sm text-red-600 font-normal">({overdue.length})</span>
          )}
        </h2>
        {overdue.length === 0 ? (
          <p className="text-sm text-muted-foreground">No overdue payments.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agreement</TableHead>
                  <TableHead>Courier</TableHead>
                  <TableHead>Scooter</TableHead>
                  <TableHead>Charged</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overdue.map((r) => (
                  <TableRow
                    key={r.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/rentals/${r.id}`)}
                  >
                    <TableCell className="font-mono text-xs">{r.agreement_no}</TableCell>
                    <TableCell>{r.courier?.full_name}</TableCell>
                    <TableCell>{r.scooter?.plate}</TableCell>
                    <TableCell>{r.totalCharged.toLocaleString()}</TableCell>
                    <TableCell>{r.totalPaid.toLocaleString()}</TableCell>
                    <TableCell className="text-red-600 font-semibold">
                      {(r.totalCharged - r.totalPaid).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      {/* All Active Rentals */}
      <section>
        <h2 className="text-lg font-semibold mb-3">
          Active Rentals
          <span className="ml-2 text-sm text-muted-foreground font-normal">({active.length})</span>
        </h2>
        {active.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active rentals.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agreement</TableHead>
                  <TableHead>Courier</TableHead>
                  <TableHead>Scooter</TableHead>
                  <TableHead>Tariff</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {active.map((r) => (
                  <TableRow
                    key={r.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/rentals/${r.id}`)}
                  >
                    <TableCell className="font-mono text-xs">{r.agreement_no}</TableCell>
                    <TableCell>{r.courier?.full_name}</TableCell>
                    <TableCell>{r.scooter?.plate}</TableCell>
                    <TableCell className="capitalize">{r.tariff}</TableCell>
                    <TableCell>{r.end_date}</TableCell>
                    <TableCell>
                      <StatusBadge status={r.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  )
}
