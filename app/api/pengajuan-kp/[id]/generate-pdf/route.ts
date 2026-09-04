import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import fs from 'fs/promises'
import path from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const BUCKET = 'kp-dokumen'

// Ukuran halaman A4 potret (dalam points)
const PAGE_W = 595.28
const PAGE_H = 841.89
const MARGIN = 40

// ── Data tetap Pihak 1 (DOKB) ──
const KETUA_DOKB_NAMA = 'Ardiansyah'
const KETUA_DOKB_NIK = '6371050409750003'

async function embedImageFromUrl(pdfDoc: PDFDocument, url: string) {
  const res = await fetch(url)
  const bytes = new Uint8Array(await res.arrayBuffer())
  const contentType = res.headers.get('content-type') || ''

  try {
    if (contentType.includes('png') || url.toLowerCase().endsWith('.png')) {
      return await pdfDoc.embedPng(bytes)
    }
    return await pdfDoc.embedJpg(bytes)
  } catch {
    try {
      return await pdfDoc.embedPng(bytes)
    } catch {
      return await pdfDoc.embedJpg(bytes)
    }
  }
}

async function embedLogoDokb(pdfDoc: PDFDocument) {
  const logoPath = path.join(process.cwd(), 'public', 'logo-dokb.png')
  const bytes = await fs.readFile(logoPath)
  return await pdfDoc.embedPng(bytes)
}

async function buatHalamanFoto(pdfDoc: PDFDocument, urls: string[]) {
  const page = pdfDoc.addPage([PAGE_W, PAGE_H])
  const usableW = PAGE_W - MARGIN * 2
  const gap = 14
  const slotH = (PAGE_H - MARGIN * 2 - gap * 3) / 4

  let y = PAGE_H - MARGIN

  for (const url of urls) {
    const img = await embedImageFromUrl(pdfDoc, url)
    const scale = Math.min(usableW / img.width, slotH / img.height)
    const w = img.width * scale
    const h = img.height * scale
    const x = MARGIN + (usableW - w) / 2
    y -= slotH
    page.drawImage(img, {
      x,
      y: y + (slotH - h) / 2,
      width: w,
      height: h
    })
    y -= gap
  }

  return page
}

function formatTanggalIndo(date: Date) {
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

async function buatHalamanPerjanjian(pdfDoc: PDFDocument, data: any) {
  const page = pdfDoc.addPage([PAGE_W, PAGE_H])
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const marginX = MARGIN
  let y = PAGE_H - MARGIN
  const lineHeight = 14
  const bodySize = 9.5

  // ── Kop Surat (logo DOKB) ──
  try {
    const logo = await embedLogoDokb(pdfDoc)
    const maxLogoW = PAGE_W - marginX * 2
    const maxLogoH = 70
    const scale = Math.min(maxLogoW / logo.width, maxLogoH / logo.height)
    const w = logo.width * scale
    const h = logo.height * scale
    const x = (PAGE_W - w) / 2
    y -= h
    page.drawImage(logo, { x, y, width: w, height: h })
    y -= 10
    // Garis pemisah di bawah kop surat
    page.drawLine({
      start: { x: marginX, y },
      end: { x: PAGE_W - marginX, y },
      thickness: 1,
      color: rgb(0.7, 0.7, 0.7)
    })
    y -= 20
  } catch (err) {
    console.error('Gagal memuat logo DOKB:', err)
    // Tetap lanjut tanpa kop surat kalau logo gagal dimuat
  }

  const drawText = (text: string, opts: { size?: number; bold?: boolean; center?: boolean } = {}) => {
    const size = opts.size || bodySize
    const usedFont = opts.bold ? fontBold : font
    const textWidth = usedFont.widthOfTextAtSize(text, size)
    const x = opts.center ? (PAGE_W - textWidth) / 2 : marginX
    page.drawText(text, { x, y, size, font: usedFont, color: rgb(0.1, 0.1, 0.1) })
    y -= lineHeight
  }

  const wrapText = (text: string, maxWidth: number, size: number) => {
    const words = text.split(' ')
    const lines: string[] = []
    let current = ''
    for (const word of words) {
      const test = current ? `${current} ${word}` : word
      if (font.widthOfTextAtSize(test, size) > maxWidth && current) {
        lines.push(current)
        current = word
      } else {
        current = test
      }
    }
    if (current) lines.push(current)
    return lines
  }

  const tanggal = formatTanggalIndo(new Date())

  drawText('SURAT PERJANJIAN KERJASAMA', { size: 13, bold: true, center: true })
  y -= 10

  const pembuka = `Pada hari ini, ${tanggal}, telah disepakati perjanjian kerjasama antara:`
  for (const line of wrapText(pembuka, PAGE_W - marginX * 2, bodySize)) drawText(line)
  y -= 6

  drawText('DOKB — Perkumpulan Driver Online Kalimantan Selatan Bersatu, dalam hal ini diwakili oleh:')
  y -= 4
  drawText(`Nama        : ${KETUA_DOKB_NAMA}`)
  drawText(`NIK           : ${KETUA_DOKB_NIK}`)
  drawText(`Jabatan     : Ketua DOKB`)
  y -= 6
  drawText('Selanjutnya disebut sebagai PIHAK 1', { bold: true })
  y -= 10

  drawText('Dengan pihak driver:')
  y -= 4
  drawText(`Nama        : ${data.nama}`)
  drawText(`NIK           : ${data.nik}`)
  drawText(`Jabatan     : Driver Angkutan Sewa Khusus`)
  drawText(`Kendaraan : ${data.merk_type} — No. Pol ${data.no_pol}`)
  drawText(`No. Rangka: ${data.no_rangka || '-'}   No. Mesin: ${data.no_mesin || '-'}`)
  y -= 6
  drawText('Selanjutnya disebut sebagai PIHAK 2', { bold: true })
  y -= 14

  drawText('Dengan kesepakatan perjanjian sebagai berikut:', { bold: true })
  y -= 4

  const poin = [
    'PIHAK 1 dan PIHAK 2 sepakat menjalin kerjasama untuk mendukung usaha PIHAK 2 sebagai driver Angkutan Sewa Khusus.',
    'PIHAK 1 mendampingi dan memfasilitasi PIHAK 2 dalam kerjasama yang saling menguntungkan.',
    'PIHAK 2 menyetujui dan mendaftarkan diri kepada PIHAK 1 untuk keperluan pengurusan Kartu Pengawasan Angkutan Sewa Khusus.',
    'PIHAK 1 membantu memenuhi persyaratan dalam pengurusan perizinan dan pengawasan Angkutan Sewa Khusus.',
    'PIHAK 2 bersedia memenuhi persyaratan yang ditetapkan oleh PIHAK 1.',
    'PIHAK 2 bersedia memenuhi kebutuhan administrasi yang diperlukan antara kedua pihak.',
    'Hal-hal yang belum diatur dalam perjanjian ini akan dibahas selanjutnya secara musyawarah.'
  ]

  poin.forEach((p, i) => {
    const wrapped = wrapText(`${i + 1}. ${p}`, PAGE_W - marginX * 2, bodySize)
    wrapped.forEach((line, idx) => {
      const x = marginX + (idx > 0 ? 14 : 0)
      page.drawText(line, { x, y, size: bodySize, font, color: rgb(0.1, 0.1, 0.1) })
      y -= lineHeight
    })
    y -= 2
  })

  y -= 20
  drawText(`Banjarmasin, ${tanggal}`)
  y -= 40

  const colW = (PAGE_W - marginX * 2) / 2
  page.drawText('PIHAK 1', { x: marginX, y, size: bodySize, font: fontBold, color: rgb(0.1, 0.1, 0.1) })
  page.drawText('PIHAK 2', { x: marginX + colW, y, size: bodySize, font: fontBold, color: rgb(0.1, 0.1, 0.1) })
  y -= 55
  page.drawText(KETUA_DOKB_NAMA, { x: marginX, y, size: bodySize, font, color: rgb(0.1, 0.1, 0.1) })
  page.drawText(data.nama, { x: marginX + colW, y, size: bodySize, font, color: rgb(0.1, 0.1, 0.1) })
  y -= 14
  page.drawText('Ketua DOKB', { x: marginX, y, size: 8, font, color: rgb(0.4, 0.4, 0.4) })

  return page
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const { data, error } = await supabase
      .from('pengajuan_kp')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ success: false, message: 'Pengajuan tidak ditemukan.' }, { status: 404 })
    }

    if (data.status !== 'diverifikasi') {
      return NextResponse.json(
        { success: false, message: 'Pengajuan harus diverifikasi terlebih dahulu.' },
        { status: 400 }
      )
    }

    const pdfDoc = await PDFDocument.create()

    // Halaman 1: KTP, SIM, STNK, SKPD
    await buatHalamanFoto(pdfDoc, [data.dok_ktp, data.dok_sim, data.dok_stnk, data.dok_skpd])

    // Halaman 2: Foto kendaraan + buku servis
    await buatHalamanFoto(pdfDoc, [
      data.dok_kendaraan_depan,
      data.dok_kendaraan_belakang,
      data.dok_kendaraan_samping,
      data.dok_buku_servis
    ])

    // Halaman 3: Surat Perjanjian Kerjasama (dengan kop surat DOKB)
    await buatHalamanPerjanjian(pdfDoc, data)

    const pdfBytes = await pdfDoc.save()

    const fileName = `dosier_${id}.pdf`
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true
      })

    if (uploadError) {
      console.error('Upload PDF error:', uploadError)
      return NextResponse.json({ success: false, message: 'Gagal mengupload PDF.' }, { status: 500 })
    }

    const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(fileName)
    const pdfUrl = publicUrlData.publicUrl

    await supabase
      .from('pengajuan_kp')
      .update({ pdf_dosier_url: pdfUrl })
      .eq('id', id)

    return NextResponse.json({ success: true, url: pdfUrl })
  } catch (err) {
    console.error('Generate PDF error:', err)
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan saat membuat PDF.' }, { status: 500 })
  }
    }
      
