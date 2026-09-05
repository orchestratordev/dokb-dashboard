import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()

    // Pastikan pengajuan masih berstatus pending sebelum diizinkan diubah
    const { data: existing, error: fetchError } = await supabase
      .from('pengajuan_kp')
      .select('status')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ success: false, message: 'Pengajuan tidak ditemukan.' }, { status: 404 })
    }

    if (existing.status !== 'pending') {
      return NextResponse.json(
        { success: false, message: 'Pengajuan ini sudah diverifikasi/ditolak dan tidak dapat diubah lagi.' },
        { status: 400 }
      )
    }

    const {
      nama, tempat_lahir, tanggal_lahir, alamat, lokasi, no_hp, email,
      jenis_kendaraan, merk_type, no_pol, no_rangka, no_mesin,
      warna_kendaraan, masa_berlaku_stnk, masa_berlaku_skpd,
      platform, lama_bergabung, status_keanggotaan, no_kta,
      dokumen
    } = body

    const updatePayload: Record<string, any> = {
      nama, tempat_lahir: tempat_lahir || null, tanggal_lahir: tanggal_lahir || null,
      alamat, lokasi, no_hp, email: email || null,
      jenis_kendaraan, merk_type, no_pol,
      no_rangka: no_rangka || null, no_mesin: no_mesin || null,
      warna_kendaraan: warna_kendaraan || null,
      masa_berlaku_stnk: masa_berlaku_stnk || null,
      masa_berlaku_skpd: masa_berlaku_skpd || null,
      platform, lama_bergabung: lama_bergabung || null,
      status_keanggotaan: status_keanggotaan || null, no_kta: no_kta || null
    }

    // Dokumen hanya diupdate kalau ada file baru yang diupload (URL baru)
    if (dokumen) {
      if (dokumen.ktp) updatePayload.dok_ktp = dokumen.ktp
      if (dokumen.sim) updatePayload.dok_sim = dokumen.sim
      if (dokumen.stnk) updatePayload.dok_stnk = dokumen.stnk
      if (dokumen.skpd) updatePayload.dok_skpd = dokumen.skpd
      if (dokumen.kendaraan_depan) updatePayload.dok_kendaraan_depan = dokumen.kendaraan_depan
      if (dokumen.kendaraan_belakang) updatePayload.dok_kendaraan_belakang = dokumen.kendaraan_belakang
      if (dokumen.kendaraan_samping) updatePayload.dok_kendaraan_samping = dokumen.kendaraan_samping
      if (dokumen.buku_servis) updatePayload.dok_buku_servis = dokumen.buku_servis
    }

    const { error: updateError } = await supabase
      .from('pengajuan_kp')
      .update(updatePayload)
      .eq('id', id)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json({ success: false, message: 'Gagal menyimpan perubahan.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Update pengajuan error:', err)
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan pada server.' }, { status: 500 })
  }
      }
