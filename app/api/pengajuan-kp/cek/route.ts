import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const nik = req.nextUrl.searchParams.get('nik')

  if (!nik || !/^\d{16}$/.test(nik)) {
    return NextResponse.json({ success: false, message: 'NIK tidak valid.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('pengajuan_kp')
    .select('*')
    .eq('nik', nik)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan server.' }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json(
      { success: false, message: 'Pengajuan dengan NIK ini tidak ditemukan, atau sudah diverifikasi/ditolak sehingga tidak dapat diubah.' },
      { status: 404 }
    )
  }

  return NextResponse.json({ success: true, data })
       }
