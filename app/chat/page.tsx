'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────
type Message = {
  id?: string
  role: 'user' | 'assistant'
  content: string
  created_at?: string
}

// ─── System Prompt ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `######################################################################
CLAUDE MASTER OPERATING SYSTEM
ENTERPRISE EDITION V2 — DOKB PROJECT
######################################################################

You are Claudia — a warm, direct, and deeply context-aware AI system.
You are a trusted senior advisor who knows the user's context deeply,
speaks with clarity and warmth, and never wastes words on formality
when action is needed.

PRIMARY USER: Subhi Azani (Pak Jani)
ROLE: Sekretaris Jenderal DOKB (Perkumpulan Driver Online Kalimantan Selatan Bersatu)

KEY CONTEXT:
- DOKB memperjuangkan tarif ASK Kalsel berbasis data BOK
- SK Gubernur Kalsel No. 0991/2025: TBB Rp4.000/km, Flagfall Rp16.000 (NET driver)
- Usulan DOKB: TBB Rp5.000/km, Flagfall Rp20.000
- Platform: lapor.dokb.or.id, dashboard.dokb.or.id
- Rapat koordinasi: 26 Juni 2026 bersama Dishub, Forkopimda, Aplikator, Biro Hukum, YLKI
- Grab dan Gojek sudah sepakat, Maxim masih mengulur

CORE PRINCIPLES:
- Legalitas di atas emosi
- Regulasi di atas opini
- Data di atas asumsi
- Sistem di atas spontanitas

COMMUNICATION STYLE:
- Bahasa Indonesia, hangat, humor sesekali
- Langsung ke inti, tidak bertele-tele
- Panggil user "Pak Jani"
- Respons singkat untuk pertanyaan singkat, detail untuk pertanyaan kompleks

######################################################################`

export default function ChatPage() {
  const [messages, setMessages]   = useState<Message[]>([])
  const [input,    setInput]      = useState('')
  const [loading,  setLoading]    = useState(false)
  const [fetching, setFetching]   = useState(true)
  const [authed,   setAuthed]     = useState(false)
  const bottomRef  = useRef<HTMLDivElement>(null)
  const inputRef   = useRef<HTMLTextAreaElement>(null)

  // ── Auth check ──────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session)
      if (data.session) loadHistory()
      else setFetching(false)
    })
  }, [])

  // ── Load history ─────────────────────────────────────────────────────────────
  async function loadHistory() {
    setFetching(true)
    const { data } = await supabase
      .from('chat_history')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(100)
    if (data) setMessages(data as Message[])
    setFetching(false)
  }

  // ── Scroll to bottom ─────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // ── Send message ─────────────────────────────────────────────────────────────
  async function sendMessage() {
    if (!input.trim() || loading) return

    const userMsg: Message = { role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    // Save user message to Supabase
    if (authed) {
      await supabase.from('chat_history').insert({
        role: 'user',
        content: userMsg.content
      })
    }

    try {
      // Build messages array for API
      const apiMessages = [
        ...messages.slice(-20), // last 20 messages for context
        userMsg
      ].map(m => ({ role: m.role, content: m.content }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages })
      })

      const data = await response.json()
      const assistantContent = data.content || 'Maaf, saya tidak bisa merespons saat ini.'

      const assistantMsg: Message = {
        role: 'assistant',
        content: assistantContent
      }

      setMessages(prev => [...prev, assistantMsg])

      // Save assistant message to Supabase
      if (authed) {
        await supabase.from('chat_history').insert({
          role: 'assistant',
          content: assistantContent
        })
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Maaf Pak Jani, ada gangguan koneksi. Coba lagi ya! 🙏'
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  // ── Clear history ─────────────────────────────────────────────────────────────
  async function clearHistory() {
    if (!confirm('Hapus semua riwayat chat?')) return
    await supabase.from('chat_history').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    setMessages([])
  }

  // ── Handle enter ──────────────────────────────────────────────────────────────
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // ── Format content with basic markdown ───────────────────────────────────────
  function formatContent(text: string) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code style="background:#f3f4f6;padding:1px 5px;border-radius:4px;font-size:12px;font-family:monospace">$1</code>')
      .replace(/\n/g, '<br/>')
  }

  // ── Not authenticated ─────────────────────────────────────────────────────────
  if (!authed && !fetching) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#f5f5f7', fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", padding: 20
      }}>
        <div style={{ textAlign: 'center', maxWidth: 360 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Login Diperlukan</h2>
          <p style={{ fontSize: 14, color: '#667085', marginBottom: 20 }}>
            AI Assistant hanya untuk pengurus DOKB yang sudah login.
          </p>
          <a href="/admin" style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #b91c1c, #f97316)',
            color: '#fff', padding: '12px 28px', borderRadius: 12,
            fontWeight: 700, fontSize: 14, textDecoration: 'none'
          }}>
            Login ke Admin
          </a>
        </div>
      </div>
    )
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', Inter, -apple-system, sans-serif; }
        textarea { font-family: inherit; }
        .msg-bubble { animation: fadeUp 0.2s ease; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .typing-dot { animation: blink 1.2s infinite; }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes blink { 0%,100%{opacity:.2} 50%{opacity:1} }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #d5d9e0; border-radius: 4px; }
      `}</style>

      <div style={{
        display: 'flex', flexDirection: 'column',
        height: '100dvh', maxWidth: 760, margin: '0 auto',
        background: '#fff', position: 'relative'
      }}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px',
          borderBottom: '1px solid #e5e7eb',
          background: '#fff',
          position: 'sticky', top: 0, zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <a href="/" style={{ color: '#6b7280', textDecoration: 'none', fontSize: 20, lineHeight: 1 }}>←</a>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #b91c1c, #f97316)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18
            }}>🤖</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: '-.01em' }}>Claudia</div>
              <div style={{ fontSize: 11.5, color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, background: '#16a34a', borderRadius: '50%', display: 'inline-block' }} />
                Online · DOKB AI Assistant
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={loadHistory} style={{
              background: 'none', border: '1px solid #e5e7eb', borderRadius: 8,
              padding: '6px 10px', fontSize: 12, fontWeight: 600, color: '#6b7280', cursor: 'pointer'
            }}>🔄</button>
            <button onClick={clearHistory} style={{
              background: 'none', border: '1px solid #fee2e2', borderRadius: 8,
              padding: '6px 10px', fontSize: 12, fontWeight: 600, color: '#dc2626', cursor: 'pointer'
            }}>🗑️</button>
          </div>
        </header>

        {/* ── Messages ────────────────────────────────────────────────────── */}
        <div style={{
          flex: 1, overflowY: 'auto',
          padding: '20px 18px',
          display: 'flex', flexDirection: 'column', gap: 16
        }}>

          {/* Welcome message */}
          {messages.length === 0 && !fetching && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>👋</div>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, letterSpacing: '-.015em' }}>
                Halo Pak Jani!
              </h2>
              <p style={{ fontSize: 14, color: '#667085', lineHeight: 1.6, maxWidth: 380, margin: '0 auto' }}>
                Saya <strong>Claudia</strong> — AI Assistant DOKB Anda. Saya siap bantu strategi, regulasi, coding, analisis, atau apapun yang Pak Jani butuhkan.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, maxWidth: 420, margin: '20px auto 0' }}>
                {[
                  '📋 Buat surat resmi ke Dishub',
                  '📊 Analisis data laporan tarif',
                  '⚖️ Strategi advokasi SK Gubernur',
                  '💻 Bantu debug kode Next.js',
                ].map((s, i) => (
                  <button key={i}
                    onClick={() => setInput(s.slice(3))}
                    style={{
                      background: '#f9f9fb', border: '1px solid #e5e7eb',
                      borderRadius: 10, padding: '10px 12px',
                      fontSize: 12.5, fontWeight: 600, color: '#374151',
                      cursor: 'pointer', textAlign: 'left', lineHeight: 1.4
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading history */}
          {fetching && (
            <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13, padding: '40px 0' }}>
              ⏳ Memuat riwayat chat...
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, i) => (
            <div key={i} className="msg-bubble" style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              gap: 10, alignItems: 'flex-end'
            }}>
              {/* Avatar - assistant */}
              {msg.role === 'assistant' && (
                <div style={{
                  width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                  background: 'linear-gradient(135deg, #b91c1c, #f97316)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16
                }}>🤖</div>
              )}

              {/* Bubble */}
              <div style={{
                maxWidth: '75%',
                padding: '12px 15px',
                borderRadius: msg.role === 'user'
                  ? '18px 18px 4px 18px'
                  : '18px 18px 18px 4px',
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, #b91c1c, #dc2626)'
                  : '#f9f9fb',
                color: msg.role === 'user' ? '#fff' : '#171a1f',
                fontSize: 14,
                lineHeight: 1.6,
                border: msg.role === 'assistant' ? '1px solid #e5e7eb' : 'none',
                boxShadow: msg.role === 'user'
                  ? '0 4px 12px rgba(185,28,28,0.25)'
                  : '0 1px 4px rgba(0,0,0,.06)'
              }}
                dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
              />

              {/* Avatar - user */}
              {msg.role === 'user' && (
                <div style={{
                  width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                  background: '#1e293b',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 800, color: '#fff'
                }}>PJ</div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="msg-bubble" style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: 'linear-gradient(135deg, #b91c1c, #f97316)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16
              }}>🤖</div>
              <div style={{
                padding: '14px 18px',
                borderRadius: '18px 18px 18px 4px',
                background: '#f9f9fb',
                border: '1px solid #e5e7eb',
                display: 'flex', gap: 5, alignItems: 'center'
              }}>
                {[0,1,2].map(i => (
                  <span key={i} className="typing-dot" style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: '#9ca3af', display: 'block'
                  }} />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* ── Input Area ──────────────────────────────────────────────────── */}
        <div style={{
          padding: '12px 16px 20px',
          borderTop: '1px solid #e5e7eb',
          background: '#fff'
        }}>
          <div style={{
            display: 'flex', gap: 10, alignItems: 'flex-end',
            background: '#f9f9fb',
            border: '1.5px solid #e5e7eb',
            borderRadius: 16, padding: '10px 12px',
            transition: 'border-color .15s'
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tanya apapun ke Claudia... (Enter untuk kirim, Shift+Enter untuk baris baru)"
              rows={1}
              style={{
                flex: 1, background: 'none', border: 'none',
                outline: 'none', resize: 'none',
                fontSize: 14, lineHeight: 1.5, color: '#171a1f',
                maxHeight: 120, overflowY: 'auto'
              }}
              onInput={e => {
                const t = e.target as HTMLTextAreaElement
                t.style.height = 'auto'
                t.style.height = Math.min(t.scrollHeight, 120) + 'px'
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              style={{
                flexShrink: 0,
                width: 36, height: 36,
                borderRadius: 10, border: 'none',
                background: input.trim() && !loading
                  ? 'linear-gradient(135deg, #b91c1c, #f97316)'
                  : '#e5e7eb',
                color: input.trim() && !loading ? '#fff' : '#9ca3af',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                transition: 'all .15s', fontSize: 16
              }}
            >
              {loading ? '⏳' : '↑'}
            </button>
          </div>
          <p style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', marginTop: 8 }}>
            Claudia · DOKB AI Assistant · Powered by Claude Fable 5 via NaraRouter
          </p>
        </div>

      </div>
    </>
  )
        }
