'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ShieldCheck, Eye, EyeSlash } from '@phosphor-icons/react'

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)
  const router = useRouter()

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      setError('Email dan password wajib diisi!')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password
      })
      if (error) {
        setError('Email atau password salah!')
      } else if (data.session) {
        router.push('/admin/dashboard')
      }
    } catch {
      setError('Gagal login, coba lagi!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #fef2f2 0%, #fff7ed 100%)' }}
    >
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full"
        style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #b91c1c, #f97316)' }}
          >
            <ShieldCheck size={32} color="white" weight="fill" />
          </div>
          <h1 className="text-xl font-extrabold text-gray-800"
            style={{ fontFamily: 'var(--font-plus-jakarta)' }}
          >
            Admin DOKB
          </h1>
          <p className="text-xs text-gray-400 mt-1">Command Center</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-700">Email</label>
            <input
              type="email"
              placeholder="email@dokb.or.id"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl py-3 px-4 text-sm mt-2 focus:outline-none font-medium"
              style={{ background: '#f8f8fa', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            />
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700">Password</label>
            <div className="relative mt-2">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-xl py-3 pl-4 pr-10 text-sm focus:outline-none font-medium"
                style={{ background: '#f8f8fa', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              />
              <button
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-3 text-gray-400"
              >
                {showPass ? <EyeSlash size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl p-3" style={{ background: '#fef2f2' }}>
              <p className="text-red-600 text-sm font-semibold">⚠️ {error}</p>
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-4 rounded-2xl font-extrabold text-sm text-white disabled:opacity-50 transition-all"
            style={{
              background: 'linear-gradient(135deg, #b91c1c, #dc2626, #f97316)',
              boxShadow: '0 6px 20px rgba(220,38,38,0.4)'
            }}
          >
            {loading ? '⏳ Masuk...' : '🔐 MASUK'}
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Khusus Pengurus DOKB
        </p>
      </div>
    </div>
  )
}
