'use client'

import { useEffect, useState } from 'react'
import {
  IdentificationCard,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  UploadSimple,
  FileText,
  Car,
  User,
  MapPin,
  Phone,
  Envelope,
  WarningCircle,
  MagnifyingGlass,
  PencilSimple,
} from '@phosphor-icons/react'

const PLATFORM = ['Grab', 'Gojek', 'Maxim', 'InDrive']
const KOTA = [
  'Banjarmasin',
  'Banjarbaru',
  'Kabupaten Banjar',
  'Barito Kuala',
  'Tapin',
  'Hulu Sungai Selatan',
  'Hulu Sungai Tengah',
  'Hulu Sungai Utara',
  'Balangan',
  'Tabalong',
  'Tanah Laut',
  'Tanah Bumbu',
  'Kotabaru',
]
const JENIS_KENDARAAN = ['Mobil']

type DokumenKey =
  | 'ktp'
  | 'sim'
  | 'stnk'
  | 'skpd'
  | 'kendaraan_depan'
  | 'kendaraan_belakang'
  | 'kendaraan_samping'
  | 'buku_servis'

const DOKUMEN_LIST: { key: DokumenKey; label: string }[] = [
  { key: 'ktp', label: 'Foto KTP' },
  { key: 'sim', label: 'Foto SIM' },
  { key: 'stnk', label: 'Foto STNK' },
  { key: 'skpd', label: 'Foto SKPD (Pajak Kendaraan)' },
  { key: 'kendaraan_depan', label: 'Foto Kendaraan — Tampak Depan' },
  { key: 'kendaraan_belakang', label: 'Foto Kendaraan — Tampak Belakang' },
  { key: 'kendaraan_samping', label: 'Foto Kendaraan — Tampak Samping' },
  { key: 'buku_servis', label: 'Foto Cover Buku Servis' },
]

type FormDataType = {
  nama: string
  nik: string
  no_hp: string
  email: string
  alamat: string
  kota: string
  jenis_kendaraan: string
  merk: string
  tipe: string
  tahun: string
  nomor_polisi: string
  platform: string
  anggota_dokb: string
  nomor_anggota: string
  dokumen: Partial<Record<DokumenKey, File>>
  persetujuan: boolean
}

const initialForm: FormDataType = {
  nama: '',
  nik: '',
  no_hp: '',
  email: '',
  alamat: '',
  kota: '',
  jenis_kendaraan: 'Mobil',
  merk: '',
  tipe: '',
  tahun: '',
  nomor_polisi: '',
  platform: '',
  anggota_dokb: '',
  nomor_anggota: '',
  dokumen: {},
  persetujuan: false,
}

function SplashScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + 4
        if (next >= 100) {
          clearInterval(interval)
          setTimeout(onDone, 350)
          return 100
        }
        return next
      })
    }, 45)

    return () => clearInterval(interval)
  }, [onDone])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-red-600 via-red-500 to-orange-500 text-white">
      <div className="w-full max-w-md px-8 text-center">
        <div className="mx-auto mb-7 flex h-24 w-24 items-center justify-center rounded-[28px] bg-white/15 shadow-2xl backdrop-blur-sm">
          <IdentificationCard size={54} weight="duotone" />
        </div>
        <div className="text-sm font-bold tracking-[0.28em]">KARTU PENGAWASAN</div>
        <div className="mt-2 text-sm text-white/85">
          Angkutan Sewa Khusus — Kalimantan Selatan
        </div>
        <div className="mx-auto mt-8 h-1.5 w-full overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-white transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function LandingPage({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <IdentificationCard size={27} weight="duotone" />
            </div>
            <div>
              <div className="text-sm font-black tracking-wide text-slate-900">KP ASK</div>
              <div className="text-xs text-slate-500">Kalimantan Selatan</div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8 md:py-12">
        <section className="rounded-3xl bg-gradient-to-br from-red-600 to-orange-500 p-6 text-white shadow-xl md:p-10">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
              ANGKUTAN SEWA KHUSUS • RODA 4
            </div>
            <h1 className="text-3xl font-black leading-tight md:text-5xl">
              Kartu Pengawasan
            </h1>
            <p className="mt-3 text-base font-medium text-white/90 md:text-xl">
              Layanan Pendampingan Pengajuan Kartu Pengawasan (KP) Angkutan Sewa Khusus
            </p>
            <p className="mt-5 max-w-2xl text-sm leading-6 text-white/85 md:text-base">
              DOKB membantu pengemudi Roda 4 menyiapkan data dan dokumen dalam proses
              pengajuan KP ASK.
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-5">
          <div className="flex gap-3">
            <IdentificationCard className="mt-0.5 shrink-0 text-red-600" size={25} weight="duotone" />
            <div>
              <h2 className="font-bold text-slate-900">Pendampingan Administrasi</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                DOKB berperan sebagai jembatan dan pendamping administrasi bagi pengemudi
                dalam menyiapkan kelengkapan pengajuan KP ASK.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-7">
          <h2 className="text-xl font-black text-slate-900">Dokumen yang Perlu Disiapkan</h2>
          <p className="mt-1 text-sm text-slate-500">
            Siapkan seluruh dokumen berikut sesuai arahan dalam proses pengajuan KP ASK.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {DOKUMEN_LIST.map((doc, i) => (
              <div key={doc.key} className="flex items-center gap-3 rounded-2xl border bg-white p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <span className="text-xs font-bold">{i + 1}</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <FileText size={18} />
                  {doc.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={onStart}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-4 font-bold text-white shadow-lg transition hover:bg-red-700"
          >
            Mulai Pengajuan
            <ArrowRight size={20} weight="bold" />
          </button>
          <button
            onClick={() => (window.location.href = '/review')}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border bg-white px-6 py-4 font-bold text-slate-700"
          >
            <MagnifyingGlass size={20} />
            Cek &amp; Perbaiki Pengajuan
          </button>
        </div>

        <footer className="mt-12 border-t pt-6 text-center">
          <div className="text-sm font-bold text-slate-700">
            Sistem Pendampingan Administrasi KP ASK
          </div>
          <div className="mt-1 text-sm text-slate-500">
            DOKB — Perkumpulan Driver Online Kalimantan Selatan Bersatu
          </div>
          <p className="mx-auto mt-3 max-w-2xl text-xs leading-5 text-slate-400">
            DOKB berperan sebagai jembatan dan pendamping administrasi pengajuan.
            Proses penetapan dan penerbitan KP mengikuti kewenangan instansi yang berwenang.
          </p>
        </footer>
      </main>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  icon,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  icon?: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
        {icon}
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
      />
    </label>
  )
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: string[]
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100"
      >
        <option value="">Pilih...</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  )
}

function UploadBox({
  label,
  file,
  onChange,
}: {
  label: string
  file?: File
  onChange: (file: File | undefined) => void
}) {
  return (
    <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-slate-200 bg-white p-4 transition hover:border-red-300 hover:bg-red-50/30">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          {file ? <CheckCircle size={23} weight="fill" /> : <UploadSimple size={23} />}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold text-slate-800">{label}</div>
          <div className="truncate text-xs text-slate-500">
            {file ? file.name : 'Pilih file untuk diunggah'}
          </div>
        </div>
      </div>
      <input
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0])}
      />
    </label>
  )
}

function FormPage({
  form,
  setForm,
  onBack,
  onReview,
}: {
  form: FormDataType
  setForm: React.Dispatch<React.SetStateAction<FormDataType>>
  onBack: () => void
  onReview: () => void
}) {
  const update = (key: keyof FormDataType, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }))

  const setDoc = (key: DokumenKey, file: File | undefined) =>
    setForm((f) => ({ ...f, dokumen: { ...f.dokumen, [key]: file } }))

  const canReview =
    form.nama &&
    form.nik &&
    form.no_hp &&
    form.alamat &&
    form.kota &&
    form.jenis_kendaraan &&
    form.merk &&
    form.tipe &&
    form.tahun &&
    form.nomor_polisi &&
    form.platform &&
    form.anggota_dokb &&
    Object.keys(form.dokumen).length === DOKUMEN_LIST.length &&
    form.persetujuan

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-5 py-4">
          <button onClick={onBack} className="rounded-xl p-2 hover:bg-slate-100">
            <ArrowLeft size={22} />
          </button>
          <div>
            <div className="font-black text-slate-900">Pengajuan KP ASK</div>
            <div className="text-xs text-slate-500">Pendampingan administrasi DOKB</div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8">
        <div className="space-y-6">
          <section className="rounded-3xl bg-white p-5 shadow-sm md:p-7">
            <div className="mb-5 flex items-center gap-3">
              <User className="text-red-600" size={26} weight="duotone" />
              <h2 className="text-xl font-black">Data Pribadi</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Nama Lengkap" value={form.nama} onChange={(v) => update('nama', v)} icon={<User size={17} />} />
              <Field label="NIK" value={form.nik} onChange={(v) => update('nik', v)} />
              <Field label="Nomor HP" value={form.no_hp} onChange={(v) => update('no_hp', v)} type="tel" icon={<Phone size={17} />} />
              <Field label="Email" value={form.email} onChange={(v) => update('email', v)} type="email" icon={<Envelope size={17} />} />
              <div className="md:col-span-2">
                <Field label="Alamat" value={form.alamat} onChange={(v) => update('alamat', v)} icon={<MapPin size={17} />} />
              </div>
              <SelectField label="Kabupaten/Kota" value={form.kota} onChange={(v) => update('kota', v)} options={KOTA} />
            </div>
          </section>

          <section className="rounded-3xl bg-white p-5 shadow-sm md:p-7">
            <div className="mb-5 flex items-center gap-3">
              <Car className="text-red-600" size={26} weight="duotone" />
              <h2 className="text-xl font-black">Data Kendaraan</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <SelectField label="Jenis Kendaraan" value={form.jenis_kendaraan} onChange={(v) => update('jenis_kendaraan', v)} options={JENIS_KENDARAAN} />
              <Field label="Merek" value={form.merk} onChange={(v) => update('merk', v)} placeholder="Contoh: Toyota" />
              <Field label="Tipe" value={form.tipe} onChange={(v) => update('tipe', v)} placeholder="Contoh: Avanza" />
              <Field label="Tahun" value={form.tahun} onChange={(v) => update('tahun', v)} type="number" placeholder="2020" />
              <Field label="Nomor Polisi" value={form.nomor_polisi} onChange={(v) => update('nomor_polisi', v)} placeholder="DA 1234 XX" />
            </div>
          </section>

          <section className="rounded-3xl bg-white p-5 shadow-sm md:p-7">
            <h2 className="text-xl font-black">Data Operasional</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <SelectField label="Platform/Aplikator" value={form.platform} onChange={(v) => update('platform', v)} options={PLATFORM} />
              <SelectField label="Status Keanggotaan DOKB" value={form.anggota_dokb} onChange={(v) => update('anggota_dokb', v)} options={['Anggota DOKB', 'Non-Anggota']} />
              {form.anggota_dokb === 'Anggota DOKB' && (
                <Field label="Nomor Anggota DOKB" value={form.nomor_anggota} onChange={(v) => update('nomor_anggota', v)} />
              )}
            </div>
          </section>

          <section className="rounded-3xl bg-white p-5 shadow-sm md:p-7">
            <div className="mb-2 flex items-center gap-3">
              <UploadSimple className="text-red-600" size={26} weight="duotone" />
              <h2 className="text-xl font-black">Dokumen Pengajuan</h2>
            </div>
            <p className="mb-5 text-sm text-slate-500">
              Siapkan seluruh dokumen berikut sesuai arahan dalam proses pengajuan KP ASK.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {DOKUMEN_LIST.map((doc) => (
                <UploadBox
                  key={doc.key}
                  label={doc.label}
                  file={form.dokumen[doc.key]}
                  onChange={(file) => setDoc(doc.key, file)}
                />
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
            <label className="flex cursor-pointer gap-3">
              <input
                type="checkbox"
                checked={form.persetujuan}
                onChange={(e) => update('persetujuan', e.target.checked)}
                className="mt-1 h-5 w-5 accent-red-600"
              />
              <span className="text-sm leading-6 text-slate-700">
                Saya menyatakan data yang saya berikan benar dan bersedia mengikuti proses
                pendataan, pemeriksaan kelengkapan, dan fasilitasi pengajuan KP ASK melalui DOKB.
              </span>
            </label>
          </section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button onClick={onBack} className="rounded-2xl border bg-white px-6 py-4 font-bold text-slate-700">
              Kembali
            </button>
            <button
              onClick={onReview}
              disabled={!canReview}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Periksa Pengajuan
              <ArrowRight size={20} weight="bold" />
            </button>
          </div>

          {!canReview && (
            <div className="flex items-start gap-2 rounded-2xl bg-slate-100 p-4 text-xs leading-5 text-slate-500">
              <WarningCircle className="mt-0.5 shrink-0" size={17} />
              Lengkapi data, seluruh dokumen, dan persetujuan sebelum melanjutkan.
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function ReviewPage({
  form,
  onBack,
  onSubmit,
  loading,
}: {
  form: FormDataType
  onBack: () => void
  onSubmit: () => void
  loading: boolean
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-5 py-4">
          <button onClick={onBack} className="rounded-xl p-2 hover:bg-slate-100">
            <ArrowLeft size={22} />
          </button>
          <div>
            <div className="font-black text-slate-900">Periksa Pengajuan</div>
            <div className="text-xs text-slate-500">Pastikan data sudah benar</div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-8">
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-black">Ringkasan Data</h1>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              ['Nama', form.nama],
              ['NIK', form.nik],
              ['No. HP', form.no_hp],
              ['Email', form.email || '-'],
              ['Kabupaten/Kota', form.kota],
              ['Jenis Kendaraan', form.jenis_kendaraan],
              ['Merek / Tipe', `${form.merk} / ${form.tipe}`],
              ['Tahun', form.tahun],
              ['Nomor Polisi', form.nomor_polisi],
              ['Platform', form.platform],
              ['Status DOKB', form.anggota_dokb],
              ['Nomor Anggota', form.nomor_anggota || '-'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-slate-50 p-4">
                <div className="text-xs text-slate-500">{label}</div>
                <div className="mt-1 break-words text-sm font-bold text-slate-800">{value}</div>
              </div>
            ))}
          </div>

          <div className="mt-7">
            <h2 className="font-black">Dokumen</h2>
            <div className="mt-3 space-y-2">
              {DOKUMEN_LIST.map((doc) => (
                <div key={doc.key} className="flex items-center justify-between rounded-xl border p-3">
                  <span className="text-sm text-slate-700">{doc.label}</span>
                  <CheckCircle size={20} weight="fill" className="text-green-600" />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button onClick={onBack} className="inline-flex items-center justify-center gap-2 rounded-2xl border bg-white px-6 py-4 font-bold text-slate-700">
              <PencilSimple size={19} />
              Perbaiki Data
            </button>
            <button
              onClick={onSubmit}
              disabled={loading}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-4 font-bold text-white disabled:opacity-50"
            >
              {loading ? 'Mengirim...' : 'Kirim Pengajuan'}
              {!loading && <ArrowRight size={20} weight="bold" />}
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}

function SuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-xl">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-green-600">
          <CheckCircle size={50} weight="fill" />
        </div>
        <h1 className="mt-6 text-2xl font-black text-slate-900">Pengajuan Berhasil Dikirim</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Pengajuan Kartu Pengawasan Anda telah berhasil dikirim melalui sistem pendampingan
          administrasi DOKB.
        </p>
        <p className="mt-3 text-xs leading-5 text-slate-400">
          Data dan dokumen akan mengikuti proses pemeriksaan serta kewenangan instansi yang
          berwenang.
        </p>
        <button
          onClick={() => (window.location.href = '/')}
          className="mt-7 rounded-2xl bg-red-600 px-6 py-3.5 font-bold text-white"
        >
          Kembali ke Halaman Utama
        </button>
      </div>
    </div>
  )
}

export default function Home() {
  const [showSplash, setShowSplash] = useState(true)
  const [page, setPage] = useState<'landing' | 'form' | 'review' | 'success'>('landing')
  const [form, setForm] = useState<FormDataType>(initialForm)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setLoading(true)
    try {
      const uploaded: Record<string, string> = {}

      for (const doc of DOKUMEN_LIST) {
        const file = form.dokumen[doc.key]
        if (!file) throw new Error(`Dokumen belum lengkap: ${doc.label}`)

        const fd = new FormData()
        fd.append('file', file)
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd })
        if (!uploadRes.ok) throw new Error('Gagal mengunggah dokumen')
        const uploadData = await uploadRes.json()
        uploaded[doc.key] = uploadData.url
      }

      const payload = {
        nama: form.nama,
        nik: form.nik,
        no_hp: form.no_hp,
        email: form.email,
        alamat: form.alamat,
        kota: form.kota,
        jenis_kendaraan: form.jenis_kendaraan,
        merk: form.merk,
        tipe: form.tipe,
        tahun: form.tahun,
        nomor_polisi: form.nomor_polisi,
        platform: form.platform,
        anggota_dokb: form.anggota_dokb,
        nomor_anggota: form.nomor_anggota,
        dokumen: uploaded,
      }

      const res = await fetch('/api/pengajuan-kp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error('Gagal mengirim pengajuan')
      setPage('success')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Terjadi kesalahan saat mengirim pengajuan.')
    } finally {
      setLoading(false)
    }
  }

  if (showSplash) {
    return <SplashScreen onDone={() => setShowSplash(false)} />
  }

  if (page === 'landing') return <LandingPage onStart={() => setPage('form')} />
  if (page === 'form') {
    return (
      <FormPage
        form={form}
        setForm={setForm}
        onBack={() => setPage('landing')}
        onReview={() => setPage('review')}
      />
    )
  }
  if (page === 'review') {
    return (
      <ReviewPage
        form={form}
        onBack={() => setPage('form')}
        onSubmit={submit}
        loading={loading}
      />
    )
  }

  return <SuccessPage />
}
