import React, { useEffect, useMemo, useState } from 'react'
import { api, login } from './api'
import { Armchair, Users, LayoutDashboard, LogOut, UserPlus, Search, RefreshCw, X, CheckCircle2, IndianRupee, CalendarDays, CreditCard, ChevronRight, Menu, Edit2 } from 'lucide-react'

const priceFor = (chair, duration) => {
  if (Number(duration) === 0) return 100
  return (chair === 'executive' ? 1590 : 1390) * Number(duration)
}
const layoutRows = [
  { id: 'top-left', seats: [5,4,3,2,1], className: 'vertical top-left' },
  { id: 'top-middle', seats: [6,7,8,9,10,11], className: 'vertical top-middle' },
  { id: 'top-horizontal', seats: [12,13,14,15,16,17,18,19,20], className: 'horizontal top-horizontal' },
  { id: 'middle-upper', seats: [29,28,27,26,25,24,23,22,21], className: 'horizontal middle-upper' },
  { id: 'middle-lower', seats: [30,31,32,33,34,35,36,37,38], className: 'horizontal middle-lower' },
  { id: 'bottom-horizontal', seats: [47,46,45,44,43,42,41,40,39], className: 'horizontal bottom-horizontal' },
  { id: 'left-lower', seats: [51,50,49,48], className: 'vertical left-lower' },
]
function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(e) {
    e.preventDefault(); setError(''); setBusy(true)
    try { await onLogin(username, password) } catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  return <div className="login-page"><div className="login-card"><div className="brand-mark"><Armchair size={26}/></div><p className="eyebrow">CREE8 STUDY & CO-WORK</p><h1>Welcome back</h1><p className="muted">Sign in to manage students, seats and payments.</p><form onSubmit={submit} className="form-stack"><label>Username<input autoComplete="username" value={username} onChange={e=>setUsername(e.target.value)} required /></label><label>Password<input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required /></label>{error && <div className="error">{error}</div>}<button className="primary full" disabled={busy}>{busy?'Signing in…':'Sign in to dashboard'}</button></form><p className="tiny muted">Create an admin account with <code>python manage.py createsuperuser</code>.</p></div></div>
}
function SeatTile({ number, seat, onClick }) {
  const occupied = seat?.status === 'occupied'
  return <button title={`Seat ${number} · ${occupied?'Occupied':'Available'}`} onClick={()=>onClick(number)} className={`seat-tile ${occupied?'occupied':'available'}`}><span>{number}</span><small>{occupied?'Occupied':'Available'}</small></button>
}
function SeatMap({ seats, onSeatClick }) {
  const byNumber = useMemo(()=>Object.fromEntries(seats.map(s=>[s.number,s])),[seats])
  return <div className="map-shell"><div className="map-wall"><div className="map-entrance entrance-top"></div><div className="map-entrance entrance-left"></div><div className="map-room">
    <div className="map-top-zone"><div className="seat-stack stack-left">{[5,4,3,2,1].map(n=><SeatTile key={n} number={n} seat={byNumber[n]} onClick={onSeatClick}/>)}</div><div className="seat-stack stack-mid">{[6,7,8,9,10,11].map(n=><SeatTile key={n} number={n} seat={byNumber[n]} onClick={onSeatClick}/>)}</div></div>
    <div className="seat-row row-12">{[12,13,14,15,16,17,18,19,20].map(n=><SeatTile key={n} number={n} seat={byNumber[n]} onClick={onSeatClick}/>)}</div>
    <div className="map-middle-zone"><div className="seat-stack stack-51">{[51,50,49,48].map(n=><SeatTile key={n} number={n} seat={byNumber[n]} onClick={onSeatClick}/>)}</div><div className="middle-block"><div className="seat-row">{[29,28,27,26,25,24,23,22,21].map(n=><SeatTile key={n} number={n} seat={byNumber[n]} onClick={onSeatClick}/>)}</div><div className="seat-row">{[30,31,32,33,34,35,36,37,38].map(n=><SeatTile key={n} number={n} seat={byNumber[n]} onClick={onSeatClick}/>)}</div></div></div>
    <div className="bottom-zone"><div className="bottom-door"></div><div className="seat-row row-bottom">{[47,46,45,44,43,42,41,40,39].map(n=><SeatTile key={n} number={n} seat={byNumber[n]} onClick={onSeatClick}/>)}</div></div>
  </div></div><div className="map-legend"><span><i className="dot green"></i> Available</span><span><i className="dot red"></i> Occupied</span><span className="muted">Select any seat to view options</span></div></div>
}
function Modal({ children, onClose, title }) { return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><div className="modal"><div className="modal-head"><h2>{title}</h2><button className="icon-button" onClick={onClose}><X size={20}/></button></div>{children}</div></div> }
function App() {
  const [user,setUser] = useState(null)
  const [page,setPage] = useState('dashboard')
  const [students,setStudents] = useState([])
  const [seats,setSeats] = useState([])
  const [allocations,setAllocations] = useState([])
  const [dashboard,setDashboard] = useState({})
  const [loading,setLoading] = useState(false)
  const [error,setError] = useState('')
  const [notice,setNotice] = useState('')
  const [query,setQuery] = useState('')
  const [selectedSeat,setSelectedSeat] = useState(null)
  const [showRegister,setShowRegister] = useState(false)
  const [studentForm,setStudentForm] = useState({id:'',name:'',mobile:'',alternate_mobile:'',native_place:'',currently_studying:''})
  const [allocationForm,setAllocationForm] = useState({student:'',chair_type:'normal',duration_months:1,payment_mode:'UPI',amount_paid:'1390',start_date:new Date().toISOString().slice(0,10)})
  const [saving,setSaving] = useState(false)
  async function loadAll() {
    setLoading(true); setError('')
    try {
      const [s,st,d,al] = await Promise.all([api('/seats/'),api('/students/'),api('/dashboard/'),api('/allocations/')])
      setSeats(s); setStudents(st); setDashboard(d); setAllocations(al)
    } catch(e) { setError(e.message) } finally { setLoading(false) }
  }
  useEffect(()=>{ api('/auth/me/').then(setUser).catch(()=>{}) },[])
  useEffect(()=>{ if(user) loadAll() },[user])
  async function handleLogin(username,password) { const u=await login(username,password); setUser(u) }
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
      setStudentForm({id:'',name:'',mobile:'',alternate_mobile:'',native_place:'',currently_studying:''});
      setShowRegister(false);
      await loadAll()
    }
    catch(e){setError(e.message)} finally{setSaving(false)}
  }
  function openEditStudent(student) {
    setStudentForm({...student});
    setShowRegister(true);
  }
  function openSeat(number) {
    const seat=seats.find(s=>s.number===number)
    setSelectedSeat({number,...(seat||{})})
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
  const filteredStudents=students.filter(s=>(s.name+' '+s.mobile).toLowerCase().includes(query.toLowerCase()))
  if(!user) return <Login onLogin={handleLogin}/>
  return <div className="app-layout">
    <aside className="sidebar"><div className="sidebar-brand"><div className="brand-mark small"><Armchair size={21}/></div><div><b>CREE8 Study & Co-work</b><small>Byramji Town, Nagpur<br/>+91 8010150969</small></div></div><div className="nav-label">WORKSPACE</div><button className={`nav-item ${page==='dashboard'?'active':''}`} onClick={()=>setPage('dashboard')}><LayoutDashboard size={18}/> Dashboard</button><button className={`nav-item ${page==='seats'?'active':''}`} onClick={()=>setPage('seats')}><Armchair size={18}/> Seat map</button><button className={`nav-item ${page==='students'?'active':''}`} onClick={()=>setPage('students')}><Users size={18}/> Students <span className="nav-count">{students.length}</span></button><button className={`nav-item ${page==='transactions'?'active':''}`} onClick={()=>setPage('transactions')}><IndianRupee size={18}/> Transactions</button><div className="sidebar-bottom"><div className="admin-avatar">{(user.username||'A').slice(0,1).toUpperCase()}</div><div className="admin-meta"><b>{user.username}</b><small>Administrator</small></div><button className="icon-button logout" onClick={handleLogout} title="Sign out"><LogOut size={18}/></button></div></aside>
    <main className="main-content"><header className="topbar"><div><p className="eyebrow">CREE8 STUDY & CO-WORK / ADMIN</p><h1>{page==='dashboard'?'Overview':page==='seats'?'Seat availability':page==='transactions'?'Transactions':'Student directory'}</h1></div><div className="top-actions"><button className="secondary" onClick={loadAll}><RefreshCw size={16}/> Refresh</button><button className="primary" onClick={()=>setShowRegister(true)}><UserPlus size={16}/> Register student</button></div></header>
      {error&&<div className="alert error"><span>{error}</span><button onClick={()=>setError('')}><X size={16}/></button></div>}{notice&&<div className="alert success"><CheckCircle2 size={18}/><span>{notice}</span><button onClick={()=>setNotice('')}><X size={16}/></button></div>}
      {page==='dashboard'&&<><section className="stats-grid"><Stat icon={<Armchair/>} label="Total seats" value={dashboard.total_seats??51} sub="29 Exec, 22 Normal" tone="blue"/><Stat icon={<CheckCircle2/>} label="Available seats" value={dashboard.available_seats??51} sub={`${dashboard.available_executive??29} Exec, ${dashboard.available_normal??22} Normal`} tone="green"/><Stat icon={<Users/>} label="Occupied seats" value={dashboard.occupied_seats??0} tone="red"/><Stat icon={<IndianRupee/>} label="Pending payments" value={`₹${dashboard.amount_pending??0}`} tone="amber"/></section><section className="content-card"><div className="section-heading"><div><h2>Live seat map</h2><p>Click any seat to allocate or view its details.</p></div><button className="text-button" onClick={()=>setPage('seats')}>Open full map <ChevronRight size={16}/></button></div><SeatMap seats={seats} onSeatClick={openSeat}/></section><section className="content-card"><div className="section-heading"><div><h2>Recently registered students</h2><p>Students saved in your library database.</p></div><button className="text-button" onClick={()=>setPage('students')}>View all <ChevronRight size={16}/></button></div><StudentTable students={students.slice(0,5)} onEdit={openEditStudent}/></section></>}
      {page==='seats'&&<section className="content-card"><div className="section-heading"><div><h2>51-seat floor layout</h2><p>29 Executive Chairs · 22 Normal Chairs</p><p className="muted">Green = available · Red = occupied</p></div><div className="map-summary">{dashboard.available_seats??51} available / {dashboard.total_seats??51}</div></div><SeatMap seats={seats} onSeatClick={openSeat}/></section>}
      {page==='students'&&<section className="content-card"><div className="section-heading"><div><h2>Student directory</h2><p>Search registered students by name or mobile.</p></div><button className="primary" onClick={()=>{setStudentForm({id:'',name:'',mobile:'',alternate_mobile:'',native_place:'',currently_studying:''}); setShowRegister(true)}}><UserPlus size={16}/> Add student</button></div><div className="search-box"><Search size={18}/><input placeholder="Search name or mobile number" value={query} onChange={e=>setQuery(e.target.value)}/></div><StudentTable students={filteredStudents} onEdit={openEditStudent}/></section>}
      {page==='transactions'&&<section className="content-card"><div className="section-heading"><div><h2>Transactions</h2><p>All received payments and seat allocations.</p></div></div><TransactionTable transactions={allocations}/></section>}
    </main>
    {showRegister&&<Modal title={studentForm.id?"Edit student":"Register new student"} onClose={()=>setShowRegister(false)}><form className="form-stack modal-form" onSubmit={registerStudent}><div className="form-grid"><label>Full name *<input value={studentForm.name} onChange={e=>updateStudent('name',e.target.value)} required maxLength="150"/></label><label>Mobile number *<input inputMode="numeric" pattern="[0-9]{10}" maxLength="10" value={studentForm.mobile} onChange={e=>updateStudent('mobile',e.target.value)} required placeholder="10-digit number"/></label><label>Alternate mobile<input inputMode="numeric" pattern="[0-9]{10}" maxLength="10" value={studentForm.alternate_mobile} onChange={e=>updateStudent('alternate_mobile',e.target.value)} placeholder="Optional"/></label><label>Native Place<input value={studentForm.native_place} onChange={e=>updateStudent('native_place',e.target.value)} placeholder="Optional"/></label><label>Currently studying<input value={studentForm.currently_studying} onChange={e=>updateStudent('currently_studying',e.target.value)} placeholder="e.g. B.Tech, UPSC preparation"/></label></div><div className="modal-actions"><button type="button" className="secondary" onClick={()=>setShowRegister(false)}>Cancel</button><button className="primary" disabled={saving}>{saving?'Saving…':(studentForm.id?'Save changes':'Register student')}</button></div></form></Modal>}
    {selectedSeat&&<Modal title={`Seat ${selectedSeat.number}`} onClose={()=>setSelectedSeat(null)}>{selectedSeat.status==='occupied'?<div className="occupied-detail"><div className="occupied-banner"><span className="dot red"></span><b>Currently occupied</b></div><h3>{selectedSeat.allocation?.student_name}</h3><p className="muted">{selectedSeat.allocation?.student_mobile}</p><div className="detail-grid"><Detail label="Chair type" value={selectedSeat.allocation?.chair_type}/><Detail label="Duration" value={selectedSeat.allocation?.duration_months === 0 ? '1 day trial' : `${selectedSeat.allocation?.duration_months} month(s)`}/><Detail label="Start date" value={selectedSeat.allocation?.start_date}/><Detail label="End date" value={selectedSeat.allocation?.end_date}/><Detail label="Total amount" value={`₹${selectedSeat.allocation?.total_amount}`}/><Detail label="Paid" value={`₹${selectedSeat.allocation?.amount_paid}`}/><Detail label="Pending" value={`₹${selectedSeat.allocation?.amount_pending}`}/><Detail label="Payment mode" value={selectedSeat.allocation?.payment_mode}/></div><div className="modal-actions"><button className="secondary" onClick={()=>setSelectedSeat(null)}>Close</button><button className="danger" onClick={()=>releaseSeat(selectedSeat.number)}>Release seat</button></div></div>:<form className="form-stack modal-form" onSubmit={allocate}><div className="seat-available-banner"><CheckCircle2 size={18}/> This seat is available for allocation.</div><label>Select registered student *<select value={allocationForm.student} onChange={e=>updateAllocation('student',e.target.value)} required><option value="">Choose student…</option>{students.map(s=><option key={s.id} value={s.id}>{s.name} · {s.mobile}</option>)}</select></label>{students.length===0&&<p className="helper">Register a student first, then return to allocate a seat.</p>}<label>Date of joining<input type="date" value={allocationForm.start_date} onChange={e=>updateAllocation('start_date',e.target.value)} required/></label><fieldset><legend>Chair type *</legend><label className="choice-card"><input type="radio" checked={allocationForm.chair_type==='normal'} onChange={()=>updateAllocation('chair_type','normal')}/><span><b>Normal chair</b><small>₹1,390/mo · {dashboard.available_normal??22} available</small></span></label><label className="choice-card"><input type="radio" checked={allocationForm.chair_type==='executive'} onChange={()=>updateAllocation('chair_type','executive')}/><span><b>Executive chair</b><small>₹1,590/mo · {dashboard.available_executive??29} available</small></span></label></fieldset><label>Membership duration<select value={allocationForm.duration_months} onChange={e=>updateAllocation('duration_months',e.target.value)}><option value="0">1 day trial (₹100)</option><option value="1">1 month</option><option value="2">2 months</option><option value="3">3 months</option><option value="6">6 months</option><option value="12">12 months</option></select></label><label>Mode of payment<select value={allocationForm.payment_mode} onChange={e=>updateAllocation('payment_mode',e.target.value)}><option>UPI</option><option>Cash</option><option>Bank Transfer</option></select></label><label>Amount paid (₹)<input type="number" min="0" max={priceFor(allocationForm.chair_type, allocationForm.duration_months)} value={allocationForm.amount_paid} onChange={e=>updateAllocation('amount_paid',e.target.value)} required/></label><div className="price-summary"><span>Total amount</span><b>₹{priceFor(allocationForm.chair_type, allocationForm.duration_months).toLocaleString('en-IN')}</b><small>Pending after payment: ₹{Math.max(priceFor(allocationForm.chair_type, allocationForm.duration_months)-Number(allocationForm.amount_paid||0),0).toLocaleString('en-IN')}</small></div><div className="modal-actions"><button type="button" className="secondary" onClick={()=>setSelectedSeat(null)}>Cancel</button><button className="primary" disabled={saving||students.length===0}>{saving?'Allocating…':'Confirm allocation'}</button></div></form>}</Modal>}
  </div>
}
function Stat({icon,label,value,tone,sub}){return <div className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div><p>{label}</p><strong>{value}</strong>{sub&&<small className="muted" style={{display:'block',marginTop:'2px'}}>{sub}</small>}</div></div>}
function Detail({label,value}){return <div className="detail-item"><small>{label}</small><b>{value||'—'}</b></div>}
function StudentTable({students, onEdit}){return <div className="table-wrap"><table><thead><tr><th>Student</th><th>Mobile</th><th>Alternate</th><th>Native Place</th><th>Studying</th><th></th></tr></thead><tbody>{students.length===0?<tr><td colSpan="6" className="empty-cell">No students found. Register your first student to get started.</td></tr>:students.map(s=><tr key={s.id}><td><div className="student-name"><span className="student-avatar">{s.name.slice(0,1).toUpperCase()}</span><b>{s.name}</b></div></td><td>{s.mobile}</td><td>{s.alternate_mobile||'—'}</td><td>{s.native_place||'—'}</td><td>{s.currently_studying||'—'}</td><td className="actions-cell"><button className="icon-button" onClick={()=>onEdit(s)} title="Edit Student"><Edit2 size={16}/></button></td></tr>)}</tbody></table></div>}
function TransactionTable({transactions}){return <div className="table-wrap"><table><thead><tr><th>Txn Date</th><th>Student</th><th>Seat</th><th>Period</th><th>Amount Paid</th><th>Mode</th></tr></thead><tbody>{transactions.length===0?<tr><td colSpan="6" className="empty-cell">No transactions found.</td></tr>:transactions.map(t=><tr key={t.id}><td>{new Date(t.created_at).toLocaleDateString()}</td><td><b>{t.student_name}</b><br/><small className="muted">{t.student_mobile}</small></td><td>Seat {t.seat_number}</td><td><b>{t.duration_months===0?'1 day trial':`${t.duration_months} month(s)`}</b><br/><small className="muted">{t.start_date} to {t.end_date}</small></td><td><b style={{color:'var(--green-600)'}}>₹{t.amount_paid}</b></td><td><span className="pill">{t.payment_mode}</span></td></tr>)}</tbody></table></div>}
export default App
