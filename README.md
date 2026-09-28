# SIVERA API

Backend API untuk aplikasi manajemen inventaris dan peminjaman aset di sekolah/perusahaan. Aplikasi ini dibangun dengan Node.js, Express.js, TypeScript, dan MySQL.

## Fitur

- Autentikasi pengguna dengan JWT
- Registrasi dan login user
- Manajemen data lokasi
- Manajemen data kategori
- Manajemen data barang
- Manajemen data pelajaran
- Proses peminjaman barang dan ruangan
- Validasi stok saat peminjaman barang
- Koneksi database MySQL dengan opsi SSH tunnel

## Teknologi yang Digunakan

- Node.js
- TypeScript
- Express.js
- MySQL
- JWT (JSON Web Token)
- bcrypt
- cors
- dotenv
- ts-node-dev

## Struktur Project

```bash
be-sivera/
├── src/
│   ├── config/
│   │   └── database.ts
│   ├── controller/
│   │   ├── auth.controller.ts
│   │   ├── barang.controller.ts
│   │   ├── kategori.controller.ts
│   │   ├── lokasi.controller.ts
│   │   ├── pelajaran.controller.ts
│   │   └── peminjaman.controller.ts
│   ├── middleware/
│   │   └── auth.middleware.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── barang.routes.ts
│   │   ├── kategori.routes.ts
│   │   ├── lokasi.routes.ts
│   │   ├── pelajaran.routes.ts
│   │   └── peminjaman.routes.ts
│   ├── utils/
│   │   └── response.ts
│   └── index.ts
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Persyaratan

Pastikan perangkat sudah terinstall:

- Node.js v18+
- npm atau yarn
- MySQL server
- (Opsional) akses SSH untuk koneksi database via tunnel

## Instalasi

1. Clone repository

```bash
git clone <repository-url>
cd be-sivera
```

2. Install dependency

```bash
npm install
```

3. Buat file `.env` di root project dan sesuaikan konfigurasi berikut:

```env
PORT=3001
FRONTEND_URL=http://localhost:3000
JWT_SECRET=sivera_secret_key_2026

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=sivera

SSH_HOST=
SSH_PORT=22
SSH_USER=
SSH_PASSWORD=
```

Catatan:
- Jika `SSH_HOST` dikosongkan, aplikasi akan mencoba koneksi MySQL langsung.
- Jika `SSH_HOST` diisi, aplikasi akan menggunakan SSH tunnel untuk mengakses database.

## Menjalankan Aplikasi

Mode development:

```bash
npm run dev
```

Build project:

```bash
npm run build
```

Setelah aplikasi berjalan, server akan aktif di:

```bash
http://localhost:3001
```

## Base URL

```bash
/api/v1
```

## Endpoint API

### 1. Auth

| Method | Endpoint | Deskripsi |
| --- | --- | --- |
| POST | `/api/v1/auth/login` | Login user |
| POST | `/api/v1/auth/register` | Registrasi user baru |
| GET | `/api/v1/auth/me` | Mendapatkan data user yang sedang login |

Contoh request login:

```json
{
  "username": "admin",
  "password": "123456"
}
```

Contoh response:

```json
{
  "status": "success",
  "message": "Login berhasil",
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "nama": "Admin",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

> Untuk endpoint yang membutuhkan autentikasi, sertakan header berikut:
>
> ```http
> Authorization: Bearer <token>
> ```

### 2. Lokasi

| Method | Endpoint | Deskripsi |
| --- | --- | --- |
| GET | `/api/v1/lokasi` | Ambil semua data lokasi |
| GET | `/api/v1/lokasi/:id` | Ambil detail lokasi |
| POST | `/api/v1/lokasi` | Tambah lokasi baru |
| PUT | `/api/v1/lokasi/:id` | Update lokasi |
| DELETE | `/api/v1/lokasi/:id` | Hapus lokasi |

### 3. Kategori

| Method | Endpoint | Deskripsi |
| --- | --- | --- |
| GET | `/api/v1/kategori` | Ambil semua data kategori |
| GET | `/api/v1/kategori/:id` | Ambil detail kategori |
| POST | `/api/v1/kategori` | Tambah kategori baru |
| PUT | `/api/v1/kategori/:id` | Update kategori |
| DELETE | `/api/v1/kategori/:id` | Hapus kategori |

### 4. Barang

| Method | Endpoint | Deskripsi |
| --- | --- | --- |
| GET | `/api/v1/barang` | Ambil semua data barang |
| GET | `/api/v1/barang/:id` | Ambil detail barang |
| POST | `/api/v1/barang` | Tambah barang baru |
| PUT | `/api/v1/barang/:id` | Update barang |
| DELETE | `/api/v1/barang/:id` | Hapus barang |

### 5. Pelajaran

| Method | Endpoint | Deskripsi |
| --- | --- | --- |
| GET | `/api/v1/pelajaran` | Ambil semua data pelajaran |
| GET | `/api/v1/pelajaran/:id` | Ambil detail pelajaran |
| POST | `/api/v1/pelajaran` | Tambah pelajaran baru |
| PUT | `/api/v1/pelajaran/:id` | Update pelajaran |
| DELETE | `/api/v1/pelajaran/:id` | Hapus pelajaran |

### 6. Peminjaman

| Method | Endpoint | Deskripsi |
| --- | --- | --- |
| GET | `/api/v1/peminjaman` | Ambil semua data peminjaman |
| POST | `/api/v1/peminjaman` | Buat pengajuan peminjaman baru |

Contoh body peminjaman barang:

```json
{
  "user_id": 1,
  "jenis_peminjaman": "barang",
  "tgl_rencana_kembali": "2026-09-30",
  "tujuan_peminjaman": "Kegiatan praktikum",
  "catatan": "Harap dikembalikan sesuai jadwal",
  "items": [
    {
      "barang_id": 3,
      "jumlah": 2
    }
  ]
}
```

## Response Format

Semua response API mengikuti format umum berikut:

```json
{
  "status": "success",
  "message": "Pesan berhasil",
  "data": {}
}
```

Error response:

```json
{
  "status": "error",
  "message": "Pesan error",
  "errors": null
}
```

## Catatan Penting

- Endpoint yang membutuhkan autentikasi akan dicek melalui middleware JWT.
- App menggunakan `.env` untuk konfigurasi database dan JWT.
- Pastikan tabel MySQL sesuai dengan query yang digunakan oleh controller.
- Untuk produksi, disarankan mengganti `JWT_SECRET` dengan nilai yang aman dan tidak dipublikasikan.

## Script yang Tersedia

```bash
npm run dev   # menjalankan server development
npm run build # build aplikasi TypeScript
```

## Lisensi

Project ini menggunakan lisensi ISC.
