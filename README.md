# AbsenSekolah - Vue + Vite

Kerangka aplikasi absensi digital untuk Guru dan Orang Tua, dibuat berdasarkan 7 halaman desain pada PDF referensi.

## Teknologi
- Vue 3
- Vue Router 4
- Vite 8.3.0
- Node.js 22.21.0
- npm 10.9.4

## Menjalankan
```bash
npm install
npm run dev
```

Lalu buka alamat localhost yang ditampilkan Vite.

## Akun demo
Login tidak memakai backend. Isi apa saja pada email dan kata sandi.
- Guru -> Dashboard Guru
- Orang Tua -> Dashboard Orang Tua

Role disimpan di localStorage sehingga halaman terlindungi oleh router guard sederhana.

## Struktur
```text
absen-sekolah/
├─ index.html
├─ package.json
├─ vite.config.js
├─ README.md
└─ src/
   ├─ main.js
   ├─ App.vue
   ├─ router.js
   ├─ assets/
   │  └─ styles.css
   ├─ components/
   │  └─ Sidebar.vue
   └─ pages/
      ├─ Login.vue
      ├─ TeacherDashboard.vue
      ├─ AttendanceInput.vue
      ├─ AttendanceHistory.vue
      ├─ ParentDashboard.vue
      ├─ ChildAttendance.vue
      └─ ProfileSettings.vue
```

## Catatan
Versi ini adalah frontend prototype yang interaktif. Data absensi dan profil disimpan lokal di browser. Untuk produksi, hubungkan form/login/absensi ke backend Node.js + database, lalu tambahkan autentikasi yang aman.
