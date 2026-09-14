'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, MagnifyingGlass, Warning, CheckCircle,
  User, Car, Buildings, Images, PaperPlaneTilt
} from '@phosphor-icons/react'

async function kompresGambar(file: File, maxWidth = 1600, quality = 0.72): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image()
    const reader = new FileReader()
    reader.onload = (e) => {
      img.src = e.target?.result as string
    }
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width)
      const canvas = document.createElement('canvas')
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' }))
          } else {
            resolve(file)
          }
        },
        'image/jpeg',
        quality
      )
    }
    reader.readAsDataURL(file)
  })
                             }

const PLATFORM = ['Grab', 'Gojek', 'Maxim', 'InDrive']
const KOTA = [
  'Banjarmasin', 'Banjarbaru', 'Martapura', 'Pelaihari',
  'Kandangan', 'Barabai', 'Tanjung', 'Kotabaru', 'Batulicin', 'Lainnya'
]

type DokumenKey = 'ktp' | 'sim' | 'stnk' | 'skpd' | 'kendaraan_depan' | 'kendaraan_belakang' | 'kendaraan_samping' | 'buku_servis'

const DOKUMEN_LIST: { key: DokumenKey; label: string; urlField: string }[] = [
  { key: 'ktp', label: 'Foto KTP', urlField: 'dok_ktp' },
  { key: 'sim', label: 'Foto SIM', urlField: 'dok_sim' },
  { key: 'stnk', label: 'Foto STNK', urlField: 'dok_stnk' },
  { key: 'skpd', label: 'Foto SKPD', urlField: 'dok_skpd' },
  { key: 'kendaraan_depan', label: 'Kendaraan — Depan', urlField: 'dok_kendaraan_depan' },
  { key: 'kendaraan_belakang', label: 'Kendaraan — Belakang', urlField: 'dok_kendaraan_belakang' },
  { key: 'kendaraan_samping', label: 'Kendaraan — Samping', urlField: 'dok_kendaraan_samping' },
  { key: 'buku_servis', label: 'Buku Servis', urlField: 'dok_buku_servis' },
]

export default function CekPengajuan() {
  const router = useRouter()
  const [nik, setNik] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState<any>(null)
  const [dokumenBaru, setDokumenBaru] = useState<Record<string, File | null>>({})
  const [saving, setSaving] = useState(false)
  const [sukses, setSukses] = useState(false)

  const cariPengajuan = async () => {
    if (!/^\d{16}$/.test(nik)) {
      setError('Masukkan NIK 16 digit yang valid.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/pengajuan-kp/cek?nik=${nik}`)
      const result = await res.json()
      if (result.success) {
        setData(result.data)
      } else {
        setError(result.message)
      }
    } catch {
      setError('Gagal mencari data, coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const updateField = (field: string, value: any) => {
    setData((prev: any) => ({ ...prev, [field]: value }))
  }

  const togglePlatform = (p: string) => {
    setData((prev: any) => ({
      ...prev,
      platform: prev.platform.includes(p) ? prev.platform.filter((x: string) => x !== p) : [...prev.platform, p]
    }))
  }

  const handleSimpan = async () => {
    setSaving(true)
    setError('')
    try {
      const dokumenUrls: Record<string, string> = {}
      for (const d of DOKUMEN_LIST) {
        const fileAsli = dokumenBaru[d.key]
        if (!fileAsli) continue
        const file = await kompresGambar(fileAsli)
        const formData = new FormData()
        formData.append('file', file)
        formData.append('jenis', d.key)
        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        const result = await res.json()
        if (result.url) dokumenUrls[d.key] = result.url
      }

      const res = await fetch(`/api/pengajuan-kp/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, dokumen: dokumenUrls })
      })
      const result = await res.json()
      if (result.success) {
        setSukses(true)
      } else {
        setError(result.message)
      }
    } catch {
      setError('Gagal menyimpan perubahan, coba lagi.')
    } finally {
      setSaving(false)
    }
  }

  if (sukses) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#f0fdf4' }}>
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}>
          <CheckCircle size={48} color="#16a34a" weight="fill" className="mx-auto mb-4" />
          <h2 className="text-xl font-extrabold text-gray-800 mb-2">Perubahan Tersimpan</h2>
          <p className="text-gray-500 text-sm mb-6">Data pengajuan Anda sudah diperbarui dan menunggu verifikasi.</p>
          <button onClick={() => router.push('/')}
            className="w-full text-white py-3 rounded-2xl font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#f8f8fa' }}>
      <div className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 60%, #f97316 100%)', paddingBottom: 32 }}
      >
        <div className="relative p-6 pt-8 max-w-md mx-auto">
          <button onClick={() => router.push('/')} className="flex items-center gap-2 text-white/80 mb-4 text-sm font-semibold">
            <ArrowLeft size={16} weight="bold" /> Kembali
          </button>
          <h1 className="text-lg font-extrabold text-white" style={{ fontFamily: 'var(--font-plus-jakarta)' }}>
            Cek & Perbaiki Pengajuan
          </h1>
          <p className="text-red-100 text-xs mt-1">Masukkan NIK untuk menemukan pengajuan Anda</p>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 -mt-4 relative z-10 space-y-4 pb-10">

        {!data && (
          <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
            <p className="text-xs text-gray-400 mb-3">
              Perbaikan hanya dapat dilakukan selama pengajuan berstatus "Menunggu" (belum diverifikasi).
            </p>
            <input type="text" placeholder="Masukkan NIK (16 digit)"
              value={nik} onChange={e => setNik(e.target.value)}
              maxLength={16}
              className="w-full rounded-xl py-3 px-4 text-sm font-medium focus:outline-none mb-3"
              style={{ background: '#f8f8fa', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            />
            <button onClick={cariPengajuan} disabled={loading}
              className="w-full py-3 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #b91c1c, #f97316)' }}
            >
              <MagnifyingGlass size={16} weight="bold" /> {loading ? 'Mencari...' : 'Cari Pengajuan'}
            </button>
          </div>
        )}

        {error && (
          <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: '#fef2f2' }}>
            <Warning size={20} color="#dc2626" weight="fill" />
            <p className="text-red-600 text-sm font-semibold">{error}</p>
          </div>
        )}

        {data && (
          <>
            <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
              <div className="flex items-center gap-2 mb-3">
                <User size={16} weight="fill" color="#dc2626" />
                <p className="text-sm font-bold text-gray-700">Data Pribadi</p>
              </div>
              <div className="space-y-3">
                <input type="text" placeholder="Nama Lengkap" value={data.nama || ''}
                  onChange={e => updateField('nama', e.target.value)}
                  className="w-full rounded-xl py-3 px-4 text-sm font-medium focus:outline-none"
                  style={{ background: '#f8f8fa', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                />
                <textarea placeholder="Alamat" value={data.alamat || ''}
                  onChange={e => updateField('alamat', e.target.value)} rows={2}
                  className="w-full rounded-xl p-3 text-sm font-medium focus:outline-none"
                  style={{ background: '#f8f8fa', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                />
                <select value={data.lokasi || ''} onChange={e => updateField('lokasi', e.target.value)}
                  className="w-full rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none"
                  style={{ background: '#f8f8fa', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                >
                  <option value="">Pilih Kota/Kabupaten</option>
                  {KOTA.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
                <input type="tel" placeholder="No. HP" value={data.no_hp || ''}
                  onChange={e => updateField('no_hp', e.target.value)}
                  className="w-full rounded-xl py-3 px-4 text-sm font-medium focus:outline-none"
                  style={{ background: '#f8f8fa', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Car size={16} weight="fill" color="#dc2626" />
                <p className="text-sm font-bold text-gray-700">Data Kendaraan</p>
              </div>
              <div className="space-y-3">
                <input type="text" placeholder="Merk/Type" value={data.merk_type || ''}
                  onChange={e => updateField('merk_type', e.target.value)}
                  className="w-full rounded-xl py-3 px-4 text-sm font-medium focus:outline-none"
                  style={{ background: '#f8f8fa', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                />
                <input type="text" placeholder="Warna Kendaraan" value={data.warna_kendaraan || ''}
                  onChange={e => updateField('warna_kendaraan', e.target.value)}
                  className="w-full rounded-xl py-3 px-4 text-sm font-medium focus:outline-none"
                  style={{ background: '#f8f8fa', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                />
                <input type="text" placeholder="No. Polisi" value={data.no_pol || ''}
                  onChange={e => updateField('no_pol', e.target.value.toUpperCase())}
                  className="w-full rounded-xl py-3 px-4 text-sm font-medium focus:outline-none uppercase"
                  style={{ background: '#f8f8fa', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                />
                <input type="text" placeholder="No. Rangka" value={data.no_rangka || ''}
                  onChange={e => updateField('no_rangka', e.target.value)}
                  className="w-full rounded-xl py-3 px-4 text-sm font-medium focus:outline-none"
                  style={{ background: '#f8f8fa', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                />
                <input type="text" placeholder="No. Mesin" value={data.no_mesin || ''}
                  onChange={e => updateField('no_mesin', e.target.value)}
                  className="w-full rounded-xl py-3 px-4 text-sm font-medium focus:outline-none"
                  style={{ background: '#f8f8fa', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Buildings size={16} weight="fill" color="#dc2626" />
                <p className="text-sm font-bold text-gray-700">Data Platform</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {PLATFORM.map(p => (
                  <button key={p} onClick={() => togglePlatform(p)}
                    className="py-3 px-4 rounded-xl text-sm font-bold transition-all"
                    style={data.platform?.includes(p) ? {
                      background: 'linear-gradient(135deg, #dc2626, #f97316)', color: 'white'
                    } : { background: '#f8f8fa', color: '#374151' }}
                  >{p}</button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
              <div className="flex items-center gap-2 mb-1">
                <Images size={16} weight="fill" color="#dc2626" />
                <p className="text-sm font-bold text-gray-700">Dokumen</p>
              </div>
              <p className="text-xs text-gray-400 mb-3">Tap foto untuk mengganti — dokumen lama tetap dipakai jika tidak diganti</p>
              <div className="grid grid-cols-2 gap-2">
                {DOKUMEN_LIST.map(d => (
                  <label key={d.key} className="cursor-pointer">
                    <div className="rounded-xl overflow-hidden border border-gray-100 relative">
                      <img
                        src={dokumenBaru[d.key] ? URL.createObjectURL(dokumenBaru[d.key]!) : data[d.urlField]}
                        alt={d.label} className="w-full h-20 object-cover"
                      />
                      {dokumenBaru[d.key] && (
                        <span className="absolute top-1 right-1 bg-green-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">Baru</span>
                      )}
                    </div>
                    <p className="text-[9px] text-gray-400 text-center mt-1 truncate">{d.label}</p>
                    <input type="file" accept="image/*" capture="environment" className="hidden"
                      onChange={e => setDokumenBaru(prev => ({ ...prev, [d.key]: e.target.files?.[0] || null }))}
                    />
                  </label>
                ))}
              </div>
            </div>

            <button onClick={handleSimpan} disabled={saving}
              className="w-full py-4 rounded-2xl font-extrabold text-base text-white flex items-center justify-center gap-2 disabled:opacity-50"
              style={{
                background: saving ? '#9ca3af' : 'linear-gradient(135deg, #b91c1c 0%, #dc2626 50%, #f97316 100%)',
                boxShadow: saving ? 'none' : '0 6px 20px rgba(220,38,38,0.5)'
              }}
            >
              {saving ? '⏳ Menyimpan...' : <><PaperPlaneTilt size={20} weight="fill" /> SIMPAN PERUBAHAN</>}
            </button>
          </>
        )}
      </div>
    </div>
  )
   }
            
