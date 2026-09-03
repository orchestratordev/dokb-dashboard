import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      nama, nik, tempat_lahir, tanggal_lahir, alamat, lokasi, no_hp, email,
      jenis_kendaraan, merk_type, no_pol, no_rangka, no_mesin, masa_berlaku_stnk,
      platform, lama_bergabung, status_keanggotaan, no_kta,
      dokumen
    } = body

    // ── Validasi field wajib ──
    if (!nama || !nik || !alamat || !lokasi || !no_hp) {
      return NextResponse.json(
        { success: false, message: 'Data pribadi wajib dilengkapi.' },
        { status: 400 }
      )
    }
    if (!jenis_kendaraan || !merk_type || !no_pol) {
      return NextResponse.json(
        { success: false, message: 'Data kendaraan wajib dilengkapi.' },
        { status: 400 }
      )
    }
    if (!platform || platform.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Pilih minimal satu aplikator.' },
        { status: 400 }
      )
    }

    const dokumenWajib = [
      'ktp', 'sim', 'stnk',
      'kendaraan_depan', 'kendaraan_belakang', 'kendaraan_samping',
      'buku_servis'
    ]
    const dokumenKurang = dokumenWajib.filter(key => !dokumen?.[key])
    if (dokumenKurang.length > 0) {
      return NextResponse.json(
        { success: false, message: `Dokumen belum lengkap: ${dokumenKurang.join(', ')}` },
        { status: 400 }
      )
    }

    // NIK harus 16 digit
    if (!/^\d{16}$/.test(nik)) {
      return NextResponse.json(
        { success: false, message: 'NIK harus terdiri dari 16 digit angka.' },
        { status: 400 }
      )
    }

    // ── Insert ke Supabase ──
    const { data, error } = await supabase
      .from('pengajuan_kp')
      .insert({
        nama,
        nik,
        tempat_lahir: tempat_lahir || null,
        tanggal_lahir: tanggal_lahir || null,
        alamat,
        lokasi,
        no_hp,
        email: email || null,
        jenis_kendaraan,
        merk_type,
        no_pol,
        no_rangka: no_rangka || null,
        no_mesin: no_mesin || null,
        masa_berlaku_stnk: masa_berlaku_stnk || null,
        platform,
        lama_bergabung: lama_bergabung || null,
        status_keanggotaan: status_keanggotaan || null,
        no_kta: no_kta || null,
        dok_ktp: dokumen.ktp,
        dok_sim: dokumen.sim,
        dok_stnk: dokumen.stnk,
        dok_kendaraan_depan: dokumen.kendaraan_depan,
        dok_kendaraan_belakang: dokumen.kendaraan_belakang,
        dok_kendaraan_samping: dokumen.kendaraan_samping,
        dok_buku_servis: dokumen.buku_servis,
        status: 'pending'
      })
      .select('id')
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json(
        { success: false, message: 'Gagal menyimpan pengajuan. Coba lagi.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, id: data.id })
  } catch (err) {
    console.error('Pengajuan KP error:', err)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    )
  }
        }
    
