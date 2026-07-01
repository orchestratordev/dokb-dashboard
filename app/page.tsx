'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Lightbulb,
  Rocket,
  Bell,
  ShieldCheck,
  ArrowRight,
  Clock
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

const KATEGORI_COLOR: Record<string, { bg: string; text: string }> = {
  ide: { bg: 'linear-gradient(135deg, #eff6ff, #dbeafe)', text: '#2563eb' },
  regulasi: { bg: 'linear-gradient(135deg, #fef2f2, #fee2e2)', text: '#dc2626' },
  teknis: { bg: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', text: '#16a34a' },
  organisasi: { bg: 'linear-gradient(135deg, #fffbeb, #fef3c7)', text: '#d97706' },
}

function SplashScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setFadeOut(true)
          setTimeout(onDone, 600)
          return 100
        }
        return prev + 2
      })
    }, 40)
    return () => clearInterval(interval)
  }, [onDone])

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-600 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
      style={{ background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 50%, #f97316 100%)' }}
    >
      <div style={{ animation: 'scaleIn 0.6s ease-out forwards' }}>
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6"
          style={{
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)'
          }}
        >
          <ShieldCheck size={48} color="white" weight="fill" />
        </div>
      </div>

      <div style={{ animation: 'slideUp 0.6s ease-out 0.2s both' }} className="text-center">
        <h1 className="text-4xl font-extrabold text-white tracking-tight"
          style={{ fontFamily: 'var(--font-plus-jakarta)' }}
        >
          DOKB
        </h1>
        <p className="text-red-100 text-sm mt-1 font-medium">Command Center</p>
      </div>

      <div className="mt-12 w-48">
        <div className="h-1 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0.5); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default function Home() {
  const [showSplash, setShowSplash] = useState(true)
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const [ideasRes, projectsRes] = await Promise.all([
      supabase.from('ideas').select('*').eq('is_public', true).order('created_at', { ascending: false }).limit(10),
      supabase.from('projects').select('*').eq('is_public', true).order('created_at', { ascending: false })
    ])
    if (ideasRes.data) setIdeas(ideasRes.data)
    if (projectsRes.data) setProjects(projectsRes.data)
    setLoading(false)
  }

  if (showSplash) return <SplashScreen onDone={() => setShowSplash(false)} />

  return (
    <div className="min-h-screen" style={{ background: '#f8f8fa' }}>

      {/* Header */}
      <div className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 60%, #f97316 100%)',
          paddingBottom: '32px'
        }}
      >
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <div className="relative p-6 pt-10 max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck size={28} color="white" weight="fill" />
              <div>
                <h1 className="text-xl font-extrabold text-white"
                  style={{ fontFamily: 'var(--font-plus-jakarta)' }}
                >
                  DOKB Command Center
                </h1>
                <p className="text-red-100 text-xs font-medium">
                  Kalimantan Selatan
                </p>
              </div>
            </div>
            <a href="/admin"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white"
              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
            >
              Admin <ArrowRight size={12} weight="bold" />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 -mt-4 relative z-10 space-y-4">

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Total Ide', value: ideas.length, icon: Lightbulb, grad: 'linear-gradient(135deg, #2563eb, #3b82f6)' },
            { label: 'Project Aktif', value: projects.filter(p => p.status === 'aktif').length, icon: Rocket, grad: 'linear-gradient(135deg, #dc2626, #f97316)' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-4 text-white flex items-center gap-3"
              style={{ background: s.grad, boxShadow: '0 6px 16px rgba(0,0,0,0.12)' }}
            >
              <s.icon size={28} weight="fill" />
              <div>
                <p className="text-2xl font-extrabold">{s.value}</p>
                <p className="text-xs opacity-90">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Projects */}
        <div className="bg-white rounded-2xl p-4"
          style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
        >
          <p className="text-sm font-extrabold text-gray-800 flex items-center gap-2 mb-3">
            <Rocket size={16} color="#dc2626" weight="fill" /> Project DOKB
          </p>
          {loading ? (
            <p className="text-xs text-gray-400 text-center py-4">⏳ Memuat...</p>
          ) : projects.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">📭 Belum ada project</p>
          ) : (
            <div className="space-y-3">
              {projects.map(p => (
                <div key={p.id}>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-bold text-gray-800">{p.nama}</p>
                    <span className="text-xs font-bold" style={{ color: p.status === 'aktif' ? '#16a34a' : '#6b7280' }}>
                      {p.progress}%
                    </span>
                  </div>
                  {p.deskripsi && (
                    <p className="text-xs text-gray-400 mb-1">{p.deskripsi}</p>
                  )}
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{
                        width: `${p.progress}%`,
                        background: 'linear-gradient(135deg, #dc2626, #f97316)'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ideas */}
        <div>
          <p className="text-sm font-extrabold text-gray-800 flex items-center gap-2 mb-3">
            <Lightbulb size={16} color="#dc2626" weight="fill" /> Ide & Gagasan Terbaru
          </p>
          {loading ? (
            <p className="text-xs text-gray-400 text-center py-4">⏳ Memuat...</p>
          ) : ideas.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">📭 Belum ada ide</p>
          ) : (
            <div className="space-y-3">
              {ideas.map(idea => {
                const kategoriStyle = KATEGORI_COLOR[idea.kategori] || KATEGORI_COLOR.ide
                return (
                  <div key={idea.id} className="bg-white rounded-2xl p-4"
                    style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-bold text-gray-800 flex-1 pr-2">{idea.judul}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap"
                        style={{ background: kategoriStyle.bg, color: kategoriStyle.text }}
                      >
                        {idea.kategori}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{idea.konten}</p>
                    <p className="text-[10px] text-gray-300 mt-2 flex items-center gap-1">
                      <Clock size={10} weight="fill" />
                      {new Date(idea.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 pb-6">
          DOKB — Perkumpulan Driver Online Kalimantan Selatan Bersatu
        </p>

      </div>
    </div>
  )
}
