# Panduan Deployment & Konfigurasi

## 1. Mendapatkan API Keys dari Supabase

Untuk menghubungkan aplikasi Anda dengan Supabase, Anda memerlukan URL dan Anon Key.

1.  Login ke [Supabase Dashboard](https://supabase.com/dashboard).
2.  Pilih Project **Lang STR**.
3.  Klik icon **Settings** (roda gigi) di bagian bawah menu kiri.
4.  Pilih menu **API**.
5.  Di bagian **Project URL**, salin URL yang tertera.
6.  Di bagian **Project API keys**, salin key dengan label `anon` `public`.

## 2. Konfigurasi Deployment ke Vercel

Aplikasi ini sudah siap untuk dideploy ke Vercel. Berikut langkah-langkahnya:

1.  **Push ke GitHub/GitLab/Bitbucket**:
    - Pastikan kode sumber proyek ini sudah di-push ke repository Git Anda.

2.  **Buat Project Baru di Vercel**:
    - Login ke [Vercel Dashboard](https://vercel.com/dashboard).
    - Klik **Add New...** > **Project**.
    - Import repository Git yang baru saja Anda buat.

3.  **Konfigurasi Environment Variables**:
    - Di halaman konfigurasi project Vercel ("Configure Project"), cari bagian **Environment Variables**.
    - Masukkan variabel-variabel berikut (sama seperti di `.env.local`):

    | Key | Value |
    | --- | --- |
    | `NEXT_PUBLIC_SUPABASE_URL` | URL Project Supabase Anda |
    | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon Key Supabase Anda |
    | `NEXT_PUBLIC_WHATSAPP_NUMBER` | Nomor WhatsApp (cth: `6281234567890`) |

4.  **Deploy**:
    - Klik tombol **Deploy**.
    - Tunggu proses build selesai.

## 3. Fitur Kompresi Gambar Otomatis

Sesuai permintaan, sistem upload gambar telah diperbarui:

- **Otomatis Convert ke WebP**: Semua gambar yang diupload akan dikonversi ke format WebP yang jauh lebih ringan.
- **Resize Otomatis**: Gambar akan di-resize jika ukurannya terlalu besar (maksimal lebar/tinggi 1024px).
- **Kompresi**: Kualitas gambar disesuaikan agar ukuran file tetap kecil (target di bawah 500KB) tanpa mengorbankan ketajaman yang terlihat.
- **Hemat Storage**: Ini akan sangat menghemat kuota Storage Supabase Anda dan mempercepat loading website.

Fitur ini berjalan otomatis di browser (client-side) sebelum gambar dikirim ke server.
