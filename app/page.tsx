'use client'

import { useState } from 'react'
import {
  IdentificationCard,
  Car,
  Motorcycle,
  MapPin,
  Phone,
  Images,
  Warning,
  CheckCircle,
  PaperPlaneTilt,
  ArrowLeft,
  ShieldCheck,
  Buildings,
  ArrowRight,
  User,
  BookOpen
} from '@phosphor-icons/react'

// ─── Constants ────────────────────────────────────────────────────────────────
const PLATFORM = ['Grab', 'Gojek', 'Maxim', 'InDrive']
const KOTA = [
  'Banjarmasin', 'Banjarbaru', 'Martapura', 'Pelaihari',
  'Kandangan', 'Barabai', 'Tanjung', 'Kotabaru', 'Batulicin', 'Lainnya'
]
const JENIS_KENDARAAN = ['Mobil', 'Motor']

type DokumenKey = 'ktp' | 'sim' | 'stnk' | 'skpd' | 'kendaraan_depan' | 'kendaraan_belakang' | 'kendaraan_samping' | 'buku_servis'

const DOKUMEN_LIST: { key: DokumenKey; label: string; hint: string }[] = [
  { key: 'ktp', label: 'Foto KTP', hint: 'Pastikan seluruh data terbaca jelas' },
  { key: 'sim', label: 'Foto SIM', hint: 'SIM sesuai jenis kendaraan' },
  { key: 'stnk', label: 'Foto STNK', hint: 'Halaman depan STNK' },
  { key: 'skpd', label: 'Foto SKPD (Pajak Kendaraan)', hint: 'Bukti pajak kendaraan masih berlaku' },
  { key: 'kendaraan_depan', label: 'Foto Kendaraan — Tampak Depan', hint: 'Plat nomor harus terlihat jelas' },
  { key: 'kendaraan_belakang', label: 'Foto Kendaraan — Tampak Belakang', hint: 'Plat nomor harus terlihat jelas' },
  { key: 'kendaraan_samping', label: 'Foto Kendaraan — Tampak Samping', hint: 'Seluruh badan kendaraan terlihat' },
  { key: 'buku_servis', label: 'Foto Cover Buku Servis', hint: 'Halaman depan buku servis unit' },
]

// ─── Splash Screen ────────────────────────────────────────────────────────────
function SplashScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)

  useState(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setFadeOut(true)
          setTimeout(onDone, 500)
          return 100
        }
        return prev + 2
      })
    }, 40)
    return () => clearInterval(interval)
  })

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
      style={{ background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 50%, #f97316 100%)' }}
    >
      <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6"
        style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
      >
        <IdentificationCard size={48} color="white" weight="fill" />
      </div>
      <div className="text-center px-6">
        <h1 className="text-2xl font-extrabold text-white tracking-tight" style={{ fontFamily: 'var(--font-plus-jakarta)' }}>
          KARTU PENGAWASAN
        </h1>
        <p className="text-red-100 text-xs mt-1 font-medium">Angkutan Sewa Khusus — Kalimantan Selatan</p>
      </div>
      <div className="mt-10 w-44">
        <div className="h-1 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all duration-100" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  )
}

// ─── Landing Page ─────────────────────────────────────────────────────────────
function LandingPage({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen" style={{ background: '#f8f8fa' }}>
      <div className="relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 60%, #f97316 100%)',
        paddingBottom: 40
      }}>
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <div className="relative p-6 pt-10 text-center max-w-md mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
            {['Dishub', 'Polda', 'Komdigi', 'YLKI', 'DOKB'].map(name => (
              <div key={name} className="w-10 h-10 rounded-xl flex flex-col items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}
              >
                <Buildings size={14} color="white" weight="fill" />
                <span style={{ fontSize: 6, color: 'rgba(255,255,255,0.8)', marginTop: 1, fontWeight: 700 }}>{name}</span>
              </div>
            ))}
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight" style={{ fontFamily: 'var(--font-plus-jakarta)' }}>
            KARTU PENGAWASAN
          </h1>
          <h2 className="text-sm font-bold text-white mt-0.5">ANGKUTAN SEWA KHUSUS</h2>
          <p className="text-red-100 text-xs mt-2 leading-relaxed">
            Pengajuan Kartu Pengawasan — Kolaborasi DOKB dan Dinas Perhubungan Provinsi Kalimantan Selatan
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 -mt-5 relative z-10">
        <div className="bg-white rounded-2xl p-4 mb-4" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
            >
              <ShieldCheck size={16} color="white" weight="fill" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-700">Terbuka untuk Umum</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                Pengajuan terbuka untuk anggota DOKB maupun driver non-anggota. Persiapan kepatuhan sesuai PM 118 Tahun 2018.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 mb-4" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <p className="text-sm font-bold text-gray-700 mb-2">Dokumen yang perlu disiapkan:</p>
          <div className="grid grid-cols-2 gap-1.5">
            {DOKUMEN_LIST.map(d => (
              <div key={d.key} className="flex items-start gap-1.5">
                <CheckCircle size={12} color="#dc2626" weight="fill" className="flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-gray-500">{d.label}</p>
              </div>
            ))}
          </div>
        </div>

        <button onClick={() => window.location.href = '/panduan-foto'}
          className="w-full py-4 rounded-2xl font-extrabold text-base text-white flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 50%, #f97316 100%)',
            boxShadow: '0 6px 20px rgba(220,38,38,0.5)'
          }}
        >
          Mulai Pengajuan <ArrowRight size={20} weight="bold" />
        </button>
<button onClick={() => window.location.href = '/admin'}
          className="w-full bg-white rounded-2xl p-4 text-left transition-all active:scale-[0.98] border-2 border-transparent mt-3"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gray-700">
              <ShieldCheck size={20} color="white" weight="fill" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-800 text-sm">Tim Pengawas ASK</p>
              <p className="text-xs text-gray-400">Login khusus Dishub, Polda, Komdigi, YLKI, dan DOKB</p>
            </div>
            <ArrowRight size={16} color="#4b5563" weight="bold" />
          </div>
        </button>
        <div className="mt-6 text-center space-y-1">
          <p className="text-xs font-bold text-gray-500">Dikelola oleh:</p>
          <p className="text-xs text-gray-600 font-semibold">Tim Pengawas ASK Provinsi Kalimantan Selatan</p>
          <p className="text-xs text-gray-400">Didukung Sistem Pelaporan oleh:</p>
          <p className="text-xs text-gray-600 font-semibold">DOKB — Perkumpulan Driver Online Kalimantan Selatan Bersatu</p>
        </div>
      </div>
    </div>
  )
}

// ─── Pengajuan Form ─────────────────────────────────────────────────────────
function PengajuanForm({ onBack }: { onBack: () => void }) {
  const [form, setForm] = useState({
    nama: '',
    nik: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    alamat: '',
    lokasi: '',
    no_hp: '',
    email: '',
    jenis_kendaraan: '',
    merk_type: '',
    no_pol: '',
    no_rangka: '',
    no_mesin: '',
    warna_kendaraan: '',
    masa_berlaku_stnk: '',
    masa_berlaku_skpd: '',
    platform: [] as string[],
    lama_bergabung: '',
    status_keanggotaan: '' as '' | 'anggota' | 'non_anggota',
    no_kta: ''
  })
  const [dokumen, setDokumen] = useState<Record<DokumenKey, File | null>>({
    ktp: null, sim: null, stnk: null, skpd: null,
    kendaraan_depan: null, kendaraan_belakang: null, kendaraan_samping: null,
    buku_servis: null
  })
  const [setuju, setSetuju] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sukses, setSukses] = useState(false)
  const [error, setError] = useState('')

  const togglePlatform = (p: string) => {
    setForm(prev => ({
      ...prev,
      platform: prev.platform.includes(p) ? prev.platform.filter(x => x !== p) : [...prev.platform, p]
    }))
  }

  const handleDokumen = (key: DokumenKey, file: File | null) => {
    setDokumen(prev => ({ ...prev, [key]: file }))
  }

  const dokumenLengkap = DOKUMEN_LIST.every(d => dokumen[d.key] !== null)

  const handleSubmit = async () => {
    if (!form.nama || !form.nik || !form.alamat || !form.lokasi || !form.no_hp) {
      setError('Data pribadi wajib dilengkapi: nama, NIK, alamat, kota, dan nomor HP!')
      return
    }
    if (!form.jenis_kendaraan || !form.merk_type || !form.no_pol) {
      setError('Data kendaraan wajib dilengkapi: jenis, merk/type, dan plat nomor!')
      return
    }
    if (form.platform.length === 0) {
      setError('Pilih minimal satu aplikator yang digunakan!')
      return
    }
    if (!dokumenLengkap) {
      setError('Seluruh dokumen wajib diupload!')
      return
    }
    if (!setuju) {
      setError('Anda harus menyetujui pernyataan penggunaan data terlebih dahulu!')
      return
    }

    setLoading(true)
    setError('')

    try {
      const dokumenUrls: Record<string, string> = {}
      for (const d of DOKUMEN_LIST) {
        const file = dokumen[d.key]
        if (!file) continue
        const formData = new FormData()
        formData.append('file', file)
        formData.append('jenis', d.key)
        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        const result = await res.json()
        if (result.url) dokumenUrls[d.key] = result.url
      }

      const res = await fetch('/api/pengajuan-kp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          dokumen: dokumenUrls
        })
      })

      const result = await res.json()
      if (result.success) setSukses(true)
      else setError(result.message)
    } catch {
      setError('Gagal mengirim pengajuan, coba lagi!')
    } finally {
      setLoading(false)
    }
  }

  if (sukses) return <SuksesPage onBack={onBack} />

  return (
    <div className="min-h-screen" style={{ background: '#f8f8fa' }}>
      <div className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 60%, #f97316 100%)', paddingBottom: 32 }}
      >
        <div className="relative p-6 pt-8 max-w-md mx-auto">
          <button onClick={onBack} className="flex items-center gap-2 text-white/80 mb-4 text-sm font-semibold">
            <ArrowLeft size={16} weight="bold" /> Kembali
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            >
              <IdentificationCard size={20} color="white" weight="fill" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-white" style={{ fontFamily: 'var(--font-plus-jakarta)' }}>
                Pengajuan Kartu Pengawasan
              </h1>
              <p className="text-red-100 text-xs">Lengkapi seluruh data dan dokumen</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 -mt-4 relative z-10 space-y-4">

        {/* ── Data Pribadi ── */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2 mb-3">
            <User size={16} weight="fill" color="#dc2626" />
            <p className="text-sm font-bold text-gray-700">Data Pribadi</p>
          </div>
          <div className="space-y-3">
            <input type="text" placeholder="Nama Lengkap *"
              value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })}
              className="w-full rounded-xl py-3 px-4 text-sm font-medium focus:outline-none"
              style={{ background: '#f8f8fa', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            />
            <input type="text" placeholder="NIK (sesuai KTP) *"
              value={form.nik} onChange={e => setForm({ ...form, nik: e.target.value })}
              maxLength={16}
              className="w-full rounded-xl py-3 px-4 text-sm font-medium focus:outline-none"
              style={{ background: '#f8f8fa', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            />
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Tempat Lahir"
                value={form.tempat_lahir} onChange={e => setForm({ ...form, tempat_lahir: e.target.value })}
                className="w-full rounded-xl py-3 px-4 text-sm font-medium focus:outline-none"
                style={{ background: '#f8f8fa', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              />
              <input type="date"
                value={form.tanggal_lahir} onChange={e => setForm({ ...form, tanggal_lahir: e.target.value })}
                className="w-full rounded-xl py-3 px-4 text-sm font-medium focus:outline-none"
                style={{ background: '#f8f8fa', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              />
            </div>
            <textarea placeholder="Alamat Domisili Lengkap *"
              value={form.alamat} onChange={e => setForm({ ...form, alamat: e.target.value })}
              rows={2}
              className="w-full rounded-xl p-3 text-sm font-medium focus:outline-none"
              style={{ background: '#f8f8fa', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            />
            <div className="relative">
              <MapPin size={16} weight="fill" color="#dc2626" className="absolute left-3 top-3.5" />
              <select value={form.lokasi} onChange={e => setForm({ ...form, lokasi: e.target.value })}
                className="w-full rounded-xl py-3 pl-10 pr-4 text-sm font-semibold focus:outline-none appearance-none"
                style={{ background: '#f8f8fa', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              >
                <option value="">Pilih Kota/Kabupaten *</option>
                {KOTA.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div className="relative">
              <Phone size={16} weight="fill" color="#dc2626" className="absolute left-3 top-3.5" />
              <input type="tel" placeholder="Nomor HP *"
                value={form.no_hp} onChange={e => setForm({ ...form, no_hp: e.target.value })}
                className="w-full rounded-xl py-3 pl-10 pr-4 text-sm font-medium focus:outline-none"
                style={{ background: '#f8f8fa', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              />
            </div>
            <input type="email" placeholder="Email (opsional)"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl py-3 px-4 text-sm font-medium focus:outline-none"
              style={{ background: '#f8f8fa', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            />
          </div>
        </div>

        {/* ── Data Kendaraan ── */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Car size={16} weight="fill" color="#dc2626" />
            <p className="text-sm font-bold text-gray-700">Data Kendaraan</p>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {JENIS_KENDARAAN.map(j => (
                <button key={j} onClick={() => setForm({ ...form, jenis_kendaraan: j })}
                  className="py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                  style={form.jenis_kendaraan === j ? {
                    background: 'linear-gradient(135deg, #dc2626, #f97316)',
                    color: 'white', boxShadow: '0 4px 12px rgba(220,38,38,0.4)'
                  } : { background: '#f8f8fa', color: '#374151' }}
                >
                  {j === 'Mobil' ? <Car size={16} weight="fill" /> : <Motorcycle size={16} weight="fill" />}
                  {j}
                </button>
              ))}
            </div>
            <input type="text" placeholder="Merk / Type Kendaraan *"
              value={form.merk_type} onChange={e => setForm({ ...form, merk_type: e.target.value })}
              className="w-full rounded-xl py-3 px-4 text-sm font-medium focus:outline-none"
              style={{ background: '#f8f8fa', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            />
            <input type="text" placeholder="Warna Kendaraan"
              value={form.warna_kendaraan} onChange={e => setForm({ ...form, warna_kendaraan: e.target.value })}
              className="w-full rounded-xl py-3 px-4 text-sm font-medium focus:outline-none"
              style={{ background: '#f8f8fa', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            />
            <input type="text" placeholder="No. Polisi (Plat Nomor) *"
              value={form.no_pol} onChange={e => setForm({ ...form, no_pol: e.target.value.toUpperCase() })}
              className="w-full rounded-xl py-3 px-4 text-sm font-medium focus:outline-none uppercase"
              style={{ background: '#f8f8fa', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            />
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="No. Rangka"
                value={form.no_rangka} onChange={e => setForm({ ...form, no_rangka: e.target.value })}
                className="w-full rounded-xl py-3 px-4 text-sm font-medium focus:outline-none"
                style={{ background: '#f8f8fa', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              />
              <input type="text" placeholder="No. Mesin"
                value={form.no_mesin} onChange={e => setForm({ ...form, no_mesin: e.target.value })}
                className="w-full rounded-xl py-3 px-4 text-sm font-medium focus:outline-none"
                style={{ background: '#f8f8fa', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Masa Berlaku STNK</label>
                <input type="date"
                  value={form.masa_berlaku_stnk} onChange={e => setForm({ ...form, masa_berlaku_stnk: e.target.value })}
                  className="w-full rounded-xl py-3 px-4 text-sm font-medium focus:outline-none"
                  style={{ background: '#f8f8fa', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Masa Berlaku SKPD</label>
                <input type="date"
                  value={form.masa_berlaku_skpd} onChange={e => setForm({ ...form, masa_berlaku_skpd: e.target.value })}
                  className="w-full rounded-xl py-3 px-4 text-sm font-medium focus:outline-none"
                  style={{ background: '#f8f8fa', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Data Platform ── */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Buildings size={16} weight="fill" color="#dc2626" />
            <p className="text-sm font-bold text-gray-700">Data Platform</p>
          </div>
          <p className="text-xs text-gray-400 mb-2">Aplikator yang digunakan * (bisa pilih lebih dari satu)</p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            {PLATFORM.map(p => (
              <button key={p} onClick={() => togglePlatform(p)}
                className="py-3 px-4 rounded-xl text-sm font-bold transition-all"
                style={form.platform.includes(p) ? {
                  background: 'linear-gradient(135deg, #dc2626, #f97316)',
                  color: 'white', boxShadow: '0 4px 12px rgba(220,38,38,0.4)'
                } : { background: '#f8f8fa', color: '#374151' }}
              >{p}</button>
            ))}
          </div>
          <input type="text" placeholder="Lama bergabung sebagai driver ASK (mis. 2 tahun)"
            value={form.lama_bergabung} onChange={e => setForm({ ...form, lama_bergabung: e.target.value })}
            className="w-full rounded-xl py-3 px-4 text-sm font-medium focus:outline-none mb-3"
            style={{ background: '#f8f8fa', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          />
          <p className="text-xs text-gray-400 mb-2">Status Keanggotaan</p>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setForm({ ...form, status_keanggotaan: 'anggota' })}
              className="py-3 px-4 rounded-xl text-sm font-bold transition-all"
              style={form.status_keanggotaan === 'anggota' ? {
                background: 'linear-gradient(135deg, #dc2626, #f97316)', color: 'white'
              } : { background: '#f8f8fa', color: '#374151' }}
            >Anggota DOKB</button>
            <button onClick={() => setForm({ ...form, status_keanggotaan: 'non_anggota' })}
              className="py-3 px-4 rounded-xl text-sm font-bold transition-all"
              style={form.status_keanggotaan === 'non_anggota' ? {
                background: 'linear-gradient(135deg, #dc2626, #f97316)', color: 'white'
              } : { background: '#f8f8fa', color: '#374151' }}
            >Non-Anggota</button>
          </div>
          {form.status_keanggotaan === 'anggota' && (
            <input type="text" placeholder="No. KTA (jika ada)"
              value={form.no_kta} onChange={e => setForm({ ...form, no_kta: e.target.value })}
              className="w-full rounded-xl py-3 px-4 text-sm font-medium focus:outline-none mt-3"
              style={{ background: '#f8f8fa', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            />
          )}
        </div>

        {/* ── Upload Dokumen ── */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2 mb-1">
            <Images size={16} weight="fill" color="#dc2626" />
            <p className="text-sm font-bold text-gray-700">Dokumen Wajib</p>
          </div>
          <p className="text-xs text-gray-400 mb-3">Seluruh dokumen di bawah ini wajib diupload</p>
          <div className="space-y-3">
            {DOKUMEN_LIST.map(d => (
              <div key={d.key}>
                <label className="flex items-center justify-between border-2 border-dashed rounded-2xl p-3 cursor-pointer"
                  style={{
                    borderColor: dokumen[d.key] ? '#86efac' : '#fca5a5',
                    background: dokumen[d.key] ? '#f0fdf4' : '#fff5f5'
                  }}
                >
                  <div className="flex items-center gap-3">
                    {dokumen[d.key]
                      ? <CheckCircle size={22} color="#22c55e" weight="fill" />
                      : (d.key === 'buku_servis' ? <BookOpen size={22} color="#dc2626" weight="duotone" /> : <Images size={22} color="#dc2626" weight="duotone" />)
                    }
                    <div>
                      <p className="text-xs font-bold text-gray-700">{d.label}</p>
                      <p className="text-[10px] text-gray-400">
                        {dokumen[d.key] ? dokumen[d.key]!.name : d.hint}
                      </p>
                    </div>
                  </div>
                  <input type="file" accept="image/*"
                    onChange={e => handleDokumen(d.key, e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* ── Pernyataan ── */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={setuju} onChange={e => setSetuju(e.target.checked)}
              className="mt-0.5 w-4 h-4 flex-shrink-0"
            />
            <p className="text-xs text-gray-500 leading-relaxed">
              Saya menyetujui penggunaan data dan dokumen yang saya sampaikan melalui formulir ini untuk
              keperluan pendataan, verifikasi, dan pengurusan Kartu Pengawasan Angkutan Sewa Khusus (ASK)
              melalui fasilitasi DOKB sesuai ketentuan yang berlaku.
            </p>
          </label>
        </div>

        {error && (
          <div className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: 'linear-gradient(135deg, #fef2f2, #fff7ed)' }}
          >
            <Warning size={20} color="#dc2626" weight="fill" />
            <p className="text-red-600 text-sm font-semibold">{error}</p>
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading}
          className="w-full py-4 rounded-2xl font-extrabold text-base text-white flex items-center justify-center gap-2 disabled:opacity-50"
          style={{
            background: loading ? '#9ca3af' : 'linear-gradient(135deg, #b91c1c 0%, #dc2626 50%, #f97316 100%)',
            boxShadow: loading ? 'none' : '0 6px 20px rgba(220,38,38,0.5)'
          }}
        >
          {loading ? '⏳ Mengirim...' : <><PaperPlaneTilt size={20} weight="fill" /> KIRIM PENGAJUAN</>}
        </button>

        <p className="text-center text-[10px] text-gray-300 pb-4">
          DOKB — Perkumpulan Driver Online Kalimantan Selatan Bersatu
        </p>
      </div>
    </div>
  )
}

// ─── Sukses Page ────────────────────────────────────────────────────────────
function SuksesPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)' }}
    >
      <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center"
        style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}
      >
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
        >
          <CheckCircle size={40} color="white" weight="fill" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Pengajuan Terkirim!</h2>
        <p className="text-gray-500 text-sm mb-2 leading-relaxed">
          Terima kasih! Pengajuan Kartu Pengawasan Anda telah diterima dan akan diverifikasi oleh
          <strong> Tim Pengawas ASK Provinsi Kalimantan Selatan</strong>.
        </p>
        <p className="text-gray-400 text-xs mb-8">
          Dokumen dan Surat Perjanjian Kerjasama akan diproses setelah data Anda diverifikasi.
        </p>
        <button onClick={onBack}
          className="w-full text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}
        >
          <ArrowLeft size={18} weight="bold" />
          Kembali ke Beranda
        </button>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const [showSplash, setShowSplash] = useState(true)
  const [view, setView] = useState<'landing' | 'form'>('landing')

  if (showSplash) return <SplashScreen onDone={() => setShowSplash(false)} />
  if (view === 'form') return <PengajuanForm onBack={() => setView('landing')} />
  return <LandingPage onStart={() => setView('form')} />
}
