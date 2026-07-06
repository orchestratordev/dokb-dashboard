'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────
type Laporan = {
  id: string
  platform: string
  jarak: number
  tarif_diterima: number
  tarif_seharusnya: number
  selisih: number
  lokasi: string
  status: string
  created_at: string
}

type Project = {
  id: string
  nama: string
  deskripsi: string
  status: string
  progress: number
  target_date: string
}

type Idea = {
  id: string
  judul: string
  konten: string
  kategori: string
  created_at: string
}

type Reminder = {
  id: string
  judul: string
  deskripsi: string
  deadline: string
  is_done: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtRp = (n: number) => 'Rp ' + Math.abs(n).toLocaleString('id-ID')

const PLATFORM_STYLE: Record<string, { bg: string; color: string; code: string }> = {
  Grab:    { bg: '#e9f2ea', color: '#1d5d2a', code: 'GR' },
  Gojek:   { bg: '#e6f6ee', color: '#0d7a4d', code: 'GJ' },
  Maxim:   { bg: '#fef0f0', color: '#b91c1c', code: 'MX' },
  InDrive: { bg: '#eef7f0', color: '#0f7a45', code: 'ID' },
}

function getGreeting() {
  const h = new Date().getHours()
  if (h >= 4  && h < 11) return 'Selamat pagi, Pak Jani 👋'
  if (h >= 11 && h < 15) return 'Selamat siang, Pak Jani 👋'
  if (h >= 15 && h < 19) return 'Selamat sore, Pak Jani 👋'
  return 'Selamat malam, Pak Jani 👋'
}

function formatDate() {
  return new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  }) + ' • Kalsel'
}

// ─── Mini Bar Chart ──────────────────────────────────────────────────────────
function BarChart({ data }: { data: { label: string; value: number; today: boolean }[] }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 72, padding: '0 2px' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          {d.value > 0 && (
            <span style={{ fontSize: 10, fontWeight: 700, color: d.today ? '#dc2626' : '#9ca3af' }}>
              {d.value}
            </span>
          )}
          <div style={{
            width: '100%',
            height: `${Math.max((d.value / max) * 52, 3)}px`,
            background: d.today ? 'linear-gradient(180deg,#dc2626,#f97316)' : '#e5e7eb',
            borderRadius: '4px 4px 0 0',
            transition: 'height 0.5s ease'
          }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: d.today ? '#dc2626' : '#9ca3af' }}>
            {d.label}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressBar({ value, color = '#dc2626' }: { value: number; color?: string }) {
  return (
    <div style={{ height: 7, background: '#eceef2', borderRadius: 999, overflow: 'hidden' }}>
      <div style={{
        height: '100%', width: `${Math.min(value, 100)}%`,
        background: color, borderRadius: 999,
        transition: 'width 0.6s ease'
      }} />
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Home() {
  const [laporan,   setLaporan]   = useState<Laporan[]>([])
  const [projects,  setProjects]  = useState<Project[]>([])
  const [ideas,     setIdeas]     = useState<Idea[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading,   setLoading]   = useState(true)
  const [activeNav, setActiveNav] = useState('beranda')
  const [note,      setNote]      = useState('')
  const [noteSaved, setNoteSaved] = useState(false)
  const [toast,     setToast]     = useState('')
  const [filterP,   setFilterP]   = useState('all')
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const NOTE_KEY = 'dokb_note_v2'

  useEffect(() => {
    setNote(localStorage.getItem(NOTE_KEY) || '')
    fetchAll()
  }, [])

  async function fetchAll() {
    setLoading(true)
    const [lRes, pRes, iRes, rRes] = await Promise.all([
      supabase.from('laporan').select('*').order('created_at', { ascending: false }).limit(30),
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('ideas').select('*').eq('is_public', true).order('created_at', { ascending: false }).limit(8),
      supabase.from('reminders').select('*').eq('is_done', false).order('deadline', { ascending: true }).limit(5),
    ])
    if (lRes.data) setLaporan(lRes.data)
    if (pRes.data) setProjects(pRes.data)
    if (iRes.data) setIdeas(iRes.data)
    if (rRes.data) setReminders(rRes.data)
    setLoading(false)
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }

  function handleNote(val: string) {
    setNote(val)
    setNoteSaved(false)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      localStorage.setItem(NOTE_KEY, val)
      setNoteSaved(true)
      setTimeout(() => setNoteSaved(false), 1800)
    }, 600)
  }

  function exportCSV() {
    const rows = [
      ['Tanggal','Platform','Jarak(km)','Diterima','Seharusnya','Selisih','Lokasi','Status'],
      ...laporan.map(r => [
        new Date(r.created_at).toLocaleDateString('id-ID'),
        r.platform, r.jarak, r.tarif_diterima, r.tarif_seharusnya, r.selisih, r.lokasi, r.status
      ])
    ]
    const csv  = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `dokb-laporan-${new Date().toISOString().slice(0,10)}.csv`
    document.body.appendChild(a); a.click(); a.remove()
    URL.revokeObjectURL(url)
    showToast('✅ CSV berhasil diunduh')
  }

  // ── Derived stats ──────────────────────────────────────────────────────────
  const today      = new Date().toDateString()
  const laporanHariIni = laporan.filter(l => new Date(l.created_at).toDateString() === today).length
  const totalSelisih   = laporan.reduce((s, l) => s + (l.selisih || 0), 0)

  const kotaMap: Record<string, number> = {}
  laporan.forEach(l => { kotaMap[l.lokasi] = (kotaMap[l.lokasi] || 0) + 1 })
  const kotaSorted = Object.entries(kotaMap).sort((a, b) => b[1] - a[1])
  const hotKota    = kotaSorted[0]?.[0] || '-'

  // 7-day chart
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i))
    const ds = d.toDateString()
    const count = laporan.filter(l => new Date(l.created_at).toDateString() === ds).length
    const days = ['Min','Sen','Sel','Rab','Kam','Jum','Sab']
    return { label: days[d.getDay()], value: count, today: i === 6 }
  })

  const filteredLaporan = filterP === 'all'
    ? laporan.slice(0, 7)
    : laporan.filter(l => l.platform === filterP).slice(0, 7)

  // ── CSS vars ───────────────────────────────────────────────────────────────
  const css = `
    :root{
      --bg:#f5f5f7;--card:#fff;--line:#e5e7eb;--line-soft:#eef0f3;
      --text:#171a1f;--muted:#667085;--red:#dc2626;--red-dark:#b91c1c;
      --green:#129a5a;--shadow:0 1px 2px rgba(16,24,40,.04),0 4px 16px rgba(16,24,40,.03);
      --r:16px;--r-sm:11px;--font:'Plus Jakarta Sans',Inter,-apple-system,sans-serif;
    }
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:var(--font);background:var(--bg);color:var(--text);font-size:14px;
      line-height:1.5;-webkit-font-smoothing:antialiased;}
    button,input,textarea{font-family:inherit;cursor:pointer;}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
    @keyframes toastIn{from{transform:translateY(8px);opacity:0}to{transform:translateY(0);opacity:1}}
  `

  // ─── Card component ────────────────────────────────────────────────────────
  const card = (children: React.ReactNode, style?: React.CSSProperties) => (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: 16,
      boxShadow: '0 1px 2px rgba(16,24,40,.04),0 4px 16px rgba(16,24,40,.03)',
      padding: '16px',
      ...style
    }}>
      {children}
    </div>
  )

  return (
    <>
      <style>{css}</style>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '18px 16px 100px' }}>

        {/* ── Top Bar ───────────────────────────────────────────────────── */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: 17, letterSpacing: '-.015em' }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: '#fff', border: '1px solid #e5e7eb',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, color: '#dc2626', fontSize: 13,
              boxShadow: '0 1px 4px rgba(0,0,0,.08)'
            }}>DK</div>
            DOKB Dashboard
          </div>
          <div style={{ textAlign: 'right', fontSize: 12.4, color: '#667085', lineHeight: 1.45 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end', fontWeight: 600, color: '#3b4049', marginBottom: 1 }}>
              <span style={{ width: 7, height: 7, background: '#dc2626', borderRadius: '50%', boxShadow: '0 0 0 3px rgba(220,38,38,.15)', animation: 'pulse 1.8s infinite', display: 'inline-block' }} />
              Live
            </div>
            <div>{formatDate()}</div>
          </div>
        </header>

        {/* ── Greeting ──────────────────────────────────────────────────── */}
        <div style={{ marginBottom: 16 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.02em', marginBottom: 2 }}>
            {getGreeting()}
          </h1>
          <p style={{ fontSize: 13, color: '#667085' }}>
            {laporanHariIni} laporan masuk hari ini · Kota terpanas: <strong style={{ color: '#dc2626' }}>{hotKota}</strong>
          </p>
        </div>

        {/* ── KPI Strip ─────────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 16 }}>
          {[
            {
              label: 'Laporan Masuk',
              value: laporan.length,
              sub: `+${laporanHariIni} hari ini`,
              subColor: '#129a5a'
            },
            {
              label: 'Total Selisih Tarif',
              value: fmtRp(totalSelisih),
              sub: 'vs SK Gubernur',
              subColor: '#dc2626',
              mono: true
            },
            {
              label: 'Project Aktif',
              value: projects.filter(p => p.status === 'aktif').length,
              sub: `${projects.length} total project`,
              subColor: '#667085'
            },
            {
              label: 'Kota Terpantau',
              value: kotaSorted.length,
              sub: `dari 13 kab/kota`,
              subColor: '#667085'
            },
          ].map((k, i) => (
            <div key={i} style={{
              background: '#fff', border: '1px solid #e5e7eb',
              borderRadius: 14, padding: '13px 14px',
              boxShadow: '0 1px 2px rgba(16,24,40,.04),0 4px 16px rgba(16,24,40,.03)'
            }}>
              <div style={{ fontSize: 11.3, color: '#6d7585', fontWeight: 600, marginBottom: 5 }}>{k.label}</div>
              <div style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-.025em', lineHeight: 1.15, fontVariantNumeric: k.mono ? 'tabular-nums' : undefined }}>
                {loading ? '—' : k.value}
              </div>
              <div style={{ marginTop: 5, fontSize: 11.4, color: k.subColor, fontWeight: 700 }}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Main Grid ─────────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>

          {/* ── Laporan Tarif Card ───────────────────────────────────── */}
          {card(
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 }}>
                <div>
                  <div style={{ fontSize: 13.8, fontWeight: 700 }}>Laporan Tarif ASK</div>
                  <div style={{ fontSize: 12.2, color: '#667085', marginTop: 1 }}>7 hari terakhir · {laporan.length} total laporan</div>
                </div>
                <span style={{
                  fontSize: 10.6, fontWeight: 800, letterSpacing: '.03em', textTransform: 'uppercase',
                  color: '#dc2626', background: '#fff0f0', border: '1px solid #f4c6c6',
                  padding: '3px 8px', borderRadius: 999
                }}>LIVE</span>
              </div>

              {/* Chart */}
              <div style={{ background: '#f9f9fb', border: '1px solid #eef0f3', borderRadius: 12, padding: '12px 12px 8px', marginBottom: 12 }}>
                <BarChart data={chartData} />
              </div>

              {/* Platform Filter */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 12, overflowX: 'auto', paddingBottom: 2 }}>
                {['all', 'Grab', 'Gojek', 'Maxim', 'InDrive'].map(f => (
                  <button key={f}
                    onClick={() => setFilterP(f)}
                    style={{
                      padding: '4px 11px', borderRadius: 999, border: 'none',
                      fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
                      background: filterP === f ? '#dc2626' : '#f3f4f6',
                      color: filterP === f ? '#fff' : '#6b7280',
                      cursor: 'pointer'
                    }}
                  >
                    {f === 'all' ? 'Semua' : f}
                  </button>
                ))}
              </div>

              {/* Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.9, minWidth: 400 }}>
                  <thead>
                    <tr>
                      {['Platform','Jarak','Diterima','Seharusnya','Selisih','Lokasi'].map(h => (
                        <th key={h} style={{
                          textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280',
                          padding: '8px 9px', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap'
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={6} style={{ padding: '16px 9px', color: '#9ca3af', fontSize: 12 }}>⏳ Memuat...</td></tr>
                    ) : filteredLaporan.length === 0 ? (
                      <tr><td colSpan={6} style={{ padding: '16px 9px', color: '#9ca3af', fontSize: 12 }}>📭 Belum ada laporan</td></tr>
                    ) : filteredLaporan.map(r => {
                      const ps = PLATFORM_STYLE[r.platform] || { bg: '#f3f4f6', color: '#6b7280', code: '??' }
                      return (
                        <tr key={r.id} style={{ borderBottom: '1px solid #f0f1f4' }}>
                          <td style={{ padding: '10px 9px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                              <div style={{
                                width: 26, height: 26, borderRadius: 8,
                                background: ps.bg, color: ps.color,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 11, fontWeight: 800
                              }}>{ps.code}</div>
                              <span style={{ fontWeight: 600 }}>{r.platform}</span>
                            </div>
                          </td>
                          <td style={{ padding: '10px 9px', fontVariantNumeric: 'tabular-nums' }}>{r.jarak} km</td>
                          <td style={{ padding: '10px 9px', fontVariantNumeric: 'tabular-nums' }}>{fmtRp(r.tarif_diterima)}</td>
                          <td style={{ padding: '10px 9px', fontVariantNumeric: 'tabular-nums' }}>{fmtRp(r.tarif_seharusnya)}</td>
                          <td style={{ padding: '10px 9px', fontVariantNumeric: 'tabular-nums', color: '#dc2626', fontWeight: 700 }}>
                            -{fmtRp(r.selisih)}
                          </td>
                          <td style={{ padding: '10px 9px', color: '#667085' }}>{r.lokasi}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <a href="https://lapor.dokb.or.id/admin" target="_blank" rel="noopener"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#4b5563', fontSize: 12.6, fontWeight: 600, marginTop: 10, textDecoration: 'none' }}
              >
                Lihat semua di dashboard Lapor Tarif →
              </a>
            </>
          )}

          {/* ── Tarif Realita vs SK ──────────────────────────────────── */}
          {card(
            <>
              <div style={{ fontSize: 13.8, fontWeight: 700, marginBottom: 11 }}>Tarif Realita vs SK</div>
              <div style={{
                background: '#fafafb', border: '1px dashed #d9dce3',
                borderRadius: 12, padding: '11px 13px',
                fontSize: 12.6, color: '#4b5563', lineHeight: 1.55, marginBottom: 13
              }}>
                <strong style={{ color: '#222' }}>SK Gubernur Kalsel No. 100.3.3.1/0991/KUM/2025</strong><br />
                Flagfall Rp 16.000 (0–3 km) + Rp 4.000/km • NET to Driver
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 12.2, color: '#667085' }}>Total selisih tarif terlapor</span>
                <span style={{ fontWeight: 800, fontSize: 13.6, color: '#dc2626' }}>{fmtRp(totalSelisih)}</span>
              </div>
              <ProgressBar value={laporan.length > 0 ? Math.min((totalSelisih / laporan.length / 16000) * 100, 100) : 0} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.7, color: '#758195', marginTop: 7, fontWeight: 600 }}>
                <span>Rp 0</span>
                <span>Target: Rp 16.000 flagfall</span>
              </div>
              <p style={{ fontSize: 11.7, color: '#7c8495', marginTop: 10, lineHeight: 1.55 }}>
                Rata-rata selisih per order: <strong>{laporan.length > 0 ? fmtRp(Math.round(totalSelisih / laporan.length)) : 'Rp 0'}</strong>. 
                Laporan dari {kotaSorted.length} kota/kab di Kalimantan Selatan.
              </p>
            </>
          )}

          {/* ── Peta Panas + Progress ────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

            {/* Peta Panas */}
            {card(
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontSize: 13.8, fontWeight: 700 }}>Peta Panas Kalsel</div>
                  <button onClick={fetchAll} style={{
                    fontSize: 12.2, color: '#667085', fontWeight: 600,
                    background: 'none', border: 'none', cursor: 'pointer'
                  }}>Refresh</button>
                </div>
                <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr>
                        {['Kota','Laporan','Trend'].map((h, i) => (
                          <th key={h} style={{
                            fontSize: 11, color: '#6b7280', textAlign: i === 2 ? 'right' : 'left',
                            padding: '7px 10px 8px', fontWeight: 700, borderBottom: '1px solid #e5e7eb'
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {kotaSorted.map(([kota, count], i) => (
                        <tr key={kota} style={{ borderBottom: '1px solid #f1f2f5' }}>
                          <td style={{ padding: '9px 10px', fontWeight: 600 }}>
                            {i === 0 && <span style={{ marginRight: 4 }}>🔥</span>}
                            {kota}
                          </td>
                          <td style={{ padding: '9px 10px' }}>{count}</td>
                          <td style={{ padding: '9px 10px', textAlign: 'right' }}>
                            <span style={{
                              fontSize: 11.4, fontWeight: 700, padding: '3px 8px',
                              borderRadius: 999, display: 'inline-block',
                              background: i === 0 ? '#fef2f2' : '#f3f4f6',
                              color: i === 0 ? '#dc2626' : '#6b7280'
                            }}>
                              {i === 0 ? '🔺 Panas' : 'Stabil'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {kotaSorted.length === 0 && (
                        <tr><td colSpan={3} style={{ padding: '16px 10px', color: '#9ca3af', fontSize: 12 }}>📭 Belum ada data</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Progress Organisasi */}
            {card(
              <>
                <div style={{ fontSize: 13.8, fontWeight: 700, marginBottom: 14 }}>Progress Organisasi</div>
                {[
                  { label: 'Laporan Q3', value: Math.min(laporan.length * 2, 100), color: '#16a34a' },
                  { label: 'Project DMIP', value: projects.find(p => p.nama.toLowerCase().includes('dmip'))?.progress || 0, color: '#dc2626' },
                  { label: 'Project Aktif', value: projects.length > 0 ? Math.round((projects.filter(p => p.status === 'aktif').length / projects.length) * 100) : 0, color: '#d97706' },
                ].map((o, i) => (
                  <div key={i} style={{ marginBottom: i < 2 ? 14 : 2 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7, fontSize: 12.8 }}>
                      <strong style={{ fontWeight: 700 }}>{o.label}</strong>
                      <span style={{ color: '#6b7280', fontWeight: 600 }}>{o.value}%</span>
                    </div>
                    <ProgressBar value={o.value} color={o.color} />
                  </div>
                ))}
              </>
            )}
          </div>

          {/* ── Ideas terbaru ────────────────────────────────────────── */}
          {ideas.length > 0 && card(
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: 13.8, fontWeight: 700 }}>💡 Ide & Gagasan Terbaru</div>
                <a href="/admin/dashboard" style={{ fontSize: 12.2, color: '#667085', fontWeight: 600, textDecoration: 'none' }}>Kelola →</a>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {ideas.slice(0, 4).map(idea => (
                  <div key={idea.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: '1px solid #f1f2f5' }}>
                    <div style={{
                      flexShrink: 0, width: 32, height: 32, borderRadius: 9,
                      background: '#fff7ed', color: '#f97316',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 15
                    }}>💡</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#171a1f' }}>{idea.judul}</div>
                      <div style={{ fontSize: 12, color: '#667085', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {idea.konten}
                      </div>
                    </div>
                    <span style={{
                      flexShrink: 0, fontSize: 10, fontWeight: 700,
                      background: '#f3f4f6', color: '#6b7280',
                      padding: '2px 7px', borderRadius: 999
                    }}>{idea.kategori}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── Reminder ─────────────────────────────────────────────── */}
          {reminders.length > 0 && card(
            <>
              <div style={{ fontSize: 13.8, fontWeight: 700, marginBottom: 12 }}>🔔 Reminder Aktif</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {reminders.map(r => (
                  <div key={r.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: '1px solid #f1f2f5' }}>
                    <div style={{
                      flexShrink: 0,
                      minWidth: 48, textAlign: 'center',
                      background: '#f6f6f8', border: '1px solid #e7e8ec',
                      borderRadius: 10, padding: '5px 6px'
                    }}>
                      <b style={{ display: 'block', fontSize: 15, lineHeight: 1.1, letterSpacing: '-.02em' }}>
                        {r.deadline ? new Date(r.deadline).getDate() : '—'}
                      </b>
                      <span style={{ display: 'block', fontSize: 10.6, color: '#6b7280', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '.02em' }}>
                        {r.deadline ? new Date(r.deadline).toLocaleDateString('id-ID', { month: 'short' }) : ''}
                      </span>
                    </div>
                    <div>
                      <strong style={{ display: 'block', fontSize: 13.2, fontWeight: 700 }}>{r.judul}</strong>
                      {r.deskripsi && <span style={{ display: 'block', fontSize: 12.3, color: '#667085', marginTop: 1 }}>{r.deskripsi}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── Catatan Cepat ────────────────────────────────────────── */}
          {card(
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontSize: 13.8, fontWeight: 700 }}>Catatan Cepat</div>
                {noteSaved && (
                  <span style={{ fontSize: 11.6, color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
                    Tersimpan
                  </span>
                )}
              </div>
              <textarea
                value={note}
                onChange={e => handleNote(e.target.value)}
                placeholder="Tulis catatan briefing pagi, titik rawan, follow-up, atau ide yang muncul saat narik… Tersimpan otomatis."
                rows={4}
                style={{
                  width: '100%', background: '#f9f9fb',
                  border: '1px solid #dde1e6', borderRadius: 12,
                  padding: '12px 13px', fontSize: 13.3, resize: 'vertical',
                  minHeight: 80, color: '#23262d', outline: 'none',
                  lineHeight: 1.55, transition: 'border-color .15s'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11.6, color: '#7d8596' }}>
                <span>Tersimpan di perangkat ini</span>
                <span>{note.length} karakter</span>
              </div>
            </>
          )}

          {/* ── Aksi Cepat ───────────────────────────────────────────── */}
          {card(
            <>
              <div style={{ fontSize: 13.8, fontWeight: 700, marginBottom: 11 }}>Aksi Cepat</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
                {[
                  { label: '🚨 Lapor Tarif', primary: true, action: () => window.open('https://lapor.dokb.or.id', '_blank') },
                  { label: '📤 Export CSV',  primary: false, action: exportCSV },
                  { label: '⚙️ Admin Panel', primary: false, action: () => window.open('/admin', '_self') },
                  { label: '📢 Broadcast',   primary: false, action: () => showToast('Fitur Broadcast segera hadir!') },
                ].map((btn, i) => (
                  <button key={i} onClick={btn.action} style={{
                    border: btn.primary ? '1px solid #efc6c6' : '1px solid #d9dde3',
                    background: btn.primary ? '#fff7f7' : '#fff',
                    borderRadius: 12, padding: '11px 10px',
                    fontSize: 12.9, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: 8, transition: 'all .14s',
                    color: btn.primary ? '#b91c1c' : '#2d3139',
                    cursor: 'pointer'
                  }}>
                    {btn.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Footer */}
          <div style={{ textAlign: 'center', color: '#9aa0ad', fontSize: 11.5, marginTop: 4 }}>
            DOKB — Perkumpulan Driver Online Kalimantan Selatan Bersatu · dashboard.dokb.or.id
          </div>

        </div>
      </div>

      {/* ── Bottom Nav (mobile) ──────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', left: 0, right: 0, bottom: 0,
        background: 'rgba(255,255,255,.97)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid #e3e5e9',
        zIndex: 40
      }}>
        <div style={{
          maxWidth: 440, margin: '0 auto',
          display: 'flex', justifyContent: 'space-around', alignItems: 'center',
          padding: '7px 8px 20px'
        }}>
          {[
            { id: 'beranda',     icon: '🏠', label: 'Beranda' },
            { id: 'laporan',     icon: '🚨', label: 'Laporan' },
            { id: 'organisasi',  icon: '🏢', label: 'Organisasi' },
            { id: 'profil',      icon: '👤', label: 'Profil' },
            { id: 'chat', icon: '🤖', label: 'Claudia' },
          ].map(nav => (
            <button key={nav.id}
              onClick={() => {
  setActiveNav(nav.id)
  if (nav.id === 'chat') window.location.href = '/chat'
  else if (nav.id !== 'beranda') showToast(`${nav.label} — segera hadir`)
  else window.scrollTo({ top: 0, behavior: 'smooth' })
}}
              style={{
                flex: 1, textAlign: 'center', padding: '6px 4px',
                borderRadius: 10, background: 'none', border: 'none',
                fontSize: 10.7, color: activeNav === nav.id ? '#dc2626' : '#6f7685',
                fontWeight: 700, display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 3, cursor: 'pointer'
              }}
            >
              <span style={{ fontSize: 21 }}>{nav.icon}</span>
              {nav.label}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Toast ────────────────────────────────────────────────────────── */}
      {toast && (
        <div style={{
          position: 'fixed', right: 16, bottom: 82, zIndex: 99,
          background: '#181b22', color: '#fff',
          fontSize: 12.7, fontWeight: 600,
          padding: '10px 14px', borderRadius: 12,
          boxShadow: '0 10px 30px rgba(0,0,0,.18)',
          animation: 'toastIn .18s ease'
        }}>
          {toast}
        </div>
      )}
    </>
  )
                      }
                    
