'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, XCircle, ArrowRight } from '@phosphor-icons/react'

// ─── Mockup SVG — Dokumen (KTP/SIM/STNK/SKPD) ──────────────────────────────
function MockupDokumen({ salah }: { salah?: 'miring' | 'terpotong' | 'buram' | 'silau' | 'terlipat' }) {
  const rotate = salah === 'miring' ? -18 : 0
  const showCrop = salah === 'terpotong'
  const showBlur = salah === 'buram'
  const showGlare = salah === 'silau'
  const showFold = salah === 'terlipat'

  return (
    <svg viewBox="0 0 160 100" className="w-full h-24">
      <rect width="160" height="100" fill="#f3f4f6" rx="8" />
      <g transform={`rotate(${rotate} 80 50)`} filter={showBlur ? 'blur(1.5px)' : undefined}>
        <rect
          x={showCrop ? -20 : 15}
          y="20"
          width="130"
          height="60"
          rx="6"
          fill="#ffffff"
          stroke="#9ca3af"
          strokeWidth="1.5"
        />
        <rect x={showCrop ? -10 : 25} y="30" width="30" height="30" rx="3" fill="#dbeafe" />
        <rect x={showCrop ? 30 : 65} y="32" width="55" height="4" rx="2" fill="#d1d5db" />
        <rect x={showCrop ? 30 : 65} y="42" width="45" height="4" rx="2" fill="#e5e7eb" />
        <rect x={showCrop ? 30 : 65} y="52" width="50" height="4" rx="2" fill="#e5e7eb" />
        <rect x={showCrop ? 30 : 65} y="62" width="35" height="4" rx="2" fill="#e5e7eb" />
        {showFold && (
          <>
            <line x1="15" y1="50" x2="145" y2="50" stroke="#9ca3af" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="80" y1="20" x2="75" y2="80" stroke="#9ca3af" strokeWidth="1" strokeDasharray="2 2" />
          </>
        )}
      </g>
      {showGlare && (
        <ellipse cx="100" cy="40" rx="35" ry="20" fill="white" opacity="0.75" />
      )}
    </svg>
  )
}

// ─── Mockup SVG — Kendaraan ─────────────────────────────────────────────────
function MockupKendaraan({ salah }: { salah?: 'miring' | 'terpotong' | 'buram' | 'jauh' }) {
  const rotate = salah === 'miring' ? -10 : 0
  const showCrop = salah === 'terpotong'
  const showBlur = salah === 'buram'
  const scaleSmall = salah === 'jauh'

  return (
    <svg viewBox="0 0 160 100" className="w-full h-24">
      <rect width="160" height="100" fill="#f3f4f6" rx="8" />
      <line x1="0" y1="75" x2="160" y2="75" stroke="#d1d5db" strokeWidth="2" />
      <g
        transform={`translate(${scaleSmall ? 55 : 20} ${scaleSmall ? 45 : 25}) scale(${scaleSmall ? 0.55 : showCrop ? 1.15 : 1}) rotate(${rotate} 60 25)`}
        filter={showBlur ? 'blur(1.5px)' : undefined}
      >
        <rect x="10" y="20" width="110" height="30" rx="8" fill="#dc2626" />
        <rect x="30" y="5" width="60" height="22" rx="6" fill="#dc2626" />
        <rect x="35" y="8" width="22" height="14" rx="2" fill="#bfdbfe" />
        <rect x="63" y="8" width="22" height="14" rx="2" fill="#bfdbfe" />
        <circle cx="35" cy="52" r="9" fill="#374151" />
        <circle cx="95" cy="52" r="9" fill="#374151" />
        <rect x="45" y="38" width="30" height="8" rx="2" fill="white" />
      </g>
    </svg>
  )
}

// ─── Mockup SVG — Buku Servis ───────────────────────────────────────────────
function MockupBuku({ salah }: { salah?: 'miring' | 'terpotong' | 'buram' | 'gelap' }) {
  const rotate = salah === 'miring' ? -15 : 0
  const showCrop = salah === 'terpotong'
  const showBlur = salah === 'buram'
  const showDark = salah === 'gelap'

  return (
    <svg viewBox="0 0 160 100" className="w-full h-24">
      <rect width="160" height="100" fill="#f3f4f6" rx="8" />
      <g transform={`rotate(${rotate} 80 50)`} filter={showBlur ? 'blur(1.5px)' : undefined}>
        <rect
          x={showCrop ? -15 : 35}
          y="15"
          width="90"
          height="70"
          rx="4"
          fill="#1e3a8a"
        />
        <rect x={showCrop ? 0 : 50} y="30" width="60" height="6" rx="2" fill="#93c5fd" />
        <rect x={showCrop ? 0 : 50} y="42" width="45" height="4" rx="2" fill="#bfdbfe" />
        <rect x={showCrop ? 0 : 50} y="60" width="35" height="18" rx="2" fill="#e0e7ff" />
      </g>
      {showDark && <rect width="160" height="100" fill="black" opacity="0.45" rx="8" />}
    </svg>
  )
}

type Item = {
  judul: string
  tipe: 'dokumen' | 'kendaraan' | 'buku'
  salahVarian: string
  tips: string[]
}

const PANDUAN: Item[] = [
  {
    judul: 'Foto KTP / SIM / STNK / SKPD',
    tipe: 'dokumen',
    salahVarian: 'terpotong',
    tips: [
      'Seluruh sisi dokumen terlihat, tidak ada bagian terpotong',
      'Foto tegak lurus, tidak miring',
      'Tidak buram — pastikan fokus kamera tepat',
      'Hindari pantulan cahaya/silau yang menutupi tulisan',
      'Dokumen dalam kondisi tidak terlipat saat difoto'
    ]
  },
  {
    judul: 'Foto Kendaraan (Depan / Belakang / Samping)',
    tipe: 'kendaraan',
    salahVarian: 'jauh',
    tips: [
      'Jarak foto cukup dekat, plat nomor harus terbaca jelas',
      'Seluruh badan kendaraan pada sisi yang difoto masuk dalam bingkai',
      'Foto tidak miring, sejajar dengan kendaraan',
      'Ambil di tempat terang, hindari foto terlalu gelap'
    ]
  },
  {
    judul: 'Foto Cover Buku Servis',
    tipe: 'buku',
    salahVarian: 'gelap',
    tips: [
      'Cover buku servis terlihat penuh, tidak terpotong',
      'Pencahayaan cukup, tidak gelap',
      'Foto tidak miring dan tidak buram'
    ]
  }
]

export default function PanduanFoto() {
  const router = useRouter()

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
            Panduan Foto Dokumen
          </h1>
          <p className="text-red-100 text-xs mt-1">
            Ikuti contoh berikut agar pengajuan tidak perlu diulang
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 -mt-4 relative z-10 space-y-4 pb-6">
        {PANDUAN.map((item, i) => (
          <div key={i} className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
            <p className="text-sm font-bold text-gray-800 mb-3">{item.judul}</p>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <div className="rounded-xl overflow-hidden border-2" style={{ borderColor: '#86efac' }}>
                  {item.tipe === 'dokumen' && <MockupDokumen />}
                  {item.tipe === 'kendaraan' && <MockupKendaraan />}
                  {item.tipe === 'buku' && <MockupBuku />}
                </div>
                <div className="flex items-center gap-1 mt-1.5 justify-center">
                  <CheckCircle size={14} color="#16a34a" weight="fill" />
                  <p className="text-xs font-bold text-green-600">Benar</p>
                </div>
              </div>
              <div>
                <div className="rounded-xl overflow-hidden border-2" style={{ borderColor: '#fca5a5' }}>
                  {item.tipe === 'dokumen' && <MockupDokumen salah={item.salahVarian as any} />}
                  {item.tipe === 'kendaraan' && <MockupKendaraan salah={item.salahVarian as any} />}
                  {item.tipe === 'buku' && <MockupBuku salah={item.salahVarian as any} />}
                </div>
                <div className="flex items-center gap-1 mt-1.5 justify-center">
                  <XCircle size={14} color="#dc2626" weight="fill" />
                  <p className="text-xs font-bold text-red-600">Salah</p>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              {item.tips.map((tip, ti) => (
                <div key={ti} className="flex items-start gap-1.5">
                  <CheckCircle size={12} color="#dc2626" weight="fill" className="flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-gray-500">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        <button onClick={() => router.push('/')}
          className="w-full py-4 rounded-2xl font-extrabold text-base text-white flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 50%, #f97316 100%)',
            boxShadow: '0 6px 20px rgba(220,38,38,0.5)'
          }}
        >
          Lanjut ke Formulir <ArrowRight size={20} weight="bold" />
        </button>
      </div>
    </div>
  )
}
