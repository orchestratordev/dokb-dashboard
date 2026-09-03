# CLAUDE.md - Konteks Proyek & Organisasi

## 1. Identitas & Bahasa
- Nama: Pak Jani (Subhi Azani), Sekretaris Jenderal DOKB (Perkumpulan Driver Online Kalimantan Selatan Bersatu).
- Bahasa yang digunakan: **Bahasa Indonesia** (formal/profesional untuk dokumen, lugas untuk kode).
- Gaya komunikasi: Tegas, berbasis data, tidak emosional. Slogan: "Bicara dengan Data, Bergerak dengan Sistem, Menang Tanpa Ribut."
- Zona waktu: **WITA (Asia/Makassar)**. Semua format waktu menggunakan zona ini.

## 2. Teknologi & Stack (Wajib Diikuti)
- **Framework:** Next.js (App Router) + React + TypeScript.
- **Styling:** Tailwind CSS (CDN untuk halaman statis).
- **Database:** Supabase (PostgreSQL, Storage untuk screenshot).
- **Notifikasi:** Fonnte (WhatsApp API).
- **AI Gateway:** NaraRouter (untuk Personal Dashboard) & Groq API (untuk aplikasi Lapor Tarif).
- **Environment:** Utamakan Mobile-first (dikembangkan di HP Android via Termux/Acode).
- **Aturan Kode:** Hindari Emoji di dalam logika kode (baris JS/TS) agar tidak error build. Gunakan format waktu `Intl.DateTimeFormat` dengan `timeZone: 'Asia/Makassar'`.

## 3. Proyek Aktif
- **lapor.dokb.or.id:** Aplikasi Lapor Tarif ASK (Next.js, Supabase, Groq). 
  - Fitur: Input laporan driver/masyarakat, upload 5 screenshot, analisis AI, notifikasi WA.
- **dokb.or.id:** Landing page statis (HTML + Tailwind CDN).
- **dashboard.dokb.or.id:** Personal Dashboard Sekjen (Next.js + Supabase + NaraRouter).
- **Rencana:** **kp.dokb.or.id** (Registrasi Kartu Pengawasan ASK - Input driver, verifikasi oleh Dishub/Lantas).

## 4. Konteks Advokasi & Regulasi (Informasi Penting)
- **SK Gubernur Kalsel No. 100.3.3.1/0991/KUM/2025** (Flagfall Rp 16.000, TBB Rp 4.000/km, TBA Rp 6.500/km).
- Draf **SK 2026** (Flagfall Rp 20.000, larangan Blended Rate).
- Modus pelanggaran: Blended rate (tarif flat per km), Multi-stop tanpa kompensasi, rute R2 vs R4.

## 5. Tim AI (The Elite Five)
- **Chatty (GPT):** Arsitek Sistem & Penyempurna Bahasa Formal.
- **Claudia (Claude):** QA Architect & Product Builder.
- **Gemmy (Gemini):** Research & Data Agent.
- **Metoy (Meta):** Personal Assistant.
- **Dee (DeepSeek):** AI Integration Architect (Koding, Debugging, Data).
- **KIMI:** Content Director (Medsos & Branding).

## 6. Tugas yang Sering Diminta
- Menulis kode Next.js (komponen, halaman, route API).
- Membuat draf surat resmi (ke Dishub, DPR RI, aplikator).
- Menganalisis data laporan tarif.
- Membuat prompt untuk analisis AI.
- Menyusun strategi branding dan konten media sosial.
