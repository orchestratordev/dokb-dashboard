'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import {
  ShieldCheck,
  Lightbulb,
  Rocket,
  Bell,
  ArrowRight,
  ArrowSquareOut,
  ChartBar,
  MapPin,
  Clock,
  Export,
  ChatTeardropText,
  Megaphone
} from '@phosphor-icons/react'

type Idea = {
  id: string
  judul: string
  konten: string
  kategori: string
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

type Reminder = {
  id: string
  judul: string
  deskripsi: string
  deadline: string
  is_done: boolean
}

type Laporan = {
  id: string
  platform: string
  jarak: number
  tarif_diterima: number
  tarif_seharusnya: number
  selisih: number
  lokasi: string
  created_at: string
  status: string
}

const PLATFORM_COLOR: Record<string, { bg: string; text: string; code: string }> = {
  Grab: { bg: '#e8f7ee', text: '#00b14f', code: 'GR' },
  Gojek: { bg: '#fff0e8', text: '#e05a00', code: 'GJ' },
  Maxim: { bg: '#fff3e8', text: '#ff6b00', code: 'MX' },
  InDrive: { bg: '#e8f4ff', text: '#0066cc', code: 'ID' },
}

function fmtRp(n: number) {
  return 'Rp ' + n.toLocaleString('id-ID')
}

function getGreeting() {
  const hour = new Date().toLocaleString('id-ID', {
    hour: 'numeric',
    hour12: false,
    timeZone: 'Asia/Makassar'
  })
  const h = Number(hour)
  if (h >= 4 && h < 11) return 'Selamat pagi, Komandan 👋'
  if (h >= 11 && h < 15) return 'Selamat siang, Komandan 👋'
  if (h >= 15 && h < 19) return 'Selamat sore, Komandan 👋'
  return 'Selamat malam, Komandan 👋'
}

export default function Home() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [laporan, setLaporan] = useState<Laporan[]>([])
  const [loading, setLoading] = useState(true)
  const [activeNav, setActiveNav] = useState('Beranda')
  const [filterPlatform, setFilterPlatform] = useState('all')
  const [quickNote, setQuickNote] = useState('')
  const [noteSaved, setNoteSaved] = useState(false)
  const [toast, setToast] = useState('')
  const [activeTab, setActiveTab] = useState('laporan')

  const NOTE_KEY = 'dokb_morning_note_v1'

  useEffect(() => {
    fetchAll()
    setQuickNote(localStorage.getItem(NOTE_KEY) || '')
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    const [ideasRes, projectsRes, remindersRes, laporanRes] = await Promise.all([
      supabase.from('ideas').select('*').eq('is_public', true).order('created_at', { ascending: false }).limit(5),
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('reminders').select('*').eq('is_done', false).order('deadline', { ascending: true }).limit(3),
      supabase.from('laporan').select('*').order('created_at', { ascending: false }).limit(20),
    ])
    if (ideasRes.data) setIdeas(ideasRes.data)
    if (projectsRes.data) setProjects(projectsRes.data)
    if (remindersRes.data) setReminders(remindersRes.data)
    if (laporanRes.data) setLaporan(laporanRes.data)
    setLoading(false)
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2100)
  }

  const handleNote = (val: string) => {
    setQuickNote(val)
    setNoteSaved(false)
    setTimeout(() => {
      localStorage.setItem(NOTE_KEY, val)
      setNoteSaved(true)
      setTimeout(() => setNoteSaved(false), 1600)
    }, 550)
  }

  const exportCSV = () => {
    const rows = [
      ['tanggal', 'platform', 'km', 'diterima', 'seharusnya', 'selisih', 'lokasi', 'status'],
      ...laporan.map(r => [
        new Date(r.created_at).toLocaleDateString('id-ID'),
        r.platform, r.jarak, r.tarif_diterima, r.tarif_seharusnya,
        r.selisih, r.lokasi, r.status
      ])
    ]
    const csv = rows.map(x => x.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dokb-laporan-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    showToast('CSV rekap diunduh ✅')
  }

  // Stats
  const totalLaporan = laporan.length
  const laporanHariIni = laporan.filter(l =>
    new Date(l.created_at).toDateString() === new Date().toDateString()
  ).length
  const kotaMap: Record<string, number> = {}
  laporan.forEach(l => {
    kotaMap[l.lokasi] = (kotaMap[l.lokasi] || 0) + 1
  })
  const kotaSorted = Object.entries(kotaMap).sort((a, b) => b[1] - a[1])
  const hotKota = kotaSorted[0]?.[0] || '-'

  const filteredLaporan = filterPlatform === 'all'
    ? laporan.slice(0, 5)
    : laporan.filter(l => l.platform === filterPlatform).slice(0, 5)

  // Chart data (laporan per 7 hari terakhir)
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dayStr = d.toDateString()
    const count = laporan.filter(l => new Date(l.created_at).toDateString() === dayStr).length
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
    return { label: days[d.getDay()], count, isToday: i === 6 }
  })
  const maxChart = Math.max(...chartData.map(c => c.count), 1)

  return (
    <div style={{ maxWidth: 420, margin: '0 auto', minHeight: '100vh', background: '#fdf8f4', paddingBottom: 98, fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", position: 'relative' }}>

      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(160deg, #b91c1c 0%, #d72824 46%, #f97316 100%)',
        color: '#fff',
        borderRadius: '0 0 30px 30px',
        padding: '22px 20px 28px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative circle */}
        <div style={{
          position: 'absolute', right: -40, top: -30,
          width: 180, height: 180,
          background: 'radial-gradient(circle, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0) 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Logo */}
            <div style={{
              width: 44, height: 44,
              background: 'rgba(255,255,255,0.14)',
              border: '1px solid rgba(255,255,255,0.28)',
              borderRadius: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(6px)'
            }}>
              <ShieldCheck size={24} color="white" weight="fill" />
            </div>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 600, opacity: 0.92, marginBottom: 2 }}>
                DOKB Command Center
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.015em' }}>
                {getGreeting()}
              </div>
            </div>
          </div>
          <a href="/admin" style={{
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.24)',
            borderRadius: 12, padding: '6px 12px',
            fontSize: 12, fontWeight: 700, color: '#fff',
            display: 'flex', alignItems: 'center', gap: 4
          }}>
            Admin <ArrowSquareOut size={13} weight="bold" />
          </a>
        </div>

        {/* Meta info */}
        <div style={{ fontSize: 13, opacity: 0.95, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          <span style={{ opacity: 0.7 }}>·</span>
          <span>Kalsel</span>
        </div>

        {/* Quick chips */}
        <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.16)',
            border: '1px solid rgba(255,255,255,0.24)',
            borderRadius: 999, padding: '5px 12px',
            fontSize: 12.5, fontWeight: 700
          }}>
            🚨 {laporanHariIni} laporan hari ini
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.16)',
            border: '1px solid rgba(255,255,255,0.24)',
            borderRadius: 999, padding: '5px 12px',
            fontSize: 12.5, fontWeight: 700
          }}>
            📍 {hotKota} paling banyak
          </div>
        </div>
      </div>

      {/* Page Body */}
      <div style={{ padding: '18px 16px 24px' }}>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 22 }}>
          {[
            { icon: '🚨', value: totalLaporan, label: 'Total Laporan', trend: `+${laporanHariIni} hari ini`, up: laporanHariIni > 0 },
            { icon: '🏙️', value: kotaSorted[0]?.[1] || 0, label: hotKota || 'Kota Panas', trend: 'laporan terbanyak', up: true },
            { icon: '💡', value: ideas.length, label: 'Ide & Gagasan', trend: 'total ide', up: true },
            { icon: '🚀', value: projects.filter(p => p.status === 'aktif').length, label: 'Project Aktif', trend: `${projects.length} total`, up: true },
          ].map((s, i) => (
            <div key={i} style={{
              background: '#fff',
              borderRadius: 20,
              padding: '16px 15px',
              boxShadow: '0 8px 30px rgba(185,28,28,0.055), 0 2px 10px rgba(30,20,10,0.045)',
              border: '1px solid #f0e6dc',
              minHeight: 108
            }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{s.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2, fontWeight: 600 }}>{s.label}</div>
              <div style={{ fontSize: 11.5, fontWeight: 700, marginTop: 4, color: s.up ? '#16a34a' : '#dc2626' }}>
                {s.trend}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 14.8, fontWeight: 800, marginBottom: 12, letterSpacing: '-0.01em' }}>
            Aksi Cepat
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[
              { icon: '🚨', label: 'Lapor Tarif', action: () => window.open('https://lapor.dokb.or.id', '_blank') },
              { icon: '📤', label: 'Export CSV', action: exportCSV },
              { icon: '📢', label: 'Broadcast', action: () => showToast('Fitur Broadcast segera hadir!') },
            ].map((btn, i) => (
              <button key={i}
                onClick={btn.action}
                style={{
                  background: '#fff',
                  border: '1px solid #f0e6dc',
                  borderRadius: 16,
                  padding: '14px 8px',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 6,
                  boxShadow: '0 4px 12px rgba(185,28,28,0.06)',
                  cursor: 'pointer', transition: 'all 0.15s'
                }}
              >
                <span style={{ fontSize: 26 }}>{btn.icon}</span>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: '#374151' }}>{btn.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Laporan Chart */}
        <div style={{
          background: '#fff',
          borderRadius: 22,
          padding: '18px 17px',
          marginBottom: 18,
          boxShadow: '0 8px 30px rgba(185,28,28,0.055), 0 2px 10px rgba(30,20,10,0.045)',
          border: '1px solid #f0e6dc'
        }}>
          <div style={{ fontSize: 14.8, fontWeight: 800, marginBottom: 4 }}>
            📊 Laporan 7 Hari Terakhir
          </div>
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 16 }}>
            Total {totalLaporan} laporan masuk
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80 }}>
            {chartData.map((c, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: c.isToday ? '#b91c1c' : '#9ca3af' }}>
                  {c.count > 0 ? c.count : ''}
                </div>
                <div style={{
                  width: '100%',
                  height: `${(c.count / maxChart) * 60 + 4}px`,
                  background: c.isToday
                    ? 'linear-gradient(180deg, #dc2626, #f97316)'
                    : '#f0e6dc',
                  borderRadius: 6,
                  transition: 'height 0.6s ease',
                  minHeight: 4
                }} />
                <div style={{ fontSize: 10, fontWeight: 700, color: c.isToday ? '#b91c1c' : '#9ca3af' }}>
                  {c.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs: Laporan / Ideas / Projects */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
          {[
            { id: 'laporan', label: '🚨 Laporan' },
            { id: 'ideas', label: '💡 Ide' },
            { id: 'projects', label: '🚀 Project' },
            { id: 'kota', label: '📍 Kota' },
          ].map(tab => (
            <button key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '7px 16px',
                borderRadius: 999,
                border: 'none',
                fontSize: 13,
                fontWeight: 700,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                background: activeTab === tab.id
                  ? 'linear-gradient(135deg, #b91c1c, #f97316)'
                  : '#fff',
                color: activeTab === tab.id ? '#fff' : '#6b7280',
                boxShadow: activeTab === tab.id
                  ? '0 4px 12px rgba(185,28,28,0.35)'
                  : '0 2px 6px rgba(0,0,0,0.06)'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content: Laporan */}
        {activeTab === 'laporan' && (
          <div style={{
            background: '#fff',
            borderRadius: 22,
            padding: '18px 17px',
            marginBottom: 18,
            boxShadow: '0 8px 30px rgba(185,28,28,0.055)',
            border: '1px solid #f0e6dc'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 14.8, fontWeight: 800 }}>Laporan Tarif Terbaru</span>
              <a href="https://lapor.dokb.or.id/admin" target="_blank" style={{
                fontSize: 12, fontWeight: 700, color: '#b91c1c',
                display: 'flex', alignItems: 'center', gap: 3
              }}>
                Lihat semua <ArrowSquareOut size={12} />
              </a>
            </div>

            {/* Platform filter pills */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto' }}>
              {['all', 'Grab', 'Gojek', 'Maxim', 'InDrive'].map(f => (
                <button key={f}
                  onClick={() => setFilterPlatform(f)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 999,
                    border: 'none',
                    fontSize: 12,
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    background: filterPlatform === f ? '#b91c1c' : '#f5ede6',
                    color: filterPlatform === f ? '#fff' : '#6b7280'
                  }}
                >
                  {f === 'all' ? 'Semua' : f}
                </button>
              ))}
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', color: '#9a8a7c', padding: '16px 0', fontSize: 13 }}>⏳ Memuat...</div>
            ) : filteredLaporan.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#9a8a7c', padding: '16px 0', fontSize: 13 }}>📭 Belum ada laporan</div>
            ) : filteredLaporan.map(r => {
              const pc = PLATFORM_COLOR[r.platform] || { bg: '#f5f5f5', text: '#666', code: '??' }
              return (
                <div key={r.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 0',
                  borderBottom: '1px solid #f5ede6'
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: pc.bg, color: pc.text,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 800, flexShrink: 0
                  }}>
                    {pc.code}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1c20' }}>
                      {r.jarak} km
                      <span style={{
                        marginLeft: 6, fontSize: 11, fontWeight: 700,
                        background: pc.bg, color: pc.text,
                        padding: '2px 7px', borderRadius: 999
                      }}>
                        {r.platform}
                      </span>
                    </div>
                    <div style={{ fontSize: 11.5, color: '#9a8a7c', marginTop: 2 }}>
                      {fmtRp(r.tarif_diterima)} / {fmtRp(r.tarif_seharusnya)} · {r.lokasi}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#dc2626' }}>
                      -{fmtRp(r.selisih)}
                    </div>
                    <div style={{ fontSize: 11, color: '#b97a74', fontWeight: 700, marginTop: 1 }}>
                      {new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Tab Content: Ideas */}
        {activeTab === 'ideas' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 18 }}>
            {loading ? (
              <div style={{ textAlign: 'center', color: '#9a8a7c', padding: '16px 0', fontSize: 13 }}>⏳ Memuat...</div>
            ) : ideas.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#9a8a7c', padding: '16px 0', fontSize: 13 }}>📭 Belum ada ide</div>
            ) : ideas.map(idea => (
              <div key={idea.id} style={{
                background: '#fff',
                borderRadius: 18,
                padding: '14px 16px',
                boxShadow: '0 4px 12px rgba(185,28,28,0.06)',
                border: '1px solid #f0e6dc'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1c20', flex: 1, paddingRight: 8 }}>
                    {idea.judul}
                  </span>
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    background: '#fff1e9', color: '#f97316',
                    padding: '2px 8px', borderRadius: 999, whiteSpace: 'nowrap'
                  }}>
                    {idea.kategori}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>{idea.konten}</p>
                <div style={{ fontSize: 10.5, color: '#b0a090', marginTop: 6 }}>
                  {new Date(idea.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab Content: Projects */}
        {activeTab === 'projects' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 18 }}>
            {loading ? (
              <div style={{ textAlign: 'center', color: '#9a8a7c', padding: '16px 0', fontSize: 13 }}>⏳ Memuat...</div>
            ) : projects.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#9a8a7c', padding: '16px 0', fontSize: 13 }}>📭 Belum ada project</div>
            ) : projects.map(p => (
              <div key={p.id} style={{
                background: '#fff',
                borderRadius: 18,
                padding: '14px 16px',
                boxShadow: '0 4px 12px rgba(185,28,28,0.06)',
                border: '1px solid #f0e6dc'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1c20' }}>{p.nama}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#b91c1c' }}>{p.progress}%</span>
                </div>
                {p.deskripsi && (
                  <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>{p.deskripsi}</p>
                )}
                <div style={{ height: 6, background: '#f0e6dc', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${p.progress}%`,
                    background: 'linear-gradient(90deg, #b91c1c, #f97316)',
                    borderRadius: 999,
                    transition: 'width 0.6s ease'
                  }} />
                </div>
                {p.target_date && (
                  <div style={{ fontSize: 11, color: '#9a8a7c', marginTop: 6 }}>
                    🎯 Target: {new Date(p.target_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tab Content: Kota */}
        {activeTab === 'kota' && (
          <div style={{
            background: '#fff',
            borderRadius: 22,
            padding: '18px 17px',
            marginBottom: 18,
            boxShadow: '0 8px 30px rgba(185,28,28,0.055)',
            border: '1px solid #f0e6dc'
          }}>
            <div style={{ fontSize: 14.8, fontWeight: 800, marginBottom: 14 }}>
              📍 Sebaran Laporan per Kota
            </div>
            {kotaSorted.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#9a8a7c', padding: '16px 0', fontSize: 13 }}>📭 Belum ada data</div>
            ) : kotaSorted.map(([kota, count], i) => (
              <div key={kota} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '9px 0',
                borderBottom: i < kotaSorted.length - 1 ? '1px solid #f5ede6' : 'none'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: i === 0 ? '#dc2626' : '#e5d5c5'
                  }} />
                  <span style={{ fontSize: 13, fontWeight: i === 0 ? 700 : 600, color: i === 0 ? '#b91c1c' : '#374151' }}>
                    {kota}
                  </span>
                  {i === 0 && (
                    <span style={{
                      fontSize: 10, fontWeight: 700,
                      background: '#fef2f2', color: '#dc2626',
                      padding: '1px 6px', borderRadius: 999
                    }}>🔥 Panas</span>
                  )}
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>{count}</span>
              </div>
            ))}
          </div>
        )}

        {/* Reminders */}
        {reminders.length > 0 && (
          <div style={{
            background: '#fff',
            borderRadius: 22,
            padding: '18px 17px',
            marginBottom: 18,
            boxShadow: '0 8px 30px rgba(185,28,28,0.055)',
            border: '1px solid #f0e6dc'
          }}>
            <div style={{ fontSize: 14.8, fontWeight: 800, marginBottom: 12 }}>
              🔔 Reminder Aktif
            </div>
            {reminders.map(r => (
              <div key={r.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '8px 0',
                borderBottom: '1px solid #f5ede6'
              }}>
                <span style={{ fontSize: 18, marginTop: 1 }}>⏰</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1c20' }}>{r.judul}</div>
                  {r.deadline && (
                    <div style={{ fontSize: 11.5, color: '#dc2626', fontWeight: 700, marginTop: 2 }}>
                      {new Date(r.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Notes */}
        <div style={{
          background: '#fff',
          borderRadius: 22,
          padding: '18px 17px',
          marginBottom: 18,
          boxShadow: '0 8px 30px rgba(185,28,28,0.055)',
          border: '1px solid #f0e6dc'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 14.8, fontWeight: 800 }}>📝 Catatan Cepat</span>
            {noteSaved && (
              <span style={{ fontSize: 11.5, fontWeight: 700, color: '#16a34a' }}>✓ Tersimpan</span>
            )}
          </div>
          <textarea
            value={quickNote}
            onChange={e => handleNote(e.target.value)}
            placeholder="Tulis ide, catatan, atau pengingat di sini... Tersimpan otomatis."
            rows={4}
            style={{
              width: '100%',
              background: '#fdf8f4',
              border: '1px solid #f0e6dc',
              borderRadius: 14,
              padding: '12px 14px',
              fontSize: 13,
              fontFamily: 'inherit',
              resize: 'none',
              outline: 'none',
              color: '#1a1c20',
              lineHeight: 1.6
            }}
          />
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', fontSize: 11.5, color: '#b0a090', fontWeight: 600, paddingTop: 4 }}>
          DOKB — Perkumpulan Driver Online Kalimantan Selatan Bersatu
        </div>

      </div>

      {/* Bottom Navigation */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 420,
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid #f0e6dc',
        display: 'flex', justifyContent: 'space-around',
        padding: '8px 0 20px',
        zIndex: 100
      }}>
        {[
          { id: 'Beranda', icon: '🏠', label: 'Beranda' },
          { id: 'Laporan', icon: '🚨', label: 'Laporan' },
          { id: 'Organisasi', icon: '🏢', label: 'Organisasi' },
          { id: 'Profil', icon: '👤', label: 'Profil' },
        ].map(nav => (
          <button key={nav.id}
            onClick={() => {
              setActiveNav(nav.id)
              if (nav.id !== 'Beranda') showToast(`${nav.id} — segera hadir`)
              else window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              background: 'none', border: 'none', cursor: 'pointer', padding: '6px 16px',
              color: activeNav === nav.id ? '#b91c1c' : '#9a8a7c'
            }}
          >
            <span style={{ fontSize: 22 }}>{nav.icon}</span>
            <span style={{ fontSize: 10.5, fontWeight: 700 }}>{nav.label}</span>
          </button>
        ))}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
          background: '#1a1c20', color: '#fff',
          padding: '10px 20px', borderRadius: 999,
          fontSize: 13, fontWeight: 700,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          zIndex: 200, whiteSpace: 'nowrap'
        }}>
          {toast}
        </div>
      )}

    </div>
  )
}
