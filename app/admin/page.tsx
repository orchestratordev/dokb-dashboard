'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AdminLogin() {
  const [form, setForm] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full">

        <div className="text-center mb-6">
          <p className="text-3xl mb-2">🔐</p>
          <h1 className="text-xl font-bold text-gray-800">Admin DOKB</h1>
          <p className="text-xs text-gray-400 mt-1">Kartu Pengawasan — Tim Pengawas ASK</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700">Email</label>
            <input
              type="email"
              placeholder="email@dokb.or.id"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-200 rounded-xl py-3 px-4 text-sm mt-2 focus:outline-none focus:border-red-400"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full border border-gray-200 rounded-xl py-3 px-4 text-sm mt-2 focus:outline-none focus:border-red-400"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-red-600 text-sm">⚠️ {error}</p>
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 rounded-xl font-bold text-sm disabled:opacity-50 active:scale-95 transition-all"
          >
            {loading ? '⏳ Masuk...' : '🔐 MASUK'}
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Khusus Tim Pengawas ASK &amp; DOKB
        </p>
      </div>
    </div>
  )
}
