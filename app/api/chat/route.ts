import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `Kamu adalah Claudia — AI Assistant DOKB. Pak Jani adalah Sekjend DOKB Kalsel. Kamu memahami konteks perjuangan tarif ASK, SK Gubernur No. 100.3.3.1/0991/2025, dan semua project DOKB. Komunikasi hangat, langsung, bahasa Indonesia.`

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    const response = await fetch('https://router.bynara.id/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.BYNARA_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-fable-5',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages
        ],
        max_tokens: 1000
      })
    })

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || 'Maaf, tidak ada respons.'

    return NextResponse.json({ content })
  } catch (error) {
    return NextResponse.json({ content: 'Gagal menghubungi AI.' }, { status: 500 })
  }
  }
