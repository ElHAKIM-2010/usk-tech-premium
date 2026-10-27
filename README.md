# USK Tech Premium

Toko elektronik premium terjangkau: katalog, keranjang, checkout transfer bank, riwayat pesanan, dan panel admin. Dibangun dengan Next.js App Router, TypeScript, Tailwind CSS, Auth.js, Drizzle ORM, dan Neon PostgreSQL.

Situs produksi: https://usk-tech-premium.vercel.app

## Menjalankan secara lokal

1. Salin env yang dibutuhkan ke `.env.local`:
   - `DATABASE_URL` — connection string Neon **pooled** (wajib, untuk runtime).
   - `DATABASE_URL_UNPOOLED` — connection string langsung (dipakai migrasi/script).
   - `AUTH_SECRET` — secret acak untuk sesi Auth.js (wajib).
   - `BANK_NAME`, `BANK_ACCOUNT_NUMBER`, `BANK_ACCOUNT_HOLDER` — opsional; jika kosong, halaman pesanan menampilkan peringatan bahwa rekening belum diatur.
2. `npm install`
3. `npm run db:migrate` — menerapkan migrasi Drizzle ke database.
4. `npm run db:seed` — mengisi katalog awal (opsional).
5. `npm run dev` — buka http://localhost:3000

Jadikan akun admin setelah akun terdaftar:

```bash
npm run db:admin -- email@contoh.com
```

## Pemeriksaan

```bash
npx tsc --noEmit
npm run lint
npm run build
```

## Deployment

Target: Vercel + Neon PostgreSQL.

1. Import repository ini di Vercel.
2. Tambahkan environment variable produksi: `DATABASE_URL` (pooled) dan `AUTH_SECRET`. Tambahkan `BANK_*` hanya jika data rekening sudah tersedia.
3. Terapkan migrasi ke database produksi dari mesin lokal: `npm run db:migrate` (memakai `DATABASE_URL_UNPOOLED`).
4. Deploy, lalu uji: beranda, katalog, login, checkout, riwayat pesanan, dan `/admin` dengan akun admin.

Catatan keamanan:

- `.env.local` dan folder `.neon` tidak boleh di-commit.
- Harga, stok, status pesanan, dan role selalu diperiksa di server; pembatalan pesanan mengembalikan stok lewat transaksi database.
- Endpoint `/api/health/db` hanya melaporkan status koneksi dan tidak membocorkan kredensial.
