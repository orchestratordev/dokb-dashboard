'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Pengajuan = {
  id: string
  created_at: string
  nama: string
  nik: string
  lokasi: string
  no_pol: string
  jenis_kendaraan: string
  status: 'pending' | 'diverifikasi' | 'ditolak'
}

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Menunggu', color: '#b45309', bg: '#fef3c7' },
  diverifikasi: { label: 'Terverifikasi', color: '#15803d', bg: '#dcfce7' },
  ditolak: { label: 'Ditolak', color: '#b91c1c', bg: '#fee2e2' }
}

export default function AdminDashboard() {
  const [data, setData] = useState<Pengajuan[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'semua' | 'pending' | 'diverifikasi' | 'ditolak'>('semua')
  const router = useRouter()

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/admin')
        return
      }
      await loadData()
    }
    checkAuthAndLoad()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const { data: rows, error } = await supabase
      .from('pengajuan_kp')
      .select('id, created_at, nama, nik, lokasi, no_pol, jenis_kendaraan, status')
      .order('created_at', { ascending: false })

    if (!error && rows) setData(rows as Pengajuan[])
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin')
  }

  const filtered = filter === 'semua' ? data : data.filter(d => d.status === filter)

  const countByStatus = (s: string) => data.filter(d => d.status === s).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-md mx-auto p-4 flex items-center justify-between">
          <div>
            <h1 className="text-base font-extrabold text-gray-800">Panel Admin</h1>
            <p className="text-xs text-gray-400">Kartu Pengawasan ASK</p>
          </div>
          <button onClick={handleLogout}
            className="text-xs font-semibold text-red-600 px-3 py-2 rounded-lg"
            style={{ background: '#fef2f2' }}
          >
            Keluar
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">

        {/* Ringkasan */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-xl p-3 text-center" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <p className="text-lg font-extrabold text-amber-600">{countByStatus('pending')}</p>
            <p className="text-[10px] text-gray-400 font-semibold">Menunggu</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <p className="text-lg font-extrabold text-green-600">{countByStatus('diverifikasi')}</p>
            <p className="text-[10px] text-gray-400 font-semibold">Terverifikasi</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <p className="text-lg font-extrabold text-red-600">{countByStatus('ditolak')}</p>
            <p className="text-[10px] text-gray-400 font-semibold">Ditolak</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(['semua', 'pending', 'diverifikasi', 'ditolak'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all"
              style={filter === f
                ? { background: 'linear-gradient(135deg, #dc2626, #f97316)', color: 'white' }
                : { background: 'white', color: '#6b7280', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }
              }
            >
              {f === 'semua' ? 'Semua' : STATUS_LABEL[f].label}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <p className="text-center text-sm text-gray-400 py-8">Memuat data...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-8">Belum ada pengajuan.</p>
        ) : (
          <div className="space-y-2">
            {filtered.map(item => (
              <button key={item.id}
                onClick={() => router.push(`/admin/dashboard/${item.id}`)}
                className="w-full bg-white rounded-2xl p-4 text-left flex items-center justify-between"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
              >
                <div>
                  <p className="text-sm font-bold text-gray-800">{item.nama}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {item.jenis_kendaraan} • {item.no_pol} • {item.lokasi}
                  </p>
                  <p className="text-[10px] text-gray-300 mt-1">
                    {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0"
                  style={{ color: STATUS_LABEL[item.status].color, background: STATUS_LABEL[item.status].bg }}
                >
                  {STATUS_LABEL[item.status].label}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
            }
    
