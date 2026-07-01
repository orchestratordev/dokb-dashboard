'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  Lightbulb,
  Rocket,
  Bell,
  ShieldCheck,
  SignOut,
  Plus,
  X,
  Check,
  ArrowsClockwise
} from '@phosphor-icons/react'

type Idea = {
  id: string
  judul: string
  konten: string
  kategori: string
  status: string
  is_public: boolean
  created_at: string
}

type Project = {
  id: string
  nama: string
  deskripsi: string
  status: string
  progress: number
  target_date: string
  is_public: boolean
}

type Reminder = {
  id: string
  judul: string
  deskripsi: string
  deadline: string
  is_done: boolean
}

export default function AdminDashboard() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [activeTab, setActiveTab] = useState('ideas')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Form states
  const [ideaForm, setIdeaForm] = useState({ judul: '', konten: '', kategori: 'ide', is_public: true })
  const [projectForm, setProjectForm] = useState({ nama: '', deskripsi: '', progress: 0, target_date: '', is_public: true })
  const [reminderForm, setReminderForm] = useState({ judul: '', deskripsi: '', deadline: '' })

  useEffect(() => {
    checkAuth()
    fetchAll()
  }, [])

  const checkAuth = async () => {
    const { data } = await supabase.auth.getSession()
    if (!data.session) {
      setTimeout(async () => {
        const { data: data2 } = await supabase.auth.getSession()
        if (!data2.session) router.push('/admin')
      }, 1000)
    }
  }

  const fetchAll = async () => {
    setLoading(true)
    const [ideasRes, projectsRes, remindersRes] = await Promise.all([
      supabase.from('ideas').select('*').order('created_at', { ascending: false }),
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('reminders').select('*').order('deadline', { ascending: true })
    ])
    if (ideasRes.data) setIdeas(ideasRes.data)
    if (projectsRes.data) setProjects(projectsRes.data)
    if (remindersRes.data) setReminders(remindersRes.data)
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin')
  }

  const submitIdea = async () => {
    if (!ideaForm.judul || !ideaForm.konten) return
    await supabase.from('ideas').insert({ ...ideaForm, status: 'baru' })
    setIdeaForm({ judul: '', konten: '', kategori: 'ide', is_public: true })
    setShowForm(false)
    fetchAll()
  }

  const submitProject = async () => {
    if (!projectForm.nama) return
    await supabase.from('projects').insert({ ...projectForm, status: 'aktif' })
    setProjectForm({ nama: '', deskripsi: '', progress: 0, target_date: '', is_public: true })
    setShowForm(false)
    fetchAll()
  }

  const submitReminder = async () => {
    if (!reminderForm.judul) return
    await supabase.from('reminders').insert({ ...reminderForm, is_done: false })
    setReminderForm({ judul: '', deskripsi: '', deadline: '' })
    setShowForm(false)
    fetchAll()
  }

  const toggleReminder = async (id: string, is_done: boolean) => {
    await supabase.from('reminders').update({ is_done: !is_done }).eq('id', id)
    fetchAll()
  }

  const updateProgress = async (id: string, progress: number) => {
    await supabase.from('projects').update({ progress }).eq('id', id)
    fetchAll()
  }

  const tabs = [
    { id: 'ideas', label: 'Ide', icon: Lightbulb, count: ideas.length },
    { id: 'projects', label: 'Project', icon: Rocket, count: projects.length },
    { id: 'reminders', label: 'Reminder', icon: Bell, count: reminders.filter(r => !r.is_done).length },
  ]

  return (
    <div className="min-h-screen" style={{ background: '#f8f8fa' }}>

      {/* Header */}
      <div className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 60%, #f97316 100%)',
          paddingBottom: '28px'
        }}
      >
        <div className="relative p-6 pt-8 flex justify-between items-center max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <ShieldCheck size={24} color="white" weight="fill" />
            <div>
              <h1 className="text-lg font-extrabold text-white"
                style={{ fontFamily: 'var(--font-plus-jakarta)' }}
              >
                Command Center
              </h1>
              <p className="text-red-100 text-xs">Pak Jani — DOKB</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchAll}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            >
              <ArrowsClockwise size={16} color="white" weight="bold" />
            </button>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            >
              <SignOut size={14} weight="bold" />
              Keluar
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 -mt-4 relative z-10 space-y-4">

        {/* Tabs */}
        <div className="grid grid-cols-3 gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setShowForm(false) }}
              className="rounded-2xl p-3 text-center transition-all"
              style={activeTab === tab.id ? {
                background: 'linear-gradient(135deg, #dc2626, #f97316)',
                boxShadow: '0 6px 16px rgba(220,38,38,0.35)',
                color: 'white'
              } : {
                background: 'white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                color: '#6b7280'
              }}
            >
              <tab.icon size={20} weight="fill" className="mx-auto mb-1" />
              <p className="text-xs font-bold">{tab.label}</p>
              <p className="text-lg font-extrabold">{tab.count}</p>
            </button>
          ))}
        </div>

        {/* Add Button */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full py-3 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all"
          style={{
            background: showForm
              ? 'linear-gradient(135deg, #475569, #64748b)'
              : 'linear-gradient(135deg, #dc2626, #f97316)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          {showForm ? <><X size={16} weight="bold" /> Batal</> : <><Plus size={16} weight="bold" /> Tambah {tabs.find(t => t.id === activeTab)?.label}</>}
        </button>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-2xl p-4 space-y-3"
            style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
          >
            {activeTab === 'ideas' && (
              <>
                <input
                  placeholder="Judul ide..."
                  value={ideaForm.judul}
                  onChange={e => setIdeaForm({ ...ideaForm, judul: e.target.value })}
                  className="w-full rounded-xl py-3 px-4 text-sm font-medium focus:outline-none"
                  style={{ background: '#f8f8fa' }}
                />
                <textarea
                  placeholder="Tulis idenya di sini..."
                  value={ideaForm.konten}
                  onChange={e => setIdeaForm({ ...ideaForm, konten: e.target.value })}
                  rows={3}
                  className="w-full rounded-xl py-3 px-4 text-sm font-medium focus:outline-none"
                  style={{ background: '#f8f8fa' }}
                />
                <select
                  value={ideaForm.kategori}
                  onChange={e => setIdeaForm({ ...ideaForm, kategori: e.target.value })}
                  className="w-full rounded-xl py-3 px-4 text-sm font-medium focus:outline-none"
                  style={{ background: '#f8f8fa' }}
                >
                  <option value="ide">💡 Ide</option>
                  <option value="regulasi">📋 Regulasi</option>
                  <option value="teknis">⚙️ Teknis</option>
                  <option value="organisasi">🏢 Organisasi</option>
                </select>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={ideaForm.is_public}
                    onChange={e => setIdeaForm({ ...ideaForm, is_public: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-xs text-gray-500 font-medium">Tampilkan ke publik/anggota</span>
                </div>
                <button onClick={submitIdea}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #dc2626, #f97316)' }}
                >
                  💡 Simpan Ide
                </button>
              </>
            )}

            {activeTab === 'projects' && (
              <>
                <input
                  placeholder="Nama project..."
                  value={projectForm.nama}
                  onChange={e => setProjectForm({ ...projectForm, nama: e.target.value })}
                  className="w-full rounded-xl py-3 px-4 text-sm font-medium focus:outline-none"
                  style={{ background: '#f8f8fa' }}
                />
                <textarea
                  placeholder="Deskripsi project..."
                  value={projectForm.deskripsi}
                  onChange={e => setProjectForm({ ...projectForm, deskripsi: e.target.value })}
                  rows={2}
                  className="w-full rounded-xl py-3 px-4 text-sm font-medium focus:outline-none"
                  style={{ background: '#f8f8fa' }}
                />
                <div>
                  <p className="text-xs font-bold text-gray-600 mb-1">Progress: {projectForm.progress}%</p>
                  <input
                    type="range" min="0" max="100"
                    value={projectForm.progress}
                    onChange={e => setProjectForm({ ...projectForm, progress: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <input
                  type="date"
                  value={projectForm.target_date}
                  onChange={e => setProjectForm({ ...projectForm, target_date: e.target.value })}
                  className="w-full rounded-xl py-3 px-4 text-sm font-medium focus:outline-none"
                  style={{ background: '#f8f8fa' }}
                />
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={projectForm.is_public}
                    onChange={e => setProjectForm({ ...projectForm, is_public: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-xs text-gray-500 font-medium">Tampilkan ke publik/anggota</span>
                </div>
                <button onClick={submitProject}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #dc2626, #f97316)' }}
                >
                  🚀 Simpan Project
                </button>
              </>
            )}

            {activeTab === 'reminders' && (
              <>
                <input
                  placeholder="Judul reminder..."
                  value={reminderForm.judul}
                  onChange={e => setReminderForm({ ...reminderForm, judul: e.target.value })}
                  className="w-full rounded-xl py-3 px-4 text-sm font-medium focus:outline-none"
                  style={{ background: '#f8f8fa' }}
                />
                <textarea
                  placeholder="Catatan tambahan..."
                  value={reminderForm.deskripsi}
                  onChange={e => setReminderForm({ ...reminderForm, deskripsi: e.target.value })}
                  rows={2}
                  className="w-full rounded-xl py-3 px-4 text-sm font-medium focus:outline-none"
                  style={{ background: '#f8f8fa' }}
                />
                <input
                  type="date"
                  value={reminderForm.deadline}
                  onChange={e => setReminderForm({ ...reminderForm, deadline: e.target.value })}
                  className="w-full rounded-xl py-3 px-4 text-sm font-medium focus:outline-none"
                  style={{ background: '#f8f8fa' }}
                />
                <button onClick={submitReminder}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #dc2626, #f97316)' }}
                >
                  🔔 Simpan Reminder
                </button>
              </>
            )}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="text-center py-8 text-gray-400 text-sm">⏳ Memuat...</div>
        ) : (
          <>
            {/* Ideas Tab */}
            {activeTab === 'ideas' && (
              <div className="space-y-3">
                {ideas.length === 0 ? (
                  <p className="text-center py-8 text-gray-400 text-sm">📭 Belum ada ide</p>
                ) : ideas.map(idea => (
                  <div key={idea.id} className="bg-white rounded-2xl p-4"
                    style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-bold text-gray-800">{idea.judul}</p>
                      <div className="flex items-center gap-1">
                        {idea.is_public && <span className="text-[9px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full font-bold">Publik</span>}
                        <span className="text-[9px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-bold">{idea.kategori}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">{idea.konten}</p>
                    <p className="text-[10px] text-gray-300 mt-2">
                      {new Date(idea.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Projects Tab */}
            {activeTab === 'projects' && (
              <div className="space-y-3">
                {projects.length === 0 ? (
                  <p className="text-center py-8 text-gray-400 text-sm">📭 Belum ada project</p>
                ) : projects.map(p => (
                  <div key={p.id} className="bg-white rounded-2xl p-4"
                    style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-bold text-gray-800">{p.nama}</p>
                      <span className="text-xs font-extrabold" style={{ color: '#dc2626' }}>{p.progress}%</span>
                    </div>
                    {p.deskripsi && <p className="text-xs text-gray-400 mb-2">{p.deskripsi}</p>}
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                      <div className="h-full rounded-full"
                        style={{ width: `${p.progress}%`, background: 'linear-gradient(135deg, #dc2626, #f97316)' }}
                      />
                    </div>
                    <input
                      type="range" min="0" max="100"
                      value={p.progress}
                      onChange={e => updateProgress(p.id, Number(e.target.value))}
                      className="w-full"
                    />
                    {p.target_date && (
                      <p className="text-[10px] text-gray-400 mt-1">
                        🎯 Target: {new Date(p.target_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Reminders Tab */}
            {activeTab === 'reminders' && (
              <div className="space-y-3">
                {reminders.length === 0 ? (
                  <p className="text-center py-8 text-gray-400 text-sm">📭 Belum ada reminder</p>
                ) : reminders.map(r => (
                  <div key={r.id}
                    className="bg-white rounded-2xl p-4 flex items-start gap-3"
                    style={{
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                      opacity: r.is_done ? 0.5 : 1
                    }}
                  >
                    <button
                      onClick={() => toggleReminder(r.id, r.is_done)}
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{
                        background: r.is_done
                          ? 'linear-gradient(135deg, #16a34a, #22c55e)'
                          : '#f3f4f6'
                      }}
                    >
                      {r.is_done && <Check size={12} color="white" weight="bold" />}
                    </button>
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${r.is_done ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                        {r.judul}
                      </p>
                      {r.deskripsi && <p className="text-xs text-gray-400 mt-0.5">{r.deskripsi}</p>}
                      {r.deadline && (
                        <p className="text-[10px] text-red-400 font-bold mt-1">
                          ⏰ {new Date(r.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <p className="text-center text-xs text-gray-400 pb-6">
          DOKB Command Center — {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
