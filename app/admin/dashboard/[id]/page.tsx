'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Pengajuan = {
  id: string
  created_at: string
  nama: string
  nik: string
  tempat_lahir: string | null
  tanggal_lahir: string | null
  alamat: string
  lokasi: string
  no_hp: string
  email: string | null
  jenis_kendaraan: string
  merk_type: string
  no_pol: string
  no_rangka: string | null
  no_mesin: string | null
  warna_kendaraan: string | null
  masa_berlaku_stnk: string | null
  masa_berlaku_skpd: string | null
  platform: string[]
  lama_bergabung: string | null
  status_keanggotaan: string | null
  no_kta: string | null
  dok_ktp: string
  dok_sim: string
  dok_stnk: string
  dok_skpd: string
  dok_kendaraan_depan: string
  dok_kendaraan_belakang: string
  dok_kendaraan_samping: string
  dok_buku_servis: string
  status: 'pending' | 'diverifikasi' | 'ditolak'
  pdf_dosier_url: string | null
}

const DOKUMEN_DISPLAY: { key: keyof Pengajuan; label: string }[] = [
  { key: 'dok_ktp', label: 'KTP' },
  { key: 'dok_sim', label: 'SIM' },
  { key: 'dok_stnk', label: 'STNK' },
  { key: 'dok_skpd', label: 'SKPD' },
  { key: 'dok_kendaraan_depan', label: 'Kendaraan — Depan' },
  { key: 'dok_kendaraan_belakang', label: 'Kendaraan — Belakang' },
  { key: 'dok_kendaraan_samping', label: 'Kendaraan — Samping' },
  { key: 'dok_buku_servis', label: 'Buku Servis' },
]

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-50 last:border-0">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-xs font-semibold text-gray-700 text-right max-w-[60%]">{value || '—'}</p>
    </div>
  )
}

export default function DetailPengajuan() {
  const [data, setData] = useState<Pengajuan | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

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
  }, [id])

  const loadData = async () => {
    setLoading(true)
    const { data: row, error } = await supabase
      .from('pengajuan_kp')
      .select('*')
      .eq('id', id)
      .single()

    if (!error && row) setData(row as Pengajuan)
    setLoading(false)
  }

  const updateStatus = async (status: 'diverifikasi' | 'ditolak') => {
    setProcessing(true)
    setMessage('')
    const { error } = await supabase
      .from('pengajuan_kp')
      .update({ status })
      .eq('id', id)

    if (!error) {
      setData(prev => prev ? { ...prev, status } : prev)
      setMessage(status === 'diverifikasi' ? 'Pengajuan telah diverifikasi.' : 'Pengajuan ditolak.')
    } else {
      setMessage('Gagal mengubah status, coba lagi.')
    }
    setProcessing(false)
  }

  const generatePDF = async () => {
    setGenerating(true)
    setMessage('')
    try {
      const res = await fetch(`/api/pengajuan-kp/${id}/generate-pdf`, { method: 'POST' })
      const result = await res.json()
      if (result.success) {
        setData(prev => prev ? { ...prev, pdf_dosier_url: result.url } : prev)
        setMessage('PDF Dosier berhasil dibuat.')
      } else {
        setMessage(result.message || 'Gagal membuat PDF.')
      }
    } catch {
      setMessage('Gagal membuat PDF, coba lagi.')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">Memuat...</div>
  }

  if (!data) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">Data tidak ditemukan.</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-md mx-auto p-4 flex items-center gap-3">
          <button onClick={() => router.push('/admin/dashboard')} className="text-sm text-gray-500 font-semibold">
            ← Kembali
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4 pb-10">

        {/* Header Nama + Status */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-lg font-extrabold text-gray-800">{data.nama}</h1>
            <span className="text-[10px] font-bold px-2 py-1 rounded-full"
              style={{
                color: data.status === 'diverifikasi' ? '#15803d' : data.status === 'ditolak' ? '#b91c1c' : '#b45309',
                background: data.status === 'diverifikasi' ? '#dcfce7' : data.status === 'ditolak' ? '#fee2e2' : '#fef3c7'
              }}
            >
              {data.status === 'diverifikasi' ? 'Terverifikasi' : data.status === 'ditolak' ? 'Ditolak' : 'Menunggu'}
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Diajukan {new Date(data.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Data Pribadi */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <p className="text-sm font-bold text-gray-700 mb-2">Data Pribadi</p>
          <Field label="NIK" value={data.nik} />
          <Field label="Tempat/Tgl Lahir" value={data.tempat_lahir ? `${data.tempat_lahir}, ${data.tanggal_lahir || '—'}` : null} />
          <Field label="Alamat" value={data.alamat} />
          <Field label="Kota/Kabupaten" value={data.lokasi} />
          <Field label="No. HP" value={data.no_hp} />
          <Field label="Email" value={data.email} />
        </div>

        {/* Data Kendaraan */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <p className="text-sm font-bold text-gray-700 mb-2">Data Kendaraan</p>
          <Field label="Jenis" value={data.jenis_kendaraan} />
          <Field label="Merk/Type" value={data.merk_type} />
          <Field label="Warna" value={data.warna_kendaraan} />
          <Field label="No. Polisi" value={data.no_pol} />
          <Field label="No. Rangka" value={data.no_rangka} />
          <Field label="No. Mesin" value={data.no_mesin} />
          <Field label="Masa Berlaku STNK" value={data.masa_berlaku_stnk} />
          <Field label="Masa Berlaku SKPD" value={data.masa_berlaku_skpd} />
        </div>

        {/* Data Platform */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <p className="text-sm font-bold text-gray-700 mb-2">Data Platform</p>
          <Field label="Aplikator" value={data.platform?.join(', ')} />
          <Field label="Lama Bergabung" value={data.lama_bergabung} />
          <Field label="Status Keanggotaan" value={data.status_keanggotaan === 'anggota' ? 'Anggota DOKB' : 'Non-Anggota'} />
          {data.status_keanggotaan === 'anggota' && <Field label="No. KTA" value={data.no_kta} />}
        </div>

        {/* Dokumen */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <p className="text-sm font-bold text-gray-700 mb-3">Dokumen</p>
          <div className="grid grid-cols-2 gap-2">
            {DOKUMEN_DISPLAY.map(d => (
              <a key={d.key} href={data[d.key] as string} target="_blank" rel="noopener noreferrer">
                <div className="rounded-xl overflow-hidden border border-gray-100">
                  <img src={data[d.key] as string} alt={d.label} className="w-full h-24 object-cover" />
                </div>
                <p className="text-[10px] text-gray-400 text-center mt-1">{d.label}</p>
              </a>
            ))}
          </div>
        </div>

        {message && (
          <div className="rounded-2xl p-3 text-center" style={{ background: '#eff6ff' }}>
            <p className="text-xs font-semibold text-blue-700">{message}</p>
          </div>
        )}

        {/* Aksi Verifikasi */}
        {data.status === 'pending' && (
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => updateStatus('ditolak')} disabled={processing}
              className="py-3 rounded-2xl font-bold text-sm text-red-600 disabled:opacity-50"
              style={{ background: '#fef2f2' }}
            >
              Tolak
            </button>
            <button onClick={() => updateStatus('diverifikasi')} disabled={processing}
              className="py-3 rounded-2xl font-bold text-sm text-white disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}
            >
              Verifikasi
            </button>
          </div>
        )}

        {/* Generate PDF — hanya muncul setelah diverifikasi */}
        {data.status === 'diverifikasi' && (
          <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
            <p className="text-sm font-bold text-gray-700 mb-3">PDF Dosier</p>
            {data.pdf_dosier_url ? (
              <a href={data.pdf_dosier_url} target="_blank" rel="noopener noreferrer"
                className="block w-full text-center py-3 rounded-2xl font-bold text-sm text-white"
                style={{ background: 'linear-gradient(135deg, #b91c1c, #f97316)' }}
              >
                Buka / Cetak PDF
              </a>
            ) : (
              <button onClick={generatePDF} disabled={generating}
                className="w-full py-3 rounded-2xl font-bold text-sm text-white disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #b91c1c, #f97316)' }}
              >
                {generating ? '⏳ Membuat PDF...' : 'Generate PDF Dosier'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
    }
        
