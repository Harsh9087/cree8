import React, { useEffect, useMemo, useState } from 'react'
import { api, login, signup } from './api'
import { SEAT_COORDINATES } from './seatCoordinates'
import { Armchair, Users, LayoutDashboard, LogOut, UserPlus, Search, RefreshCw, X, CheckCircle2, IndianRupee, CalendarDays, CreditCard, ChevronRight, Menu, Edit2, Sparkles, AlertCircle, Filter, Download, ArrowUpDown, Calendar, RotateCcw, SlidersHorizontal, FileText, Printer, Clock, UserCheck, UserX, Repeat, AlertTriangle, Check, HelpCircle } from 'lucide-react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

const priceFor = (chair, duration) => {
  if (Number(duration) === 0) return 100
  return (chair === 'executive' ? 1590 : 1390) * Number(duration)
}
function Login({ onLogin, onSignup }) {
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError('Passwords do not match.')
        return
      }
      if (password.length < 4) {
        setError('Password must be at least 4 characters long.')
        return
      }
    }
    setBusy(true)
    try {
      if (mode === 'login') {
        await onLogin(username, password)
      } else {
        await onSignup(username, password, email)
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  function switchMode(newMode) {
    setMode(newMode)
    setError('')
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="brand-mark">
          <Armchair size={26} />
        </div>
        <p className="eyebrow">CREE8 STUDY & CO-WORK</p>
        <h1>{mode === 'login' ? 'Welcome back' : 'Create an account'}</h1>
        <p className="muted">
          {mode === 'login'
            ? 'Sign in to manage students, seats and payments.'
            : 'Sign up for new admin access to the library portal.'}
        </p>

        <div className="auth-tab-group">
          <button
            type="button"
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => switchMode('login')}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => switchMode('signup')}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={submit} className="form-stack">
          <label>
            Username *
            <input
              autoComplete="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              placeholder="Enter your username"
            />
          </label>

          {mode === 'signup' && (
            <label>
              Email address
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Optional, e.g. admin@cree8.com"
              />
            </label>
          )}

          <label>
            Password *
            <input
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </label>

          {mode === 'signup' && (
            <label>
              Confirm password *
              <input
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                placeholder="Re-enter your password"
              />
            </label>
          )}

          {error && <div className="error">{error}</div>}

          <button className="primary full" disabled={busy}>
            {busy
              ? (mode === 'login' ? 'Signing in…' : 'Creating account…')
              : (mode === 'login' ? 'Sign in to dashboard' : 'Sign up & enter dashboard')}
          </button>
        </form>

        <div className="auth-toggle-prompt">
          {mode === 'login' ? (
            <>
              Don't have an account yet?
              <button type="button" className="link-button" onClick={() => switchMode('signup')}>
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?
              <button type="button" className="link-button" onClick={() => switchMode('login')}>
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
function SeatMap({ seats, onSeatClick }) {
  const byNumber = useMemo(() => Object.fromEntries(seats.map(s => [s.number, s])), [seats])

  return (
    <div className="map-shell">
      <div className="map-wall architectural-blueprint-canvas">
        <svg
          viewBox="15 10 690 1210"
          className="architectural-svg-map"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Subtle blueprint grid */}
          <defs>
            <pattern id="archGrid" width="27" height="27" patternUnits="userSpaceOnUse">
              <path d="M 27 0 L 0 0 0 27" fill="none" stroke="#f1f5f9" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect x="15" y="10" width="690" height="1210" fill="url(#archGrid)" />

          {/* Left continuous room wall: from Y=20 down to Y=1200 */}
          <line x1="40" y1="20" x2="40" y2="1200" className="blueprint-wall-main" />

          {/* Top walkway connector bridging Table 7 to Table 8 */}
          <line x1="194" y1="30" x2="302" y2="30" className="blueprint-wall" />

          {/* Right wall connecting row 25 down past double block (26 & 44) to row 45 */}
          <line x1="680" y1="516" x2="680" y2="876" className="blueprint-wall" />

          {/* Bottom alcove floor baseline connecting Table 60 across Table 59 to Table 58 */}
          <line x1="40" y1="1200" x2="242" y2="1200" className="blueprint-wall" />

          {/* Subtle architectural walkway labels */}
          <text x="90" y="270" className="arch-aisle-label" transform="rotate(-90 90 270)">MAIN CORRIDOR</text>
          <text x="248" y="270" className="arch-aisle-label" transform="rotate(-90 248 270)">NORTH AISLE</text>
          <text x="464" y="606" className="arch-aisle-label">PASSAGEWAY</text>
          <text x="464" y="786" className="arch-aisle-label">PASSAGEWAY</text>

          {/* All 64 Architectural Tables (Perfect Squares) */}
          {Object.entries(SEAT_COORDINATES).map(([numStr, c]) => {
            const num = Number(numStr)
            const seat = byNumber[num]
            const occupied = seat?.status === 'occupied'
            const chair = seat?.allocation?.chair_type
            const studentName = seat?.allocation?.student_name

            return (
              <g
                key={num}
                className={`seat-svg-node ${occupied ? 'occupied' : 'available'} ${chair ? `chair-${chair}` : ''}`}
                onClick={() => onSeatClick(num)}
                tabIndex={0}
                role="button"
                aria-label={`Seat ${num}`}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSeatClick(num) }}
              >
                <title>
                  {occupied
                    ? `Seat ${num} · Occupied by ${studentName || 'Student'} (${chair === 'executive' ? 'Executive Chair' : 'Normal Chair'})`
                    : `Seat ${num} · Available (Click to allocate)`}
                </title>

                {/* Perfect Square Table Box (width === height === 54) */}
                <rect
                  x={c.x}
                  y={c.y}
                  width={c.w}
                  height={c.h}
                  rx="3"
                  className="seat-svg-rect"
                />

                {/* Table Number */}
                <text
                  x={c.x + c.w / 2}
                  y={c.y + (occupied ? 21 : 27)}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="seat-svg-num"
                >
                  {num}
                </text>

                {/* Status subtext / badge for occupied seats */}
                {occupied && (
                  <text
                    x={c.x + c.w / 2}
                    y={c.y + 38}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="seat-svg-sub"
                  >
                    {chair === 'executive' ? 'EXEC' : 'OCC'}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      <div className="map-legend">
        <span className="legend-item"><span className="legend-box available"></span> Available</span>
        <span className="legend-item"><span className="legend-box occupied"></span> Occupied (Normal)</span>
        <span className="legend-item"><span className="legend-box executive"></span> Occupied (Executive)</span>
        <span className="legend-hint">📐 Pixel-exact architectural layout · Click any table to allocate or view details</span>
      </div>
    </div>
  )
}
function Modal({ children, onClose, title }) { return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><div className="modal"><div className="modal-head"><h2>{title}</h2><button className="icon-button" onClick={onClose}><X size={20}/></button></div>{children}</div></div> }
function App() {
  const [user,setUser] = useState(null)
  const [page,setPage] = useState('dashboard')
  const [students,setStudents] = useState([])
  const [seats,setSeats] = useState([])
  const [transactions,setTransactions] = useState([])
  const [allocations,setAllocations] = useState([])
  const [dashboard,setDashboard] = useState({})
  const [loading,setLoading] = useState(false)
  const [error,setError] = useState('')
  const [notice,setNotice] = useState('')
  const [query,setQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigateTo = (p) => {
    setPage(p)
    setMobileMenuOpen(false)
  }
  const [pendingFilter,setPendingFilter] = useState('active')
  const [pendingSearch,setPendingSearch] = useState('')
  const [collectingAllocation,setCollectingAllocation] = useState(null)
  const [collectForm,setCollectForm] = useState({amount:'',payment_mode:'UPI'})
  const [txnFilter, setTxnFilter] = useState({
    search: '',
    timeframe: 'all',
    startDate: '',
    endDate: '',
    type: 'all',
    mode: 'all',
    amountPreset: 'all',
    minAmount: '',
    maxAmount: '',
    sortBy: 'date_desc',
    showAdvanced: false,
  })
  function resetTxnFilter() {
    setTxnFilter({
      search: '',
      timeframe: 'all',
      startDate: '',
      endDate: '',
      type: 'all',
      mode: 'all',
      amountPreset: 'all',
      minAmount: '',
      maxAmount: '',
      sortBy: 'date_desc',
      showAdvanced: false,
    })
  }
  const [selectedSeat,setSelectedSeat] = useState(null)
  const [showRegister,setShowRegister] = useState(false)
  const [studentForm,setStudentForm] = useState({id:'',name:'',gender:'Male',mobile:'',alternate_mobile:'',native_place:'',currently_studying:''})
  const [allocationForm,setAllocationForm] = useState({student:'',chair_type:'normal',duration_months:1,payment_mode:'UPI',amount_paid:'1390',start_date:new Date().toISOString().slice(0,10)})
  const [upgradePaymentMode,setUpgradePaymentMode] = useState('UPI')
  const [saving,setSaving] = useState(false)
  const [subscriptionsData, setSubscriptionsData] = useState({ stats: {}, allocations: [] })
  const [subFilter, setSubFilter] = useState('all')
  const [subSearch, setSubSearch] = useState('')
  const [verifyingAlloc, setVerifyingAlloc] = useState(null)
  const [verifyForm, setVerifyForm] = useState({ verification_status: 'confirmed_left', verification_notes: '' })
  const [renewingAlloc, setRenewingAlloc] = useState(null)
  const [renewForm, setRenewForm] = useState({
    seat_number: '',
    chair_type: 'normal',
    duration_months: 1,
    payment_mode: 'UPI',
    amount_paid: '1390',
    start_date: new Date().toISOString().slice(0, 10),
    verification_notes: ''
  })
  async function loadAll() {
    setLoading(true); setError('')
    try {
      const [s,st,d,txns,allc,subs] = await Promise.all([
        api('/seats/'),
        api('/students/'),
        api('/dashboard/'),
        api('/transactions/'),
        api('/allocations/'),
        api('/subscriptions/')
      ])
      setSeats(s); setStudents(st); setDashboard(d); setTransactions(txns); setAllocations(allc); setSubscriptionsData(subs)
      if (subs?.freed_in_this_check > 0) {
        setNotice(`Auto-freed ${subs.freed_in_this_check} seat(s) whose subscription period ended.`)
      }
    } catch(e) { setError(e.message) } finally { setLoading(false) }
  }
  useEffect(()=>{ api('/auth/me/').then(setUser).catch(()=>{}) },[])
  useEffect(()=>{ if(user) loadAll() },[user])
  async function handleLogin(username,password) { const u=await login(username,password); setUser(u) }
  async function handleSignup(username,password,email) { const u=await signup(username,password,email); setUser(u) }
  async function handleLogout() { try { await api('/auth/logout/',{method:'POST',body:'{}'}) } catch{} setUser(null) }
  function updateStudent(k,v) { setStudentForm(f=>({...f,[k]:v})) }
  function updateAllocation(k,v) { 
    setAllocationForm(f => {
      const next = {...f, [k]: v}
      if (k === 'chair_type' || k === 'duration_months') {
        next.amount_paid = String(priceFor(next.chair_type, next.duration_months))
      }
      return next
    })
  }
  async function handleAutomaticUpgrade() {
    if (!selectedSeat) return
    setSaving(true); setError(''); setNotice('')
    try {
      const res = await api(`/seats/${selectedSeat.number}/upgrade/`, {
        method: 'POST',
        body: JSON.stringify({
          payment_mode: upgradePaymentMode,
        })
      })
      setSelectedSeat(null)
      setNotice(res.detail || `Seat ${selectedSeat.number} upgraded to Executive Chair successfully.`)
      await loadAll()
    } catch(err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }
  async function registerStudent(e) {
    e.preventDefault(); setSaving(true); setError(''); setNotice('')
    try {
      if (studentForm.id) {
        await api(`/students/${studentForm.id}/`,{method:'PUT',body:JSON.stringify(studentForm)});
        setNotice('Student updated successfully.');
      } else {
        await api('/students/',{method:'POST',body:JSON.stringify(studentForm)});
        setNotice('Student registered successfully. You can now allocate a seat.');
      }
      setStudentForm({id:'',name:'',gender:'Male',mobile:'',alternate_mobile:'',native_place:'',currently_studying:''});
      setShowRegister(false);
      await loadAll()
    }
    catch(e){setError(e.message)} finally{setSaving(false)}
  }
  function openEditStudent(student) {
    setStudentForm({...student, gender: student.gender || 'Male'});
    setShowRegister(true);
  }
  function openSeat(number) {
    const seat=seats.find(s=>s.number===number)
    setSelectedSeat({number,...(seat||{})})
    setUpgradePaymentMode('UPI')
    setAllocationForm({student:'',chair_type:'normal',duration_months:1,payment_mode:'UPI',amount_paid:'1390',start_date:new Date().toISOString().slice(0,10)})
  }
  async function allocate(e) {
    e.preventDefault(); if(!selectedSeat)return
    setSaving(true); setError(''); setNotice('')
    try { await api(`/seats/${selectedSeat.number}/allocate/`,{method:'POST',body:JSON.stringify({...allocationForm,student:Number(allocationForm.student),duration_months:Number(allocationForm.duration_months),amount_paid:Number(allocationForm.amount_paid)})}); setSelectedSeat(null); setNotice(`Seat ${selectedSeat.number} allocated successfully.`); await loadAll() }
    catch(e){setError(e.message)} finally{setSaving(false)}
  }
  async function releaseSeat(number) {
    if(!window.confirm(`Release seat ${number}? The active allocation will be closed.`))return
    try { await api(`/seats/${number}/release/`,{method:'POST',body:'{}'}); setSelectedSeat(null); setNotice(`Seat ${number} is now available.`); await loadAll() } catch(e){setError(e.message)}
  }
  const pendingAllocations = useMemo(() => {
    return allocations.filter(a => Number(a.amount_pending) > 0)
  }, [allocations])

  const activePendingAllocations = useMemo(() => {
    return pendingAllocations.filter(a => a.is_active)
  }, [pendingAllocations])

  const filteredPending = useMemo(() => {
    return pendingAllocations.filter(a => {
      if (pendingFilter === 'active' && !a.is_active) return false
      if (pendingSearch.trim()) {
        const q = pendingSearch.trim().toLowerCase()
        const text = `${a.student_name} ${a.student_mobile||''} Seat ${a.seat_number} ${a.chair_type||''}`.toLowerCase()
        if (!text.includes(q)) return false
      }
      return true
    })
  }, [pendingAllocations, pendingFilter, pendingSearch])

  function openCollectModal(allocation) {
    setCollectingAllocation(allocation)
    setCollectForm({
      amount: String(allocation.amount_pending),
      payment_mode: 'UPI'
    })
  }

  async function handleCollectPayment(e) {
    e.preventDefault()
    if (!collectingAllocation) return
    setSaving(true); setError(''); setNotice('')
    try {
      const res = await api(`/allocations/${collectingAllocation.id}/pay/`, {
        method: 'POST',
        body: JSON.stringify({
          amount: Number(collectForm.amount),
          payment_mode: collectForm.payment_mode
        })
      })
      setCollectingAllocation(null)
      setNotice(res.detail || 'Payment collected successfully.')
      await loadAll()
    } catch(err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  function openVerifyModal(alloc) {
    setVerifyingAlloc(alloc)
    setVerifyForm({
      verification_status: alloc.verification_status && alloc.verification_status !== 'pending' ? alloc.verification_status : 'confirmed_left',
      verification_notes: alloc.verification_notes || ''
    })
  }

  async function handleVerifySubmit(e) {
    if (e) e.preventDefault()
    if (!verifyingAlloc) return
    if (verifyForm.verification_status === 'renew') {
      const target = verifyingAlloc
      setVerifyingAlloc(null)
      openRenewModal(target)
      return
    }
    setSaving(true); setError(''); setNotice('')
    try {
      const res = await api(`/allocations/${verifyingAlloc.id}/verify/`, {
        method: 'POST',
        body: JSON.stringify({
          verification_status: verifyForm.verification_status,
          verification_notes: verifyForm.verification_notes
        })
      })
      setNotice(res.detail || 'Student verification status updated.')
      setVerifyingAlloc(null)
      await loadAll()
    } catch(err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function quickVerifyLeft(alloc) {
    if (!window.confirm(`Confirm that ${alloc.student_name} has officially left Cree8 Library? The seat was auto-freed.`)) return
    setSaving(true); setError(''); setNotice('')
    try {
      const res = await api(`/allocations/${alloc.id}/verify/`, {
        method: 'POST',
        body: JSON.stringify({
          verification_status: 'confirmed_left',
          verification_notes: 'Confirmed departed via quick verification'
        })
      })
      setNotice(res.detail || `Confirmed departure for ${alloc.student_name}.`)
      await loadAll()
    } catch(err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  function openRenewModal(alloc) {
    const todayStr = new Date().toISOString().slice(0, 10)
    const defaultStart = alloc.end_date && alloc.end_date > todayStr ? alloc.end_date : todayStr
    const defaultDuration = alloc.duration_months || 1
    const defaultChair = alloc.chair_type || 'normal'
    const defaultAmount = String(priceFor(defaultChair, defaultDuration))

    setRenewingAlloc(alloc)
    setRenewForm({
      seat_number: alloc.seat_number,
      chair_type: defaultChair,
      duration_months: defaultDuration,
      payment_mode: 'UPI',
      amount_paid: defaultAmount,
      start_date: defaultStart,
      verification_notes: `Renewed subscription on ${todayStr}`
    })
  }

  function updateRenewForm(k, v) {
    setRenewForm(f => {
      const next = { ...f, [k]: v }
      if (k === 'chair_type' || k === 'duration_months') {
        next.amount_paid = String(priceFor(next.chair_type, next.duration_months))
      }
      return next
    })
  }

  async function handleRenewSubmit(e) {
    if (e) e.preventDefault()
    if (!renewingAlloc) return
    setSaving(true); setError(''); setNotice('')
    try {
      const res = await api(`/allocations/${renewingAlloc.id}/renew/`, {
        method: 'POST',
        body: JSON.stringify({
          ...renewForm,
          seat_number: Number(renewForm.seat_number),
          duration_months: Number(renewForm.duration_months),
          amount_paid: Number(renewForm.amount_paid)
        })
      })
      setNotice(res.detail || 'Subscription renewed and seat allocated successfully!')
      setRenewingAlloc(null)
      await loadAll()
    } catch(err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const filteredSubscriptions = useMemo(() => {
    const list = subscriptionsData?.allocations || []
    return list.filter(item => {
      if (subSearch.trim()) {
        const q = subSearch.trim().toLowerCase()
        const text = `${item.student_name || ''} ${item.student_mobile || ''} Seat ${item.seat_number || ''} ${item.chair_type || ''} ${item.verification_notes || ''}`.toLowerCase()
        if (!text.includes(q)) return false
      }
      if (subFilter === 'ended') return item.days_diff < 0
      if (subFilter === 'today') return item.days_diff === 0
      if (subFilter === 'expiring_soon') return item.days_diff > 0 && item.days_diff <= 7
      if (subFilter === 'pending') return item.verification_status === 'pending' && item.days_diff <= 0
      if (subFilter === 'confirmed_left') return item.verification_status === 'confirmed_left'
      if (subFilter === 'renewed') return item.verification_status === 'renewed'
      if (subFilter === 'retained') return item.verification_status === 'retained'
      return true
    })
  }, [subscriptionsData, subFilter, subSearch])

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // 1. Search Query
      if (txnFilter.search.trim()) {
        const q = txnFilter.search.trim().toLowerCase()
        const text = `${t.student_name || ''} ${t.student_mobile || ''} Seat ${t.seat_number || ''} ${t.description || ''} ${t.payment_mode || ''}`.toLowerCase()
        if (!text.includes(q)) return false
      }

      // 2. Transaction Type
      if (txnFilter.type !== 'all' && t.transaction_type !== txnFilter.type) {
        return false
      }

      // 3. Payment Mode
      if (txnFilter.mode !== 'all' && t.payment_mode !== txnFilter.mode) {
        return false
      }

      // 4. Amount Filter
      const amt = Number(t.amount ?? t.amount_paid ?? 0)
      if (txnFilter.amountPreset === 'under500' && amt > 500) return false
      if (txnFilter.amountPreset === '500to1500' && (amt <= 500 || amt > 1500)) return false
      if (txnFilter.amountPreset === 'above1500' && amt <= 1500) return false
      if (txnFilter.minAmount !== '' && amt < Number(txnFilter.minAmount)) return false
      if (txnFilter.maxAmount !== '' && amt > Number(txnFilter.maxAmount)) return false

      // 5. Timeframe / Date Range
      if (t.created_at) {
        const txnDate = new Date(t.created_at)
        const now = new Date()

        if (txnFilter.timeframe === 'today') {
          if (txnDate.toDateString() !== now.toDateString()) return false
        } else if (txnFilter.timeframe === 'week') {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          sevenDaysAgo.setHours(0, 0, 0, 0)
          if (txnDate < sevenDaysAgo) return false
        } else if (txnFilter.timeframe === 'month') {
          if (txnDate.getMonth() !== now.getMonth() || txnDate.getFullYear() !== now.getFullYear()) {
            return false
          }
        } else if (txnFilter.timeframe === 'last30') {
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          thirtyDaysAgo.setHours(0, 0, 0, 0)
          if (txnDate < thirtyDaysAgo) return false
        } else if (txnFilter.timeframe === 'custom') {
          if (txnFilter.startDate) {
            const start = new Date(txnFilter.startDate + 'T00:00:00')
            if (txnDate < start) return false
          }
          if (txnFilter.endDate) {
            const end = new Date(txnFilter.endDate + 'T23:59:59')
            if (txnDate > end) return false
          }
        }
      }

      return true
    }).sort((a, b) => {
      if (txnFilter.sortBy === 'date_desc') {
        return new Date(b.created_at) - new Date(a.created_at)
      }
      if (txnFilter.sortBy === 'date_asc') {
        return new Date(a.created_at) - new Date(b.created_at)
      }
      if (txnFilter.sortBy === 'amount_desc') {
        return Number(b.amount ?? b.amount_paid ?? 0) - Number(a.amount ?? a.amount_paid ?? 0)
      }
      if (txnFilter.sortBy === 'amount_asc') {
        return Number(a.amount ?? a.amount_paid ?? 0) - Number(b.amount ?? b.amount_paid ?? 0)
      }
      if (txnFilter.sortBy === 'seat_asc') {
        return Number(a.seat_number) - Number(b.seat_number)
      }
      return 0
    })
  }, [transactions, txnFilter])

  function downloadStatement(txns) {
    if (!txns || txns.length === 0) {
      alert('No transactions to download.')
      return
    }

    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()

      // Brand Top Accent Bar
      doc.setFillColor(8, 127, 104) // Cree8 Emerald Teal
      doc.rect(0, 0, pageWidth, 4, 'F')

      // Brand Name & Contact Info
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      doc.setTextColor(8, 127, 104)
      doc.text('CREE8 STUDY & CO-WORK', 14, 15)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(100, 116, 139)
      doc.text('Byramji Town, Nagpur · Phone: +91 8010150969 · contact@cree8.in', 14, 20)

      // Statement Metadata (Right-Aligned)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10.5)
      doc.setTextColor(15, 23, 42)
      doc.text('OFFICIAL ACCOUNT STATEMENT', pageWidth - 14, 14, { align: 'right' })

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7.5)
      doc.setTextColor(100, 116, 139)
      const nowStr = new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      doc.text(`Generated: ${nowStr}`, pageWidth - 14, 19, { align: 'right' })
      doc.text(`Total Records: ${txns.length} transaction(s)`, pageWidth - 14, 23.5, { align: 'right' })

      // Subtle Divider
      doc.setDrawColor(226, 232, 240)
      doc.setLineWidth(0.3)
      doc.line(14, 26, pageWidth - 14, 26)

      // Summary Metric Cards
      const sumTotal = txns.reduce((s, t) => s + (Number(t.amount ?? t.amount_paid) || 0), 0)
      const allocTxns = txns.filter(t => t.transaction_type === 'allocation')
      const allocTotal = allocTxns.reduce((s, t) => s + (Number(t.amount ?? t.amount_paid) || 0), 0)
      const upgTxns = txns.filter(t => t.transaction_type === 'upgrade')
      const upgTotal = upgTxns.reduce((s, t) => s + (Number(t.amount ?? t.amount_paid) || 0), 0)

      const cardWidth = (pageWidth - 28 - 10) / 3
      const cardY = 30
      const cardHeight = 15

      // Card 1: Total Collections
      doc.setFillColor(248, 250, 252)
      doc.setDrawColor(203, 213, 225)
      doc.roundedRect(14, cardY, cardWidth, cardHeight, 1.5, 1.5, 'FD')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(6.8)
      doc.setTextColor(100, 116, 139)
      doc.text('TOTAL STATEMENT COLLECTIONS', 18, cardY + 5)
      doc.setFontSize(10.5)
      doc.setTextColor(8, 127, 104)
      doc.text(`Rs. ${sumTotal.toLocaleString('en-IN')}`, 18, cardY + 11.5)

      // Card 2: Allocations
      const card2X = 14 + cardWidth + 5
      doc.setFillColor(248, 250, 252)
      doc.roundedRect(card2X, cardY, cardWidth, cardHeight, 1.5, 1.5, 'FD')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(6.8)
      doc.setTextColor(100, 116, 139)
      doc.text(`SEAT ALLOCATIONS (${allocTxns.length})`, card2X + 4, cardY + 5)
      doc.setFontSize(10.5)
      doc.setTextColor(30, 41, 59)
      doc.text(`Rs. ${allocTotal.toLocaleString('en-IN')}`, card2X + 4, cardY + 11.5)

      // Card 3: Upgrades
      const card3X = card2X + cardWidth + 5
      doc.setFillColor(248, 250, 252)
      doc.roundedRect(card3X, cardY, cardWidth, cardHeight, 1.5, 1.5, 'FD')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(6.8)
      doc.setTextColor(100, 116, 139)
      doc.text(`CHAIR UPGRADES (${upgTxns.length})`, card3X + 4, cardY + 5)
      doc.setFontSize(10.5)
      doc.setTextColor(234, 88, 12)
      doc.text(`Rs. ${upgTotal.toLocaleString('en-IN')}`, card3X + 4, cardY + 11.5)

      // Transaction Rows
      const tableRows = txns.map((t, idx) => {
        const d = new Date(t.created_at)
        const dateStr = d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
        const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        const isUpg = t.transaction_type === 'upgrade'
        const amt = Number(t.amount ?? t.amount_paid ?? 0)
        return [
          String(idx + 1),
          `${dateStr}\n${timeStr}`,
          isUpg ? 'Upgrade' : 'Allocation',
          t.student_name || '—',
          t.student_mobile || '—',
          t.seat_number ? `Seat ${t.seat_number}` : '—',
          t.description || (isUpg ? 'Chair Upgrade' : 'Seat Booking'),
          t.payment_mode || 'UPI',
          `Rs. ${amt.toLocaleString('en-IN')}`
        ]
      })

      // Generate AutoTable
      autoTable(doc, {
        startY: 50,
        margin: { left: 14, right: 14, bottom: 18 },
        head: [['#', 'Date & Time', 'Type', 'Student Name', 'Mobile', 'Seat', 'Description', 'Mode', 'Amount']],
        body: tableRows,
        foot: [
          ['', '', '', '', '', '', 'TOTAL STATEMENT AMOUNT', '', `Rs. ${sumTotal.toLocaleString('en-IN')}`]
        ],
        theme: 'striped',
        styles: {
          font: 'helvetica',
          fontSize: 7.2,
          cellPadding: 2,
          valign: 'middle',
          textColor: [30, 41, 59],
          lineColor: [226, 232, 240],
          lineWidth: 0.1
        },
        headStyles: {
          fillColor: [8, 127, 104],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 7.8
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        footStyles: {
          fillColor: [241, 245, 249],
          textColor: [15, 23, 42],
          fontStyle: 'bold',
          fontSize: 8
        },
        columnStyles: {
          0: { cellWidth: 8, halign: 'center' },
          1: { cellWidth: 24 },
          2: { cellWidth: 18, halign: 'center', fontStyle: 'bold' },
          3: { cellWidth: 32 },
          4: { cellWidth: 22 },
          5: { cellWidth: 15, halign: 'center' },
          6: { cellWidth: 'auto' },
          7: { cellWidth: 15, halign: 'center' },
          8: { cellWidth: 22, halign: 'right', fontStyle: 'bold' }
        },
        didParseCell: (data) => {
          if (data.section === 'body') {
            if (data.column.index === 2) {
              if (data.cell.raw === 'Upgrade') {
                data.cell.styles.textColor = [194, 65, 12]
              } else {
                data.cell.styles.textColor = [4, 120, 87]
              }
            }
            if (data.column.index === 8) {
              const rowType = data.row.raw[2]
              if (rowType === 'Upgrade') {
                data.cell.styles.textColor = [194, 65, 12]
              } else {
                data.cell.styles.textColor = [4, 120, 87]
              }
            }
          }
          if (data.section === 'foot') {
            if (data.column.index === 8) {
              data.cell.styles.textColor = [8, 127, 104]
            }
          }
        },
        didDrawPage: (data) => {
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(7.2)
          doc.setTextColor(148, 163, 184)
          doc.setDrawColor(226, 232, 240)
          doc.setLineWidth(0.3)
          doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12)
          doc.text('Cree8 Study & Co-work · Official Account Statement · Computer Generated', 14, pageHeight - 7)
        }
      })

      // Accurate page numbers on all pages
      const totalPages = doc.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7.2)
        doc.setTextColor(148, 163, 184)
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - 14, pageHeight - 7, { align: 'right' })
      }

      const dateStamp = new Date().toISOString().slice(0, 10)
      doc.save(`cree8_account_statement_${dateStamp}.pdf`)
    } catch (err) {
      console.error('Failed to generate PDF statement:', err)
      alert('Error generating PDF statement: ' + (err.message || 'Please try again.'))
    }
  }

  function printStatement(txns) {
    if (!txns || txns.length === 0) {
      alert('No transactions to print.')
      return
    }
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Please allow popups to print statement.')
      return
    }
    const sumTotal = txns.reduce((s, t) => s + (Number(t.amount ?? t.amount_paid) || 0), 0)
    const allocTotal = txns.filter(t => t.transaction_type === 'allocation').reduce((s, t) => s + (Number(t.amount ?? t.amount_paid) || 0), 0)
    const upgTotal = txns.filter(t => t.transaction_type === 'upgrade').reduce((s, t) => s + (Number(t.amount ?? t.amount_paid) || 0), 0)

    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Cree8 Account Statement - ${new Date().toLocaleDateString()}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; padding: 28px; margin: 0; }
    .header { border-bottom: 2px solid #087f68; padding-bottom: 14px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
    .brand h1 { margin: 0; font-size: 22px; color: #087f68; font-weight: 800; letter-spacing: -0.5px; }
    .brand p { margin: 4px 0 0; font-size: 12px; color: #64748b; }
    .meta { text-align: right; font-size: 12px; color: #64748b; }
    .summary-boxes { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
    .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
    .box small { font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; }
    .box strong { display: block; font-size: 18px; margin-top: 3px; color: #0f172a; }
    table { width: 100%; border-collapse: collapse; font-size: 11.5px; margin-top: 10px; }
    th { background: #f1f5f9; text-align: left; padding: 8px 10px; font-weight: 700; color: #475569; border-bottom: 1px solid #cbd5e1; }
    td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
    tr:nth-child(even) td { background: #fafafa; }
    .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; }
    .badge.alloc { background: #ecfdf5; color: #047857; }
    .badge.upg { background: #fff7ed; color: #c2410c; }
    .footer { margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 11px; color: #94a3b8; text-align: center; }
    @media print { body { padding: 0; } button { display: none; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <h1>CREE8 STUDY & CO-WORK</h1>
      <p>Byramji Town, Nagpur · Phone: +91 8010150969</p>
    </div>
    <div class="meta">
      <b>OFFICIAL ACCOUNT STATEMENT</b><br/>
      Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}<br/>
      Total Entries: ${txns.length}
    </div>
  </div>
  <div class="summary-boxes">
    <div class="box"><small>Total Statement Collections</small><strong>₹${sumTotal.toLocaleString('en-IN')}</strong></div>
    <div class="box"><small>Seat Allocations</small><strong>₹${allocTotal.toLocaleString('en-IN')}</strong></div>
    <div class="box"><small>Chair Upgrades</small><strong>₹${upgTotal.toLocaleString('en-IN')}</strong></div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Txn Date & Time</th>
        <th>Type</th>
        <th>Student</th>
        <th>Mobile</th>
        <th>Seat</th>
        <th>Description</th>
        <th>Amount</th>
        <th>Mode</th>
      </tr>
    </thead>
    <tbody>
      ${txns.map(t => {
        const d = new Date(t.created_at)
        const isUpg = t.transaction_type === 'upgrade'
        const amt = Number(t.amount ?? t.amount_paid ?? 0)
        return `<tr>
          <td>${d.toLocaleDateString()} ${d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
          <td><span class="badge ${isUpg ? 'upg' : 'alloc'}">${isUpg ? 'Upgrade' : 'Allocation'}</span></td>
          <td><b>${t.student_name || '—'}</b></td>
          <td>${t.student_mobile || '—'}</td>
          <td>Seat ${t.seat_number || '—'}</td>
          <td>${t.description || (isUpg ? 'Chair Upgrade' : 'Seat Booking')}</td>
          <td><b>₹${amt.toLocaleString('en-IN')}</b></td>
          <td>${t.payment_mode || 'UPI'}</td>
        </tr>`
      }).join('')}
    </tbody>
  </table>
  <div class="footer">
    Cree8 Study & Co-work · Official Account Statement · Computer Generated Document
  </div>
  <script>window.onload = function() { window.print(); };</script>
</body>
</html>`

    printWindow.document.write(html)
    printWindow.document.close()
  }

  const filteredStudents=students.filter(s=>(s.name+' '+s.mobile+' '+(s.gender||'')+' '+(s.native_place||'')+' '+(s.currently_studying||'')).toLowerCase().includes(query.toLowerCase()))
  if(!user) return <Login onLogin={handleLogin} onSignup={handleSignup}/>
  return <div className="app-layout">
    {/* Mobile Top Navbar */}
    <header className="mobile-top-header">
      <button
        type="button"
        className="mobile-nav-toggle"
        onClick={() => setMobileMenuOpen(prev => !prev)}
        aria-label="Toggle navigation menu"
      >
        {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      <div className="mobile-header-brand" onClick={() => navigateTo('dashboard')}>
        <div className="brand-mark small">
          <Armchair size={19} />
        </div>
        <div>
          <b>CREE8</b>
          <small>Study & Co-work</small>
        </div>
      </div>

      <div className="mobile-header-actions">
        <button
          type="button"
          className="mobile-icon-btn"
          onClick={() => { setStudentForm({id:'',name:'',gender:'Male',mobile:'',alternate_mobile:'',native_place:'',currently_studying:''}); setShowRegister(true); }}
          title="Register new student"
        >
          <UserPlus size={17} />
        </button>
        <div
          className="admin-avatar small"
          onClick={() => setMobileMenuOpen(true)}
          title={`Signed in as ${user.username}`}
        >
          {(user.username || 'A').slice(0, 1).toUpperCase()}
        </div>
      </div>
    </header>

    {/* Backdrop for Mobile Drawer */}
    {mobileMenuOpen && (
      <div
        className="mobile-drawer-overlay"
        onClick={() => setMobileMenuOpen(false)}
      />
    )}

    {/* Sidebar (Desktop fixed left sidebar / Mobile slide-out drawer) */}
    <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-mark small"><Armchair size={21} /></div>
        <div>
          <b>CREE8 Study & Co-work</b>
          <small>Byramji Town, Nagpur<br />+91 8010150969</small>
        </div>
        <button
          type="button"
          className="sidebar-close-btn"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      <div className="nav-label">WORKSPACE</div>

      <button className={`nav-item ${page === 'dashboard' ? 'active' : ''}`} onClick={() => navigateTo('dashboard')}>
        <LayoutDashboard size={18} /> Dashboard
      </button>
      <button className={`nav-item ${page === 'seats' ? 'active' : ''}`} onClick={() => navigateTo('seats')}>
        <Armchair size={18} /> Seat map <span className="nav-count">{dashboard.total_seats ?? 64}</span>
      </button>
      <button className={`nav-item ${page === 'students' ? 'active' : ''}`} onClick={() => navigateTo('students')}>
        <Users size={18} /> Students <span className="nav-count">{students.length}</span>
      </button>
      <button className={`nav-item ${page === 'transactions' ? 'active' : ''}`} onClick={() => navigateTo('transactions')}>
        <IndianRupee size={18} /> Transactions
      </button>
      <button className={`nav-item ${page === 'pending' ? 'active' : ''}`} onClick={() => navigateTo('pending')}>
        <AlertCircle size={18} /> Pending fees {activePendingAllocations.length > 0 && <span className="nav-count amber">{activePendingAllocations.length}</span>}
      </button>
      <button className={`nav-item ${page === 'subscriptions' ? 'active' : ''}`} onClick={() => navigateTo('subscriptions')}>
        <Clock size={18} /> Subscriptions {subscriptionsData?.stats?.pending_verification_count > 0 && <span className="nav-count purple">{subscriptionsData.stats.pending_verification_count}</span>}
      </button>

      <div className="sidebar-bottom">
        <div className="admin-avatar">{(user.username || 'A').slice(0, 1).toUpperCase()}</div>
        <div className="admin-meta">
          <b>{user.username}</b>
          <small>Administrator</small>
        </div>
        <button className="icon-button logout" onClick={handleLogout} title="Sign out">
          <LogOut size={18} />
        </button>
      </div>
    </aside>
    <main className="main-content"><header className="topbar"><div><p className="eyebrow">CREE8 STUDY & CO-WORK / ADMIN</p><h1>{page==='dashboard'?'Overview':page==='seats'?'Seat availability':page==='transactions'?'Transactions':page==='pending'?'Pending payments':page==='subscriptions'?'Subscription Status & Expiry':'Student directory'}</h1></div><div className="top-actions"><button className="secondary" onClick={loadAll}><RefreshCw size={16}/> Refresh</button><button className="primary" onClick={()=>setShowRegister(true)}><UserPlus size={16}/> Register student</button></div></header>
      {error&&<div className="alert error"><span>{error}</span><button onClick={()=>setError('')}><X size={16}/></button></div>}{notice&&<div className="alert success"><CheckCircle2 size={18}/><span>{notice}</span><button onClick={()=>setNotice('')}><X size={16}/></button></div>}
      {page==='dashboard'&&<>
        {(subscriptionsData?.stats?.pending_verification_count > 0 || subscriptionsData?.stats?.ending_today_count > 0) && (
          <div className="subscription-expiry-alert">
            <div className="sub-alert-content">
              <div className="sub-alert-icon">
                <AlertTriangle size={20} />
              </div>
              <div>
                <b>Seat Expiry Notice: Verify Student Departure</b>
                <p>
                  {subscriptionsData?.stats?.pending_verification_count > 0 ? `${subscriptionsData.stats.pending_verification_count} subscription(s) have ended. Expired seats are automatically freed. ` : ''}
                  {subscriptionsData?.stats?.ending_today_count > 0 ? `${subscriptionsData.stats.ending_today_count} subscription(s) ending today. ` : ''}
                  Please verify whether students have left Cree8 or wish to renew their tenure.
                </p>
              </div>
            </div>
            <button className="sub-alert-action-btn" onClick={() => navigateTo('subscriptions')}>
              Review Subscriptions <ChevronRight size={16} />
            </button>
          </div>
        )}
        <section className="stats-grid">
          <Stat icon={<Armchair/>} label="Total seats" value={dashboard.total_seats??64} sub="64 Tables · Cree8 Study" tone="blue"/>
          <Stat icon={<CheckCircle2/>} label="Available seats" value={dashboard.available_seats??64} sub={`${dashboard.occupied_seats??0} active members`} tone="green"/>
          <Stat icon={<Users/>} label="Occupied seats" value={dashboard.occupied_seats??0} sub={`${dashboard.occupied_executive??0} Exec · ${dashboard.occupied_normal??0} Normal`} tone="red"/>
          <div onClick={()=>navigateTo('pending')} style={{cursor:'pointer'}} title="View Pending Payments">
            <Stat icon={<IndianRupee/>} label="Pending payments" value={`₹${dashboard.amount_pending??0}`} tone="amber" sub="Click to view details →"/>
          </div>
          <div onClick={()=>navigateTo('subscriptions')} style={{cursor:'pointer'}} title="View Subscriptions & Auto-Freed Seats">
            <Stat icon={<Clock/>} label="Subscriptions ended" value={subscriptionsData?.stats?.ended_count ?? dashboard.ended_subscriptions ?? 0} tone="purple" sub={`${subscriptionsData?.stats?.pending_verification_count ?? 0} require verification →`}/>
          </div>
        </section>
        <section className="content-card"><div className="section-heading"><div><h2>Live seat map</h2><p>Click any seat to allocate or view its details.</p></div><button className="text-button" onClick={()=>setPage('seats')}>Open full map <ChevronRight size={16}/></button></div><SeatMap seats={seats} onSeatClick={openSeat}/></section>
        <section className="content-card"><div className="section-heading"><div><h2>Recently registered students</h2><p>Students saved in your library database.</p></div><button className="text-button" onClick={()=>setPage('students')}>View all <ChevronRight size={16}/></button></div><StudentTable students={students.slice(0,5)} onEdit={openEditStudent}/></section>
      </>}
      {page==='seats'&&<section className="content-card"><div className="section-heading"><div><h2>64-seat floor layout</h2><p>Normal & Executive Chairs · 64 Total Tables</p><p className="muted">Green = available · Red = occupied (Normal) · Orange = occupied (Executive)</p></div><div className="map-summary">{dashboard.available_seats??64} available / {dashboard.total_seats??64}</div></div><SeatMap seats={seats} onSeatClick={openSeat}/></section>}
      {page==='students'&&<>
        <section className="stats-grid">
          <Stat icon={<Users/>} label="Total students" value={students.length} sub="Registered in library" tone="blue"/>
          <Stat icon={<CheckCircle2/>} label="Active memberships" value={allocations.filter(a => a.is_active).length} sub={`${dashboard.occupied_seats??0} currently seated`} tone="green"/>
          <Stat icon={<Users/>} label="Male students" value={students.filter(s => (s.gender||'Male').toLowerCase()==='male').length} sub="Registered" tone="amber"/>
          <Stat icon={<Users/>} label="Female students" value={students.filter(s => (s.gender||'').toLowerCase()==='female').length} sub="Registered" tone="red"/>
        </section>
        <section className="content-card">
          <div className="section-heading">
            <div>
              <h2>Student directory</h2>
              <p>Search, view, and edit all registered library students.</p>
            </div>
            <button className="primary" onClick={()=>{setStudentForm({id:'',name:'',gender:'Male',mobile:'',alternate_mobile:'',native_place:'',currently_studying:''}); setShowRegister(true)}}>
              <UserPlus size={16}/> Register student
            </button>
          </div>
          <div className="search-box" style={{marginBottom: '16px'}}>
            <Search size={18}/>
            <input
              placeholder="Search by student name, mobile number, native place, or studying..."
              value={query}
              onChange={e=>setQuery(e.target.value)}
            />
            {query && (
              <button
                type="button"
                className="icon-button"
                style={{border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px'}}
                onClick={() => setQuery('')}
                title="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <StudentTable students={filteredStudents} onEdit={openEditStudent}/>
        </section>
      </>}
      {page==='transactions'&&<>
        <section className="stats-grid">
          <Stat icon={<IndianRupee/>} label="Filtered collections" value={`₹${filteredTransactions.reduce((sum, t) => sum + (Number(t.amount??t.amount_paid)||0), 0).toLocaleString('en-IN')}`} sub={`${filteredTransactions.length} of ${transactions.length} record(s) shown`} tone="green"/>
          <Stat icon={<Armchair/>} label="Seat allocations" value={`₹${filteredTransactions.filter(t => t.transaction_type==='allocation').reduce((sum, t) => sum + (Number(t.amount??t.amount_paid)||0), 0).toLocaleString('en-IN')}`} sub={`${filteredTransactions.filter(t => t.transaction_type==='allocation').length} booking(s)`} tone="blue"/>
          <Stat icon={<Sparkles/>} label="Chair upgrades" value={`₹${filteredTransactions.filter(t => t.transaction_type==='upgrade').reduce((sum, t) => sum + (Number(t.amount??t.amount_paid)||0), 0).toLocaleString('en-IN')}`} sub={`${filteredTransactions.filter(t => t.transaction_type==='upgrade').length} upgrade fee(s)`} tone="amber"/>
          <Stat icon={<CreditCard/>} label="Total recorded" value={`₹${transactions.reduce((sum, t) => sum + (Number(t.amount??t.amount_paid)||0), 0).toLocaleString('en-IN')}`} sub={`${transactions.length} all-time records`} tone="red"/>
        </section>
        <section className="content-card">
          <div className="section-heading">
            <div>
              <h2>Banking transaction statement</h2>
              <p>Filter, search, audit, and export your library's financial collections and upgrade settlements.</p>
            </div>
            <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
              <button className="secondary" onClick={() => downloadStatement(filteredTransactions)} title="Download official account statement in PDF format">
                <Download size={15}/> Download statement (PDF)
              </button>
              <button className="secondary" onClick={() => printStatement(filteredTransactions)} title="Print / Save as PDF statement">
                <Printer size={15}/> Print PDF
              </button>
            </div>
          </div>
          <BankingTransactionFilters
            filter={txnFilter}
            setFilter={setTxnFilter}
            onReset={resetTxnFilter}
            totalCount={transactions.length}
            filteredCount={filteredTransactions.length}
            filteredSum={filteredTransactions.reduce((sum, t) => sum + (Number(t.amount??t.amount_paid)||0), 0)}
          />
          <TransactionTable transactions={filteredTransactions}/>
        </section>
      </>}
      {page==='pending'&&<>
        <section className="stats-grid">
          <Stat icon={<IndianRupee/>} label="Total pending dues" value={`₹${activePendingAllocations.reduce((sum, a) => sum + (Number(a.amount_pending)||0), 0).toLocaleString('en-IN')}`} sub={`${activePendingAllocations.length} active seat(s) with dues`} tone="amber"/>
          <Stat icon={<Users/>} label="Members with dues" value={activePendingAllocations.length} sub={`${pendingAllocations.length} total across all records`} tone="red"/>
          <Stat icon={<Armchair/>} label="Executive chairs dues" value={`₹${activePendingAllocations.filter(a => a.chair_type==='executive').reduce((sum, a) => sum + (Number(a.amount_pending)||0), 0).toLocaleString('en-IN')}`} sub={`${activePendingAllocations.filter(a => a.chair_type==='executive').length} executive seat(s)`} tone="blue"/>
          <Stat icon={<Armchair/>} label="Normal chairs dues" value={`₹${activePendingAllocations.filter(a => a.chair_type==='normal').reduce((sum, a) => sum + (Number(a.amount_pending)||0), 0).toLocaleString('en-IN')}`} sub={`${activePendingAllocations.filter(a => a.chair_type==='normal').length} normal seat(s)`} tone="green"/>
        </section>
        <section className="content-card">
          <div className="section-heading">
            <div>
              <h2>Remaining payments & dues</h2>
              <p>Review students with outstanding fee balances, view package amounts, and collect remaining dues.</p>
            </div>
          </div>
          <div className="pending-controls-bar">
            <div className="search-box" style={{marginBottom: 0}}>
              <Search size={18}/>
              <input placeholder="Search student name, mobile, or seat number" value={pendingSearch} onChange={e=>setPendingSearch(e.target.value)}/>
            </div>
            <div className="filter-toggle-group">
              <button type="button" className={`filter-tab-btn ${pendingFilter==='active'?'active':''}`} onClick={()=>setPendingFilter('active')}>
                Active seats ({activePendingAllocations.length})
              </button>
              <button type="button" className={`filter-tab-btn ${pendingFilter==='all'?'active':''}`} onClick={()=>setPendingFilter('all')}>
                All records ({pendingAllocations.length})
              </button>
            </div>
          </div>
          <PendingTable allocations={filteredPending} onCollect={openCollectModal}/>
        </section>
      </>}
      {page==='subscriptions'&&<>
        <section className="stats-grid">
          <Stat icon={<Armchair/>} label="Ended & Auto-Freed" value={subscriptionsData?.stats?.ended_count || 0} sub="Seats automatically released" tone="red"/>
          <Stat icon={<Clock/>} label="Ending Today" value={subscriptionsData?.stats?.ending_today_count || 0} sub="Expiring today" tone="amber"/>
          <Stat icon={<CalendarDays/>} label="Expiring in 7 Days" value={subscriptionsData?.stats?.expiring_soon_count || 0} sub="Upcoming renewal alert" tone="blue"/>
          <Stat icon={<HelpCircle/>} label="Unverified Students" value={subscriptionsData?.stats?.pending_verification_count || 0} sub="Requires admin verification" tone="purple"/>
        </section>

        <section className="content-card">
          <div className="section-heading">
            <div>
              <h2>Subscription Expiry & Seat Freeing Management</h2>
              <p>When a subscription ends, the seat is automatically freed. Verify below whether the student has completed their tenure and left, or wishes to renew.</p>
            </div>
            <button className="secondary" onClick={loadAll}>
              <RefreshCw size={16}/> Refresh & Check
            </button>
          </div>

          <div className="subscriptions-controls-bar">
            <div className="search-box" style={{marginBottom: 0}}>
              <Search size={18}/>
              <input
                placeholder="Search by student name, mobile, seat number, or admin remarks..."
                value={subSearch}
                onChange={e=>setSubSearch(e.target.value)}
              />
              {subSearch && (
                <button
                  type="button"
                  className="icon-button"
                  style={{border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px'}}
                  onClick={() => setSubSearch('')}
                  title="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="filter-toggle-group sub-filters-scroll">
              <button
                type="button"
                className={`filter-tab-btn ${subFilter==='all'?'active':''}`}
                onClick={()=>setSubFilter('all')}
              >
                All ({subscriptionsData?.allocations?.length || 0})
              </button>
              <button
                type="button"
                className={`filter-tab-btn ${subFilter==='ended'?'active':''}`}
                onClick={()=>setSubFilter('ended')}
              >
                Ended & Freed ({subscriptionsData?.stats?.ended_count || 0})
              </button>
              <button
                type="button"
                className={`filter-tab-btn ${subFilter==='today'?'active':''}`}
                onClick={()=>setSubFilter('today')}
              >
                Ending Today ({subscriptionsData?.stats?.ending_today_count || 0})
              </button>
              <button
                type="button"
                className={`filter-tab-btn ${subFilter==='expiring_soon'?'active':''}`}
                onClick={()=>setSubFilter('expiring_soon')}
              >
                Next 7 Days ({subscriptionsData?.stats?.expiring_soon_count || 0})
              </button>
              <button
                type="button"
                className={`filter-tab-btn ${subFilter==='pending'?'active':''}`}
                onClick={()=>setSubFilter('pending')}
              >
                Needs Verification ({subscriptionsData?.stats?.pending_verification_count || 0})
              </button>
              <button
                type="button"
                className={`filter-tab-btn ${subFilter==='confirmed_left'?'active':''}`}
                onClick={()=>setSubFilter('confirmed_left')}
              >
                Confirmed Left ({subscriptionsData?.stats?.confirmed_left_count || 0})
              </button>
              <button
                type="button"
                className={`filter-tab-btn ${subFilter==='renewed'?'active':''}`}
                onClick={()=>setSubFilter('renewed')}
              >
                Renewed ({subscriptionsData?.stats?.renewed_count || 0})
              </button>
            </div>
          </div>

          <SubscriptionTable
            subscriptions={filteredSubscriptions}
            onVerify={openVerifyModal}
            onQuickVerifyLeft={quickVerifyLeft}
            onRenew={openRenewModal}
          />
        </section>
      </>}
    </main>
    {showRegister&&<Modal title={studentForm.id?"Edit student":"Register new student"} onClose={()=>setShowRegister(false)}><form className="form-stack modal-form" onSubmit={registerStudent}><div className="form-grid"><label>Full name *<input value={studentForm.name} onChange={e=>updateStudent('name',e.target.value)} required maxLength="150"/></label><label>Gender *<select value={studentForm.gender||'Male'} onChange={e=>updateStudent('gender',e.target.value)} required><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></label><label>Mobile number *<input inputMode="numeric" pattern="[0-9]{10}" maxLength="10" value={studentForm.mobile} onChange={e=>updateStudent('mobile',e.target.value)} required placeholder="10-digit number"/></label><label>Alternate mobile<input inputMode="numeric" pattern="[0-9]{10}" maxLength="10" value={studentForm.alternate_mobile} onChange={e=>updateStudent('alternate_mobile',e.target.value)} placeholder="Optional"/></label><label>Native Place<input value={studentForm.native_place} onChange={e=>updateStudent('native_place',e.target.value)} placeholder="Optional"/></label><label>Currently studying<input value={studentForm.currently_studying} onChange={e=>updateStudent('currently_studying',e.target.value)} placeholder="e.g. B.Tech, UPSC preparation"/></label></div><div className="modal-actions"><button type="button" className="secondary" onClick={()=>setShowRegister(false)}>Cancel</button><button className="primary" disabled={saving}>{saving?'Saving…':(studentForm.id?'Save changes':'Register student')}</button></div></form></Modal>}
    {collectingAllocation&&<Modal title={`Collect Pending Payment · Seat ${collectingAllocation.seat_number}`} onClose={()=>setCollectingAllocation(null)}>
      <form className="form-stack modal-form" onSubmit={handleCollectPayment}>
        <div className="occupied-banner" style={{background: '#fff7ed', borderColor: '#fed7aa', color: '#9a3412', marginBottom: '14px'}}>
          <AlertCircle size={16} style={{color: '#ea580c'}}/>
          <b>Outstanding payment for {collectingAllocation.student_name}</b>
        </div>
        <div className="detail-grid" style={{marginBottom: '16px'}}>
          <Detail label="Student" value={`${collectingAllocation.student_name} (${collectingAllocation.student_mobile})`}/>
          <Detail label="Seat" value={`Seat ${collectingAllocation.seat_number} (${collectingAllocation.chair_type} chair)`}/>
          <Detail label="Total package fee" value={`₹${collectingAllocation.total_amount}`}/>
          <Detail label="Already paid" value={`₹${collectingAllocation.amount_paid}`}/>
          <Detail label="Remaining balance" value={`₹${collectingAllocation.amount_pending}`}/>
          <Detail label="Original mode" value={collectingAllocation.payment_mode}/>
        </div>
        <label>Payment mode<select value={collectForm.payment_mode} onChange={e=>setCollectForm(f=>({...f,payment_mode:e.target.value}))}><option>UPI</option><option>Cash</option><option>Bank Transfer</option></select></label>
        <label>Amount to collect (₹) *<input type="number" min="1" max={collectingAllocation.amount_pending} value={collectForm.amount} onChange={e=>setCollectForm(f=>({...f,amount:e.target.value}))} required/><span className="field-hint">Outstanding balance: ₹{collectingAllocation.amount_pending}. You can collect full or partial payment.</span></label>
        <div className="modal-actions" style={{marginTop: '18px'}}>
          <button type="button" className="secondary" onClick={()=>setCollectingAllocation(null)}>Cancel</button>
          <button className="primary" disabled={saving}>{saving?'Recording payment…':`Confirm collection of ₹${Number(collectForm.amount||0).toLocaleString('en-IN')}`}</button>
        </div>
      </form>
    </Modal>}
    {selectedSeat&&<Modal title={`Seat ${selectedSeat.number}`} onClose={()=>setSelectedSeat(null)}>
      {selectedSeat.status==='occupied' ? (
        <div className="occupied-detail">
          <div className="occupied-banner">
            <span className="dot red"></span>
            <b>Currently occupied</b>
            {selectedSeat.allocation?.is_upgraded && (
              <span className="upgrade-badge">⭐ Upgraded to Executive</span>
            )}
          </div>
          <h3>{selectedSeat.allocation?.student_name}</h3>
          <p className="muted">
            {selectedSeat.allocation?.student_gender ? `${selectedSeat.allocation.student_gender} · ` : ''}
            {selectedSeat.allocation?.student_mobile}
          </p>
          <div className="detail-grid">
            <Detail
              label="Chair type"
              value={
                selectedSeat.allocation?.is_upgraded
                  ? 'Executive (Upgraded)'
                  : (selectedSeat.allocation?.chair_type === 'executive' ? 'Executive chair' : 'Normal chair')
              }
            />
            <Detail
              label="Duration"
              value={selectedSeat.allocation?.duration_months === 0 ? '1 day trial' : `${selectedSeat.allocation?.duration_months} month(s)`}
            />
            <Detail label="Start date" value={selectedSeat.allocation?.start_date}/>
            <Detail label="End date" value={selectedSeat.allocation?.end_date}/>
            <Detail label="Total amount" value={`₹${selectedSeat.allocation?.total_amount}`}/>
            <Detail label="Paid" value={`₹${selectedSeat.allocation?.amount_paid}`}/>
            <Detail label="Pending" value={`₹${selectedSeat.allocation?.amount_pending}`}/>
            <Detail label="Payment mode" value={selectedSeat.allocation?.payment_mode}/>
            {selectedSeat.allocation?.is_upgraded && (
              <Detail label="Upgrade fee added" value={`+ ₹${selectedSeat.allocation?.upgrade_fee}`}/>
            )}
            {selectedSeat.allocation?.can_upgrade && (
              <Detail
                label="Remaining time"
                value={`${selectedSeat.allocation?.remaining_days} days (${selectedSeat.allocation?.remaining_weeks} wk)`}
              />
            )}
          </div>

          {/* AUTOMATED UPGRADE SECTION FOR NORMAL CHAIR */}
          {selectedSeat.allocation?.can_upgrade && (
            <div className="automatic-upgrade-card">
              <div className="upgrade-card-header">
                <div className="upgrade-icon-box">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h4>Upgrade to Executive Chair</h4>
                  <p>₹50/week automatically calculated for the remaining days</p>
                </div>
              </div>

              <div className="auto-calc-breakdown">
                <div className="calc-pill-row">
                  <span className="calc-pill">
                    📅 <b>{selectedSeat.allocation.remaining_days}</b> remaining days
                  </span>
                  <span className="calc-arrow">➔</span>
                  <span className="calc-pill">
                    ⏱️ <b>{selectedSeat.allocation.remaining_weeks}</b> week(s)
                  </span>
                  <span className="calc-arrow">×</span>
                  <span className="calc-pill">
                    💰 <b>₹50</b> / week
                  </span>
                  <span className="calc-arrow">=</span>
                  <span className="calc-pill highlight">
                    ⭐ <b>₹{selectedSeat.allocation.upgrade_cost}</b>
                  </span>
                </div>

                <div className="calc-summary-text">
                  Student paid <b>₹{selectedSeat.allocation.amount_paid}</b> for Normal Chair. Upgrading adds <b>₹{selectedSeat.allocation.upgrade_cost}</b> for a new total of <b>₹{selectedSeat.allocation.total_amount + selectedSeat.allocation.upgrade_cost}</b>.
                </div>
              </div>

              <div className="upgrade-action-row">
                <label className="mode-select-label">
                  Payment mode:
                  <select
                    value={upgradePaymentMode}
                    onChange={e => setUpgradePaymentMode(e.target.value)}
                  >
                    <option>UPI</option>
                    <option>Cash</option>
                    <option>Bank Transfer</option>
                  </select>
                </label>

                <button
                  type="button"
                  className="upgrade-action-button full-btn"
                  onClick={handleAutomaticUpgrade}
                  disabled={saving}
                >
                  <Sparkles size={16} />
                  {saving ? 'Upgrading…' : `Confirm & Upgrade to Executive (₹${selectedSeat.allocation.upgrade_cost})`}
                </button>
              </div>
            </div>
          )}

          <div className="modal-actions">
            <button className="secondary" onClick={()=>setSelectedSeat(null)}>Close</button>
            <button className="danger" onClick={()=>releaseSeat(selectedSeat.number)}>Release seat</button>
          </div>
        </div>
      ) : (
        <form className="form-stack modal-form" onSubmit={allocate}>
          <div className="seat-available-banner"><CheckCircle2 size={18}/> This seat is available for allocation.</div>
          <label>Select registered student *<select value={allocationForm.student} onChange={e=>updateAllocation('student',e.target.value)} required><option value="">Choose student…</option>{students.map(s=><option key={s.id} value={s.id}>{s.name} ({s.gender || 'Male'}) · {s.mobile}</option>)}</select></label>
          {students.length===0&&<p className="helper">Register a student first, then return to allocate a seat.</p>}
          <label>Date of joining<input type="date" value={allocationForm.start_date} onChange={e=>updateAllocation('start_date',e.target.value)} required/></label>
          <fieldset><legend>Chair type *</legend><label className="choice-card"><input type="radio" checked={allocationForm.chair_type==='normal'} onChange={()=>updateAllocation('chair_type','normal')}/><span><b>Normal chair</b><small>₹1,390/mo</small></span></label><label className="choice-card"><input type="radio" checked={allocationForm.chair_type==='executive'} onChange={()=>updateAllocation('chair_type','executive')}/><span><b>Executive chair</b><small>₹1,590/mo</small></span></label></fieldset>
          <label>Membership duration<select value={allocationForm.duration_months} onChange={e=>updateAllocation('duration_months',e.target.value)}><option value="0">1 day trial (₹100)</option><option value="1">1 month</option><option value="2">2 months</option><option value="3">3 months</option><option value="6">6 months</option><option value="12">12 months</option></select></label>
          <label>Mode of payment<select value={allocationForm.payment_mode} onChange={e=>updateAllocation('payment_mode',e.target.value)}><option>UPI</option><option>Cash</option><option>Bank Transfer</option></select></label>
          <label>Amount paid (₹)<input type="number" min="0" max={priceFor(allocationForm.chair_type, allocationForm.duration_months)} value={allocationForm.amount_paid} onChange={e=>updateAllocation('amount_paid',e.target.value)} required/></label>
          <div className="price-summary"><span>Total amount</span><b>₹{priceFor(allocationForm.chair_type, allocationForm.duration_months).toLocaleString('en-IN')}</b><small>Pending after payment: ₹{Math.max(priceFor(allocationForm.chair_type, allocationForm.duration_months)-Number(allocationForm.amount_paid||0),0).toLocaleString('en-IN')}</small></div>
          <div className="modal-actions"><button type="button" className="secondary" onClick={()=>setSelectedSeat(null)}>Cancel</button><button className="primary" disabled={saving||students.length===0}>{saving?'Allocating…':'Confirm allocation'}</button></div>
        </form>
      )}
    </Modal>}
    {verifyingAlloc && (
      <Modal title={`Verify Student Departure · Seat ${verifyingAlloc.seat_number}`} onClose={() => setVerifyingAlloc(null)}>
        <form className="form-stack modal-form" onSubmit={handleVerifySubmit}>
          <div className="occupied-banner" style={{background: '#f8fafc', borderColor: '#cbd5e1', color: '#1e293b', marginBottom: '14px'}}>
            <Armchair size={17} style={{color: '#0284c7'}}/>
            <div>
              <b>{verifyingAlloc.student_name}</b> ({verifyingAlloc.student_mobile})
              <small style={{display: 'block', color: '#64748b', fontSize: '11.5px', marginTop: '2px'}}>
                Seat {verifyingAlloc.seat_number} · Expired on {verifyingAlloc.end_date} ({verifyingAlloc.days_diff < 0 ? `${-verifyingAlloc.days_diff} day(s) ago` : verifyingAlloc.days_diff === 0 ? 'Today' : `in ${verifyingAlloc.days_diff} days`})
              </small>
            </div>
          </div>

          <div className="verify-seat-status-box">
            <CheckCircle2 size={16} style={{color: '#16a34a'}} />
            <span>
              <b>Seat Status:</b> {verifyingAlloc.is_seat_available ? `Seat ${verifyingAlloc.seat_number} has been automatically freed and is now available for new bookings.` : `Seat ${verifyingAlloc.seat_number} is currently occupied/reallocated.`}
            </span>
          </div>

          <fieldset className="verify-options-group">
            <legend>Did this student leave Cree8 Library, or are they continuing? *</legend>

            <label className={`verify-choice-card ${verifyForm.verification_status === 'confirmed_left' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="verification_status"
                value="confirmed_left"
                checked={verifyForm.verification_status === 'confirmed_left'}
                onChange={() => setVerifyForm(f => ({ ...f, verification_status: 'confirmed_left' }))}
              />
              <div className="choice-card-content">
                <div className="choice-title">
                  <UserX size={16} style={{color: '#dc2626'}} />
                  <b>Student has ended & left Cree8 (Confirmed Departure)</b>
                </div>
                <p>Student has completed their tenure and vacating the seat. The seat remains freed for other members.</p>
              </div>
            </label>

            <label className={`verify-choice-card ${verifyForm.verification_status === 'renew' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="verification_status"
                value="renew"
                checked={verifyForm.verification_status === 'renew'}
                onChange={() => setVerifyForm(f => ({ ...f, verification_status: 'renew' }))}
              />
              <div className="choice-card-content">
                <div className="choice-title">
                  <Repeat size={16} style={{color: '#16a34a'}} />
                  <b>Student is continuing / Wants to renew seat now</b>
                </div>
                <p>Proceed immediately to the renewal form to extend their membership and assign a seat.</p>
              </div>
            </label>

            <label className={`verify-choice-card ${verifyForm.verification_status === 'retained' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="verification_status"
                value="retained"
                checked={verifyForm.verification_status === 'retained'}
                onChange={() => setVerifyForm(f => ({ ...f, verification_status: 'retained' }))}
              />
              <div className="choice-card-content">
                <div className="choice-title">
                  <Clock size={16} style={{color: '#0284c7'}} />
                  <b>Grace period / Temporarily retained</b>
                </div>
                <p>Student requested grace days before renewing or vacating. Temporarily keep on file.</p>
              </div>
            </label>

            <label className={`verify-choice-card ${verifyForm.verification_status === 'pending' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="verification_status"
                value="pending"
                checked={verifyForm.verification_status === 'pending'}
                onChange={() => setVerifyForm(f => ({ ...f, verification_status: 'pending' }))}
              />
              <div className="choice-card-content">
                <div className="choice-title">
                  <HelpCircle size={16} style={{color: '#ea580c'}} />
                  <b>Keep as Pending / Follow up later</b>
                </div>
                <p>Yet to contact student or student has not replied yet.</p>
              </div>
            </label>
          </fieldset>

          <label>
            Admin Remarks / Verification Notes
            <textarea
              rows="3"
              value={verifyForm.verification_notes}
              onChange={e => setVerifyForm(f => ({ ...f, verification_notes: e.target.value }))}
              placeholder="e.g. Exam completed, locker key returned, spoke on phone, or student will pay next Monday..."
              className="notes-textarea"
            />
          </label>

          <div className="modal-actions" style={{marginTop: '16px'}}>
            <button type="button" className="secondary" onClick={() => setVerifyingAlloc(null)}>Cancel</button>
            <button className="primary" disabled={saving}>
              {saving ? 'Saving...' : verifyForm.verification_status === 'renew' ? 'Proceed to Renew Seat →' : 'Save Verification'}
            </button>
          </div>
        </form>
      </Modal>
    )}

    {renewingAlloc && (
      <Modal title={`Renew Subscription · ${renewingAlloc.student_name}`} onClose={() => setRenewingAlloc(null)}>
        <form className="form-stack modal-form" onSubmit={handleRenewSubmit}>
          <div className="occupied-banner" style={{background: '#f0fdf4', borderColor: '#bbf7d0', color: '#14532d', marginBottom: '14px'}}>
            <Repeat size={16} style={{color: '#16a34a'}}/>
            <b>Renewing membership for {renewingAlloc.student_name}</b>
          </div>

          <label>
            Seat to allocate *
            <select
              value={renewForm.seat_number}
              onChange={e => updateRenewForm('seat_number', e.target.value)}
              required
            >
              <option value={renewingAlloc.seat_number}>
                Previous Seat {renewingAlloc.seat_number} {renewingAlloc.is_seat_available ? '(Available)' : '(Currently Occupied - choose another if needed)'}
              </option>
              {seats.filter(s => s.status === 'available' && s.number !== renewingAlloc.seat_number).map(s => (
                <option key={s.number} value={s.number}>
                  Seat {s.number} (Available)
                </option>
              ))}
            </select>
          </label>

          <label>
            Start date of renewal *
            <input
              type="date"
              value={renewForm.start_date}
              onChange={e => updateRenewForm('start_date', e.target.value)}
              required
            />
          </label>

          <fieldset>
            <legend>Chair type *</legend>
            <label className="choice-card">
              <input
                type="radio"
                checked={renewForm.chair_type === 'normal'}
                onChange={() => updateRenewForm('chair_type', 'normal')}
              />
              <span><b>Normal chair</b><small>₹1,390/mo</small></span>
            </label>
            <label className="choice-card">
              <input
                type="radio"
                checked={renewForm.chair_type === 'executive'}
                onChange={() => updateRenewForm('chair_type', 'executive')}
              />
              <span><b>Executive chair</b><small>₹1,590/mo</small></span>
            </label>
          </fieldset>

          <label>
            Membership duration *
            <select
              value={renewForm.duration_months}
              onChange={e => updateRenewForm('duration_months', e.target.value)}
            >
              <option value="0">1 day trial (₹100)</option>
              <option value="1">1 month</option>
              <option value="2">2 months</option>
              <option value="3">3 months</option>
              <option value="6">6 months</option>
              <option value="12">12 months</option>
            </select>
          </label>

          <label>
            Payment channel
            <select
              value={renewForm.payment_mode}
              onChange={e => updateRenewForm('payment_mode', e.target.value)}
            >
              <option>UPI</option>
              <option>Cash</option>
              <option>Bank Transfer</option>
            </select>
          </label>

          <label>
            Amount paid (₹) *
            <input
              type="number"
              min="0"
              max={priceFor(renewForm.chair_type, renewForm.duration_months)}
              value={renewForm.amount_paid}
              onChange={e => updateRenewForm('amount_paid', e.target.value)}
              required
            />
          </label>

          <div className="price-summary">
            <span>Total renewal amount</span>
            <b>₹{priceFor(renewForm.chair_type, renewForm.duration_months).toLocaleString('en-IN')}</b>
            <small>
              Pending balance: ₹{Math.max(priceFor(renewForm.chair_type, renewForm.duration_months) - Number(renewForm.amount_paid || 0), 0).toLocaleString('en-IN')}
            </small>
          </div>

          <label>
            Verification / Renewal Remarks
            <input
              value={renewForm.verification_notes}
              onChange={e => updateRenewForm('verification_notes', e.target.value)}
              placeholder="e.g. Paid in full via GPay for next month"
            />
          </label>

          <div className="modal-actions" style={{marginTop: '16px'}}>
            <button type="button" className="secondary" onClick={() => setRenewingAlloc(null)}>Cancel</button>
            <button className="primary" disabled={saving}>
              {saving ? 'Renewing...' : 'Confirm Renewal & Allocate Seat'}
            </button>
          </div>
        </form>
      </Modal>
    )}

    {/* Mobile Bottom Navigation Bar (Dock) */}
    <nav className="mobile-bottom-bar" aria-label="Mobile Navigation">
      <button
        type="button"
        className={`mobile-bottom-item ${page === 'dashboard' ? 'active' : ''}`}
        onClick={() => navigateTo('dashboard')}
      >
        <LayoutDashboard size={18} />
        <span>Overview</span>
      </button>
      <button
        type="button"
        className={`mobile-bottom-item ${page === 'seats' ? 'active' : ''}`}
        onClick={() => navigateTo('seats')}
      >
        <Armchair size={18} />
        <span>Seats</span>
      </button>
      <button
        type="button"
        className={`mobile-bottom-item ${page === 'students' ? 'active' : ''}`}
        onClick={() => navigateTo('students')}
      >
        <div className="mobile-item-icon-wrap">
          <Users size={18} />
          {students.length > 0 && <span className="mobile-tab-badge">{students.length}</span>}
        </div>
        <span>Students</span>
      </button>
      <button
        type="button"
        className={`mobile-bottom-item ${page === 'transactions' ? 'active' : ''}`}
        onClick={() => navigateTo('transactions')}
      >
        <IndianRupee size={18} />
        <span>Txns</span>
      </button>
      <button
        type="button"
        className={`mobile-bottom-item ${page === 'pending' ? 'active' : ''}`}
        onClick={() => navigateTo('pending')}
      >
        <div className="mobile-item-icon-wrap">
          <AlertCircle size={18} />
          {activePendingAllocations.length > 0 && <span className="mobile-tab-badge amber">{activePendingAllocations.length}</span>}
        </div>
        <span>Pending</span>
      </button>
      <button
        type="button"
        className={`mobile-bottom-item ${page === 'subscriptions' ? 'active' : ''}`}
        onClick={() => navigateTo('subscriptions')}
      >
        <div className="mobile-item-icon-wrap">
          <Clock size={18} />
          {subscriptionsData?.stats?.pending_verification_count > 0 && <span className="mobile-tab-badge purple">{subscriptionsData.stats.pending_verification_count}</span>}
        </div>
        <span>Expiry</span>
      </button>
    </nav>
  </div>
}
function Stat({icon,label,value,tone,sub}){return <div className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div><p>{label}</p><strong>{value}</strong>{sub&&<small className="muted" style={{display:'block',marginTop:'2px'}}>{sub}</small>}</div></div>}
function Detail({label,value}){return <div className="detail-item"><small>{label}</small><b>{value||'—'}</b></div>}
function StudentTable({students, onEdit}){
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Gender</th>
            <th>Mobile</th>
            <th>Alternate</th>
            <th>Native Place</th>
            <th>Studying</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {students.length===0 ? (
            <tr>
              <td colSpan="7" className="empty-cell">
                <Search size={28} style={{color: '#94a3b8', margin: '0 auto 8px', display: 'block'}}/>
                <b>No students found</b>
                <p className="muted" style={{margin: '4px 0 0', fontSize: '12px'}}>Try searching with a different keyword or register a new student.</p>
              </td>
            </tr>
          ) : (
            students.map(s => (
              <tr key={s.id}>
                <td>
                  <div className="student-name">
                    <span className="student-avatar">{s.name.slice(0,1).toUpperCase()}</span>
                    <b>{s.name}</b>
                  </div>
                </td>
                <td>
                  <span className={`gender-badge ${(s.gender||'male').toLowerCase()}`}>
                    {s.gender||'Male'}
                  </span>
                </td>
                <td><b>{s.mobile}</b></td>
                <td>{s.alternate_mobile||'—'}</td>
                <td>{s.native_place||'—'}</td>
                <td>{s.currently_studying||'—'}</td>
                <td className="actions-cell">
                  <button className="icon-button" onClick={()=>onEdit(s)} title="Edit Student">
                    <Edit2 size={16}/>
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
function BankingTransactionFilters({ filter, setFilter, onReset, totalCount, filteredCount, filteredSum }) {
  const update = (key, val) => setFilter(prev => ({ ...prev, [key]: val }))

  const hasActiveFilters = filter.search.trim() !== '' ||
    filter.timeframe !== 'all' ||
    filter.type !== 'all' ||
    filter.mode !== 'all' ||
    filter.amountPreset !== 'all' ||
    filter.minAmount !== '' ||
    filter.maxAmount !== '' ||
    filter.sortBy !== 'date_desc'

  const secondaryFiltersCount = (filter.type !== 'all' ? 1 : 0) +
    (filter.mode !== 'all' ? 1 : 0) +
    (filter.amountPreset !== 'all' || filter.minAmount !== '' || filter.maxAmount !== '' ? 1 : 0) +
    (filter.sortBy !== 'date_desc' ? 1 : 0)

  return (
    <div className="banking-filters-wrap">
      {/* Top Controls Row */}
      <div className="banking-filters-top-row">
        <div className="banking-search-box">
          <Search size={16} />
          <input
            placeholder="Search student, mobile number, seat, description..."
            value={filter.search}
            onChange={e => update('search', e.target.value)}
          />
          {filter.search && (
            <button className="banking-search-clear" onClick={() => update('search', '')} title="Clear search">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Banking Timeframe Presets */}
        <div className="banking-preset-group">
          {[
            { id: 'all', label: 'All Time' },
            { id: 'today', label: 'Today' },
            { id: 'week', label: 'Last 7 Days' },
            { id: 'month', label: 'This Month' },
            { id: 'last30', label: 'Last 30 Days' },
            { id: 'custom', label: 'Custom' },
          ].map(p => (
            <button
              key={p.id}
              type="button"
              className={`banking-preset-btn ${filter.timeframe === p.id ? 'active' : ''}`}
              onClick={() => update('timeframe', p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="banking-actions-row">
          <button
            type="button"
            className={`banking-btn ${filter.showAdvanced ? 'active' : ''}`}
            onClick={() => update('showAdvanced', !filter.showAdvanced)}
            title="Toggle more banking filter options"
          >
            <SlidersHorizontal size={14} />
            <span>More Filters</span>
            {secondaryFiltersCount > 0 && (
              <span className="banking-filter-badge">{secondaryFiltersCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* Custom Date Range Picker */}
      {filter.timeframe === 'custom' && (
        <div className="banking-custom-dates-bar">
          <Calendar size={15} style={{ color: '#087f68' }} />
          <span><b>Custom Statement Range:</b></span>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            From:
            <input
              type="date"
              value={filter.startDate}
              onChange={e => update('startDate', e.target.value)}
            />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            To:
            <input
              type="date"
              value={filter.endDate}
              onChange={e => update('endDate', e.target.value)}
            />
          </label>
        </div>
      )}

      {/* Secondary Banking Filter Grid */}
      {filter.showAdvanced && (
        <div className="banking-filter-grid">
          {/* Transaction Type */}
          <div className="banking-filter-field">
            <label>Transaction Type</label>
            <select value={filter.type} onChange={e => update('type', e.target.value)}>
              <option value="all">All Types (Bookings & Upgrades)</option>
              <option value="allocation">Seat Allocation (Initial Booking)</option>
              <option value="upgrade">Chair Upgrade (Upgrade Fee)</option>
            </select>
          </div>

          {/* Payment Mode */}
          <div className="banking-filter-field">
            <label>Payment Channel</label>
            <select value={filter.mode} onChange={e => update('mode', e.target.value)}>
              <option value="all">All Channels (UPI, Cash, Bank)</option>
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          {/* Amount Tier */}
          <div className="banking-filter-field">
            <label>Amount Range</label>
            <select value={filter.amountPreset} onChange={e => update('amountPreset', e.target.value)}>
              <option value="all">All Amounts</option>
              <option value="under500">Micro (≤ ₹500)</option>
              <option value="500to1500">Standard (₹501 - ₹1,500)</option>
              <option value="above1500">Executive / Multi-Mo (&gt; ₹1,500)</option>
              <option value="custom">Custom Min / Max</option>
            </select>
          </div>

          {/* Custom Min / Max Inputs if selected */}
          {filter.amountPreset === 'custom' && (
            <div className="banking-filter-field">
              <label>Min - Max (₹)</label>
              <div className="banking-amount-inputs">
                <input
                  type="number"
                  placeholder="Min ₹"
                  value={filter.minAmount}
                  onChange={e => update('minAmount', e.target.value)}
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max ₹"
                  value={filter.maxAmount}
                  onChange={e => update('maxAmount', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Sort By */}
          <div className="banking-filter-field">
            <label>Sort Statement By</label>
            <select value={filter.sortBy} onChange={e => update('sortBy', e.target.value)}>
              <option value="date_desc">Date: Newest First (Default)</option>
              <option value="date_asc">Date: Oldest First</option>
              <option value="amount_desc">Amount: Highest First</option>
              <option value="amount_asc">Amount: Lowest First</option>
              <option value="seat_asc">Seat Number (Ascending)</option>
            </select>
          </div>
        </div>
      )}

      {/* Active Filter Chips & Summary */}
      <div className="banking-summary-bar">
        <div className="banking-chips-list">
          <span className="banking-count-info">
            Showing <b>{filteredCount}</b> of <b>{totalCount}</b> transactions · Total: <b>₹{filteredSum.toLocaleString('en-IN')}</b>
          </span>

          {filter.search && (
            <span className="banking-chip">
              Search: "{filter.search}"
              <button onClick={() => update('search', '')}><X size={12} /></button>
            </span>
          )}

          {filter.timeframe !== 'all' && (
            <span className="banking-chip">
              Period: {
                filter.timeframe === 'today' ? 'Today' :
                filter.timeframe === 'week' ? 'Last 7 Days' :
                filter.timeframe === 'month' ? 'This Month' :
                filter.timeframe === 'last30' ? 'Last 30 Days' : 'Custom Dates'
              }
              <button onClick={() => update('timeframe', 'all')}><X size={12} /></button>
            </span>
          )}

          {filter.type !== 'all' && (
            <span className="banking-chip">
              Type: {filter.type === 'upgrade' ? 'Chair Upgrade' : 'Seat Allocation'}
              <button onClick={() => update('type', 'all')}><X size={12} /></button>
            </span>
          )}

          {filter.mode !== 'all' && (
            <span className="banking-chip">
              Channel: {filter.mode}
              <button onClick={() => update('mode', 'all')}><X size={12} /></button>
            </span>
          )}

          {filter.amountPreset !== 'all' && (
            <span className="banking-chip">
              Amount: {
                filter.amountPreset === 'under500' ? '≤ ₹500' :
                filter.amountPreset === '500to1500' ? '₹501 - ₹1500' :
                filter.amountPreset === 'above1500' ? '> ₹1500' :
                `₹${filter.minAmount || 0} - ₹${filter.maxAmount || '∞'}`
              }
              <button onClick={() => { update('amountPreset', 'all'); update('minAmount', ''); update('maxAmount', ''); }}><X size={12} /></button>
            </span>
          )}

          {filter.sortBy !== 'date_desc' && (
            <span className="banking-chip">
              Sorted
              <button onClick={() => update('sortBy', 'date_desc')}><X size={12} /></button>
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <button type="button" className="banking-clear-all-btn" onClick={onReset} title="Reset all filters">
            <RotateCcw size={13} /> Reset Filters
          </button>
        )}
      </div>
    </div>
  )
}
function TransactionTable({transactions}){
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Txn Date</th>
            <th>Type</th>
            <th>Student</th>
            <th>Seat</th>
            <th>Description & Period</th>
            <th>Amount</th>
            <th>Mode</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length===0 ? (
            <tr>
              <td colSpan="7" className="empty-cell">
                <Search size={28} style={{color: '#94a3b8', margin: '0 auto 8px', display: 'block'}}/>
                <b>No matching transactions found</b>
                <p className="muted" style={{margin: '4px 0 0', fontSize: '12px'}}>Try adjusting your filters, date range, or search keyword.</p>
              </td>
            </tr>
          ) : (
            transactions.map(t => {
              const isUpgrade = t.transaction_type === 'upgrade'
              const txnAmount = Number(t.amount ?? t.amount_paid ?? 0)
              const txnDate = new Date(t.created_at)
              return (
                <tr key={t.id}>
                  <td>
                    <b>{txnDate.toLocaleDateString()}</b>
                    <br/>
                    <small className="muted">{txnDate.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</small>
                  </td>
                  <td>
                    {isUpgrade ? (
                      <span className="upgrade-pill">⭐ Upgrade</span>
                    ) : (
                      <span className="allocation-pill">🪑 Allocation</span>
                    )}
                  </td>
                  <td>
                    <b>{t.student_name}</b>
                    <br/>
                    <small className="muted">{t.student_mobile}</small>
                  </td>
                  <td>
                    <b>Seat {t.seat_number}</b>
                    {t.chair_type && (
                      <small className="muted" style={{display:'block', textTransform:'capitalize'}}>
                        {isUpgrade ? 'Executive' : t.chair_type}
                      </small>
                    )}
                  </td>
                  <td>
                    <span>{t.description || (isUpgrade ? 'Chair Upgrade' : 'Seat Allocation')}</span>
                    {t.start_date && t.end_date && (
                      <small className="muted" style={{display:'block'}}>
                        Valid: {t.start_date} to {t.end_date}
                      </small>
                    )}
                  </td>
                  <td>
                    {isUpgrade ? (
                      <b style={{color: '#ea580c', fontSize: '13.5px'}}>+ ₹{txnAmount.toLocaleString('en-IN')}</b>
                    ) : (
                      <b style={{color: '#15803d', fontSize: '13.5px'}}>₹{txnAmount.toLocaleString('en-IN')}</b>
                    )}
                  </td>
                  <td><span className="pill">{t.payment_mode}</span></td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
function PendingTable({ allocations, onCollect }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Seat & Chair</th>
            <th>Validity Period</th>
            <th>Package Fee</th>
            <th>Amount Paid</th>
            <th>Remaining Due</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {allocations.length === 0 ? (
            <tr>
              <td colSpan="8" className="empty-cell">
                <CheckCircle2 size={32} style={{color: '#10b981', margin: '0 auto 8px', display: 'block'}}/>
                <b>No pending payments found!</b>
                <p className="muted" style={{margin: '4px 0 0', fontSize: '12px'}}>All filtered allocations are fully paid.</p>
              </td>
            </tr>
          ) : (
            allocations.map(a => {
              const pending = Number(a.amount_pending || 0)
              const paid = Number(a.amount_paid || 0)
              const total = Number(a.total_amount || 0)
              return (
                <tr key={a.id}>
                  <td>
                    <div className="student-name">
                      <span className="student-avatar">{a.student_name.slice(0, 1).toUpperCase()}</span>
                      <div>
                        <b>{a.student_name}</b>
                        <br/>
                        <small className="muted">{a.student_mobile}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <b>Seat {a.seat_number}</b>
                    <div style={{marginTop: '2px'}}>
                      <span className="pill" style={{textTransform: 'capitalize'}}>
                        {a.chair_type} chair
                      </span>
                      {a.is_upgraded && (
                        <span className="upgrade-pill" style={{marginLeft: '4px'}}>⭐ Upgraded</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <b>{a.duration_months === 0 ? '1 day trial' : `${a.duration_months} month(s)`}</b>
                    <br/>
                    <small className="muted">{a.start_date} to {a.end_date}</small>
                  </td>
                  <td>
                    <b>₹{total.toLocaleString('en-IN')}</b>
                  </td>
                  <td>
                    <span className="paid-badge">₹{paid.toLocaleString('en-IN')}</span>
                  </td>
                  <td>
                    <span className="pending-badge">
                      <AlertCircle size={13}/> ₹{pending.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td>
                    <span className={`status-dot-badge ${a.is_active ? 'active' : 'inactive'}`}>
                      <span className="dot"></span>
                      {a.is_active ? 'Active seat' : 'Released / Past'}
                    </span>
                  </td>
                  <td>
                    <button className="collect-btn" onClick={() => onCollect(a)} title="Collect remaining fee">
                      Collect Due
                    </button>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
function SubscriptionTable({ subscriptions, onVerify, onQuickVerifyLeft, onRenew }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Seat & Availability</th>
            <th>Validity & Expiry</th>
            <th>Auto-Free Status</th>
            <th>Verification Status</th>
            <th>Admin Remarks</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {subscriptions.length === 0 ? (
            <tr>
              <td colSpan="7" className="empty-cell">
                <CheckCircle2 size={32} style={{color: '#10b981', margin: '0 auto 8px', display: 'block'}}/>
                <b>No matching subscriptions found!</b>
                <p className="muted" style={{margin: '4px 0 0', fontSize: '12px'}}>Try switching filter tabs or clearing your search query.</p>
              </td>
            </tr>
          ) : (
            subscriptions.map(s => {
              const days = s.days_diff
              const isEnded = days < 0
              const isToday = days === 0
              const isSoon = days > 0 && days <= 7
              const isPending = s.verification_status === 'pending'
              const isConfirmedLeft = s.verification_status === 'confirmed_left'
              const isRenewed = s.verification_status === 'renewed'
              const isRetained = s.verification_status === 'retained'

              return (
                <tr key={s.id} className={isEnded && isPending ? 'row-highlight-pending' : ''}>
                  <td>
                    <div className="student-name">
                      <span className="student-avatar">{s.student_name.slice(0, 1).toUpperCase()}</span>
                      <div>
                        <b>{s.student_name}</b>
                        <br/>
                        <small className="muted">{s.student_mobile}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <b>Seat {s.seat_number}</b>
                    <div style={{marginTop: '2px'}}>
                      <span className="pill" style={{textTransform: 'capitalize'}}>
                        {s.chair_type} chair
                      </span>
                    </div>
                    <small style={{display: 'block', marginTop: '4px', fontSize: '11px', color: s.is_seat_available ? '#16a34a' : '#64748b'}}>
                      {s.is_seat_available ? '● Seat is Available' : '○ Seat Reallocated'}
                    </small>
                  </td>
                  <td>
                    <b>{s.duration_months === 0 ? '1 day trial' : `${s.duration_months} mo`}</b>
                    <small className="muted" style={{display: 'block', margin: '2px 0 4px'}}>
                      {s.start_date} to {s.end_date}
                    </small>
                    {isEnded && (
                      <span className="expiry-pill ended">
                        <Clock size={12}/> Ended {-days}d ago
                      </span>
                    )}
                    {isToday && (
                      <span className="expiry-pill today">
                        <AlertCircle size={12}/> Ends Today
                      </span>
                    )}
                    {isSoon && (
                      <span className="expiry-pill urgent">
                        <Clock size={12}/> Expires in {days}d
                      </span>
                    )}
                    {!isEnded && !isToday && !isSoon && (
                      <span className="expiry-pill active">
                        <CheckCircle2 size={12}/> {days}d left
                      </span>
                    )}
                  </td>
                  <td>
                    {s.auto_freed ? (
                      <span className="auto-freed-badge">
                        <Check size={12}/> Auto-Freed
                      </span>
                    ) : !s.is_active ? (
                      <span className="auto-freed-badge manual">
                        Released
                      </span>
                    ) : (
                      <span className="active-seat-pill">
                        Active Seat
                      </span>
                    )}
                  </td>
                  <td>
                    {isPending && (
                      <span className="verify-pill pending">
                        <HelpCircle size={12}/> Unverified
                      </span>
                    )}
                    {isConfirmedLeft && (
                      <span className="verify-pill confirmed">
                        <UserX size={12}/> Confirmed Left
                      </span>
                    )}
                    {isRenewed && (
                      <span className="verify-pill renewed">
                        <Repeat size={12}/> Renewed
                      </span>
                    )}
                    {isRetained && (
                      <span className="verify-pill retained">
                        <Clock size={12}/> Grace Period
                      </span>
                    )}
                    {s.verified_at && (
                      <small className="muted" style={{display: 'block', marginTop: '3px', fontSize: '10.5px'}}>
                        {new Date(s.verified_at).toLocaleDateString([], {day: '2-digit', month: 'short'})}
                      </small>
                    )}
                  </td>
                  <td>
                    {s.verification_notes ? (
                      <div className="verify-note-box" title={s.verification_notes}>
                        💬 {s.verification_notes}
                      </div>
                    ) : (
                      <span className="muted" style={{fontSize: '12px'}}>—</span>
                    )}
                  </td>
                  <td>
                    <div className="sub-actions-stack">
                      <button
                        className="btn-verify-action"
                        onClick={() => onVerify(s)}
                        title="Verify whether student has ended or is continuing"
                      >
                        <UserCheck size={13}/> Verify
                      </button>
                      {isPending && isEnded && (
                        <button
                          className="btn-quick-left"
                          onClick={() => onQuickVerifyLeft(s)}
                          title="Quick 1-click confirmation that student has left library"
                        >
                          <UserX size={13}/> Left
                        </button>
                      )}
                      <button
                        className="btn-renew-action"
                        onClick={() => onRenew(s)}
                        title="Renew subscription"
                      >
                        <Repeat size={13}/> Renew
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
export default App
