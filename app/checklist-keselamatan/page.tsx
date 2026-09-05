'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, ArrowLeft, ArrowRight, Warning } from '@phosphor-icons/react'

const PENGEMUDI = [
  { id: 'p1', text: 'Saya dalam kondisi sehat secara fisik dan mental untuk mengemudi.' },
  { id: 'p2', text: 'Saya memiliki SIM yang sesuai dengan ketentuan.' },
  { id: 'p3', text: 'Saya memahami rute perjalanan yang akan dilayani.' },
  { id: 'p4', text: 'Saya memahami tindakan yang harus dilakukan apabila terjadi keadaan darurat.' },
  { id: 'p5', text: 'Saya memahami dan menerapkan etika berlalu lintas.' },
  { id: 'p6', text: 'Saya bersedia mengikuti pelatihan/penyegaran keselamatan sesuai ketentuan.' },
]

const KENDARAAN = [
  { id: 'k7', text: 'Kendaraan dalam kondisi laik jalan dan aman untuk dioperasikan.' },
  { id: 'k8', text: 'Kendaraan diperiksa kondisinya sebelum digunakan untuk beroperasi.' },
  { id: 'k9', text: 'Kendaraan dilengkapi minimal 2 lampu senter yang tersedia dan berfungsi.' },
  { id: 'k10', text: 'Kendaraan memiliki minimal 1 kotak P3K yang tersedia dan dapat digunakan.' },
  { id: 'k11', text: 'Kendaraan memiliki 1 APAR kapasitas 1 kg yang tersedia dan dapat digunakan.' },
  { id: 'k12', text: 'Sabuk keselamatan tersedia pada tempat duduk dan dapat digunakan.' },
  { id: 'k13', text: 'Kendaraan memiliki bukti kepesertaan/pembayaran asuransi kecelakaan sesuai ketentuan.' },
  { id: 'k14', text: 'Usia kendaraan memenuhi ketentuan, yaitu maksimal 5 tahun.' },
]

const SEMUA_POIN = [...PENGEMUDI, ...KENDARAAN]

function ItemCheck({ nomor, text, checked, onToggle }: { nomor: number; text: string; checked: boolean; onToggle: () => void }) {
  return (
    <label className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={onToggle}
        className="mt-0.5 w-4 h-4 flex-shrink-0"
      />
      <p className="text-xs text-gray-600 leading-relaxed">
        <span className="font-bold text-gray-400 mr-1">{nomor}.</span>{text}
      </p>
    </label>
  )
}

export default function ChecklistKeselamatan() {
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [pernyataanAkhir, setPernyataanAkhir] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const toggle = (id: string) => setChecked(prev => ({ ...prev, [id]: !prev[id] }))

  const semuaTercentang = SEMUA_POIN.every(p => checked[p.id]) && pernyataanAkhir

  const handleLanjut = () => {
    if (!semuaTercentang) {
      setError('Seluruh 14 poin dan pernyataan akhir wajib dicentang sebelum melanjutkan.')
      return
    }
    const payload = {
      items: SEMUA_POIN.map(p => ({ id: p.id, text: p.text, checked: true })),
      pernyataan_akhir: true,
      waktu_konfirmasi: new Date().toISOString()
    }
    sessionStorage.setItem('checklist_keselamatan', JSON.stringify(payload))
    router.push('/panduan-foto')
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
            Checklist SPM Keselamatan
          </h1>
          <p className="text-red-100 text-xs mt-1">
            Angkutan Sewa Khusus (Roda 4) — sesuai Lampiran I PM 118 Tahun 2018
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 -mt-4 relative z-10 space-y-4 pb-6">

        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <p className="text-sm font-bold text-gray-700 mb-1">A. Pengemudi</p>
          {PENGEMUDI.map((p, i) => (
            <ItemCheck key={p.id} nomor={i + 1} text={p.text} checked={!!checked[p.id]} onToggle={() => toggle(p.id)} />
          ))}
        </div>

        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <p className="text-sm font-bold text-gray-700 mb-1">B. Kendaraan</p>
          {KENDARAAN.map((k, i) => (
            <ItemCheck key={k.id} nomor={i + 7} text={k.text} checked={!!checked[k.id]} onToggle={() => toggle(k.id)} />
          ))}
        </div>

        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <p className="text-sm font-bold text-gray-700 mb-2">C. Pernyataan Driver</p>
          <p className="text-xs text-gray-500 leading-relaxed mb-3">
            Saya menyatakan bahwa seluruh informasi yang saya berikan dalam Checklist SPM Keselamatan ini
            adalah benar. Saya memahami bahwa pemenuhan standar keselamatan merupakan bagian dari
            persyaratan pelayanan Angkutan Sewa Khusus (ASK) dan bersedia dilakukan verifikasi sesuai
            ketentuan yang berlaku.
          </p>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={pernyataanAkhir} onChange={e => setPernyataanAkhir(e.target.checked)}
              className="mt-0.5 w-4 h-4 flex-shrink-0"
            />
            <p className="text-xs font-semibold text-gray-700 leading-relaxed">
              Saya telah membaca, memahami, dan menyatakan seluruh pernyataan di atas dengan benar.
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

        <button onClick={handleLanjut}
          className="w-full py-4 rounded-2xl font-extrabold text-base text-white flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 50%, #f97316 100%)',
            boxShadow: '0 6px 20px rgba(220,38,38,0.5)'
          }}
        >
          Lanjut <ArrowRight size={20} weight="bold" />
        </button>

        <p className="text-center text-[10px] text-gray-400">
          {SEMUA_POIN.filter(p => checked[p.id]).length} dari {SEMUA_POIN.length} poin dicentang
        </p>
      </div>
    </div>
  )
      }
            
