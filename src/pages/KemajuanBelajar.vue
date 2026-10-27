<script setup>
import { ref, computed, onMounted } from 'vue'
import Sidebar from '../components/Sidebar.vue'

const NILAI_API_URL = 'http://localhost/absensi-api/nilai.php'
const namaAnak = 'Nadia Putri'
const daftarKemajuan = ref([])
const loadingNilai = ref(false)
const errorNilai = ref('')

// ========================================
// TANGGAL DAN KALENDER
// ========================================

const sekarang = new Date()

const bulanDipilih = ref(
  `${sekarang.getFullYear()}-${String(
    sekarang.getMonth() + 1
  ).padStart(2, '0')}`
)

const namaBulan = computed(() => {
  const [tahun, bulan] = bulanDipilih.value
    .split('-')
    .map(Number)

  return new Date(tahun, bulan - 1, 1)
    .toLocaleDateString('id-ID', {
      month: 'long',
      year: 'numeric'
    })
})

const namaHari = [
  'Min',
  'Sen',
  'Sel',
  'Rab',
  'Kam',
  'Jum',
  'Sab'
]

function tanggalLokal(date) {
  const tahun = date.getFullYear()
  const bulan = String(date.getMonth() + 1).padStart(2, '0')
  const hari = String(date.getDate()).padStart(2, '0')

  return `${tahun}-${bulan}-${hari}`
}

function formatTanggal(tanggal) {
  if (!tanggal) return '-'

  const [tahun, bulan, hari] = tanggal
    .split('-')
    .map(Number)

  return new Date(tahun, bulan - 1, hari)
    .toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
}

// ========================================
// AMBIL NILAI NADIA DARI DATABASE
// ========================================

async function muatKemajuanNadia() {
  loadingNilai.value = true
  errorNilai.value = ''

  try {
    const respons = await fetch(NILAI_API_URL)
    const hasil = await respons.json()

    if (!respons.ok || !hasil.success) {
      throw new Error(
        hasil.message || 'Gagal mengambil data nilai.'
      )
    }

    daftarKemajuan.value = (hasil.data || [])
      .filter(
        item =>
          String(item.nama_siswa || '').trim().toLowerCase() ===
          namaAnak.trim().toLowerCase()
      )
      .map(item => ({
        id: item.id_nilai,
        id_siswa: item.id_siswa,
        nama: item.nama_siswa,
        tanggal: String(item.tanggal_nilai || '').slice(0, 10),
        tugas: item.jenis_tugas,
        nilai: Number(item.nilai)
      }))
  } catch (error) {
    console.error('Gagal memuat kemajuan belajar:', error)
    errorNilai.value =
      error.message || 'Gagal menghubungi server.'
  } finally {
    loadingNilai.value = false
  }
}

onMounted(muatKemajuanNadia)

// ========================================
// GRADE OTOMATIS
// ========================================

function gradeNilai(nilai) {
  if (
    nilai === '' ||
    nilai === null ||
    nilai === undefined ||
    !Number.isFinite(Number(nilai)) ||
    Number(nilai) < 0 ||
    Number(nilai) > 100
  ) {
    return '-'
  }

  const angka = Number(nilai)

  if (angka >= 88) return 'A'
  if (angka >= 71) return 'B'
  if (angka >= 55) return 'C'

  return 'D'
}

// ========================================
// DATA TABEL
// ========================================

const kemajuanNadia = computed(() =>
  daftarKemajuan.value
    .filter(item =>
      item.tanggal &&
      item.tanggal.startsWith(`${bulanDipilih.value}-`)
    )
    .slice()
    .sort((a, b) =>
      b.tanggal.localeCompare(a.tanggal)
    )
)

// ========================================
// KALENDER KEMAJUAN BELAJAR
// ========================================

const kalender = computed(() => {
  const [tahun, bulan] = bulanDipilih.value
    .split('-')
    .map(Number)

  const hariPertama = new Date(
    tahun,
    bulan - 1,
    1
  ).getDay()

  const jumlahHari = new Date(
    tahun,
    bulan,
    0
  ).getDate()

  const daftar = []

  for (let i = 0; i < hariPertama; i++) {
    daftar.push({
      key: `kosong-${i}`,
      tanggal: null,
      hariIni: false,
      adaTugas: false
    })
  }

  for (let hari = 1; hari <= jumlahHari; hari++) {
    const date = new Date(tahun, bulan - 1, hari)
    const tanggal = tanggalLokal(date)

    const adaTugas = daftarKemajuan.value.some(
      item => item.tanggal === tanggal
    )

    daftar.push({
      key: tanggal,
      tanggal: hari,
      hariIni: tanggal === tanggalLokal(sekarang),
      adaTugas
    })
  }

  return daftar
})

// ========================================
// NAVIGASI BULAN
// ========================================

function ubahBulan(jumlah) {
  const [tahun, bulan] = bulanDipilih.value
    .split('-')
    .map(Number)

  const date = new Date(
    tahun,
    bulan - 1 + jumlah,
    1
  )

  bulanDipilih.value =
    `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, '0')}`
}

// ========================================
// CETAK HALAMAN
// ========================================

function cetakHalaman() {
  window.print()
}
</script>

<template>
  <div class="app-shell">
    <Sidebar role="orang-tua" />

    <main class="main">
      <!-- HEADER HALAMAN -->
      <header class="page-head">
        <div>
          <h1>Kemajuan Belajar — Nadia Putri</h1>
          <p class="subtitle">
            Kelas 4 · {{ namaBulan }}
          </p>
        </div>

        <button class="btn" @click="cetakHalaman">
          Cetak Kemajuan Belajar
        </button>
      </header>

      <!-- KALENDER -->
      <section class="card calendar-card">
        <div class="calendar-title-row">
          <div>
            <h3 class="card-title">
              Kalender Kemajuan Belajar
            </h3>
            <p class="small-note">
              Pilih bulan untuk melihat tanggal tugas Nadia.
            </p>
          </div>

          <div class="calendar-navigation">
            <button
              class="month-btn"
              aria-label="Bulan sebelumnya"
              @click="ubahBulan(-1)"
            >
              ‹
            </button>

            <strong>{{ namaBulan }}</strong>

            <button
              class="month-btn"
              aria-label="Bulan berikutnya"
              @click="ubahBulan(1)"
            >
              ›
            </button>
          </div>
        </div>

        <div class="calendar-grid">
          <div
            v-for="hari in namaHari"
            :key="hari"
            class="calendar-weekday"
          >
            {{ hari }}
          </div>

          <div
            v-for="tanggal in kalender"
            :key="tanggal.key"
            class="calendar-day"
            :class="{
              today: tanggal.hariIni,
              'has-task': tanggal.adaTugas
            }"
            :title="
              tanggal.adaTugas
                ? 'Ada tugas Nadia'
                : tanggal.tanggal
                  ? 'Belum ada tugas'
                  : ''
            "
          >
            <template v-if="tanggal.tanggal">
              <span>{{ tanggal.tanggal }}</span>
              <span
                v-if="tanggal.adaTugas"
                class="task-dot"
              ></span>
            </template>
          </div>
        </div>
      </section>

      <!-- TABEL KEMAJUAN BELAJAR -->
      <section class="card section">
        <div class="table-heading">
          <div>
            <h3 class="card-title">
              Data Kemajuan Belajar Nadia Putri
            </h3>
            <p class="small-note">
              {{
                new Date().toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })
              }}
            </p>
          </div>

          <span class="data-count">
            {{ kemajuanNadia.length }} data
          </span>
        </div>

        <p v-if="loadingNilai" class="status-message">
          Memuat data nilai Nadia...
        </p>

        <p v-else-if="errorNilai" class="status-message error-message">
          {{ errorNilai }}
          <button class="retry-button" @click="muatKemajuanNadia">
            Coba lagi
          </button>
        </p>

        <div class="table-responsive">
          <table class="progress-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Nama Siswa</th>
                <th>Tanggal</th>
                <th>Tugas</th>
                <th>Nilai</th>
                <th>Grade</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(item, index) in kemajuanNadia"
                :key="item.id || `${item.tanggal}-${item.tugas}`"
              >
                <td>{{ index + 1 }}</td>

                <td class="student-name">
                  {{ item.nama }}
                </td>

                <td>
                  {{ formatTanggal(item.tanggal) }}
                </td>

                <td>
                  {{ item.tugas === 'praktik' ? 'Tugas Praktik' : 'Tugas Tertulis' }}
                </td>

                <td class="score-value">
                  {{ item.nilai ?? '-' }}
                </td>

                <td>
                  <span
                    v-if="gradeNilai(item.nilai) !== '-'"
                    class="grade-badge"
                    :class="'grade-' + gradeNilai(item.nilai).toLowerCase()"
                  >
                    {{ gradeNilai(item.nilai) }}
                  </span>
                  <span v-else>-</span>
                </td>
              </tr>

              <tr v-if="!loadingNilai && !errorNilai && kemajuanNadia.length === 0">
                <td colspan="6" class="empty-row">
                  Belum ada data kemajuan belajar Nadia pada bulan ini.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- CATATAN -->
      <section class="card section">
        <h3 class="card-title">Catatan</h3>
        <p class="small-note note-content">
          Halaman ini menampilkan perkembangan nilai
          Tugas Praktik dan Tugas Tertulis Nadia Putri.
        </p>
      </section>
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  min-height: 100vh;
  background: var(--cream, #f4f5f0);
  color: var(--text, #2e3136);
  font-family: Georgia, 'Times New Roman', serif;
}

.main {
  flex: 1;
  min-width: 0;
  padding: 28px 32px;
}

.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 22px;
}

.page-head h1 {
  margin: 0 0 6px;
  color: var(--navy, #1e3a5f);
  font-size: 28px;
}

.subtitle {
  margin: 0;
  color: var(--muted, #747a80);
  font-size: 14px;
}

.btn {
  padding: 11px 15px;
  border: 1px solid var(--border, #dfe2dc);
  border-radius: 9px;
  background: white;
  color: var(--navy, #1e3a5f);
  font-family: inherit;
  font-size: 14px;
  cursor: pointer;
}

.btn:hover {
  background: #f5f8fb;
}

.card {
  padding: 16px;
  border: 1px solid var(--border, #dfe2dc);
  border-radius: 11px;
  background: var(--card, #fff);
  box-shadow: 0 2px 5px #1e3a5f0a;
}

.calendar-card {
  margin-bottom: 12px;
}

.section {
  margin-top: 12px;
}

.card-title {
  margin: 0 0 8px;
  color: #4b5358;
  font-size: 14px;
  font-weight: 600;
}

.small-note {
  margin: 0;
  color: var(--muted, #747a80);
  font-size: 12px;
  line-height: 1.6;
}

.calendar-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 100px;
  margin-bottom: 18px;
}

.calendar-navigation {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 15px;
  white-space: nowrap;
}

.calendar-navigation strong {
  font-size: 13px;
  font-weight: 500;
  text-transform: capitalize;
}

.month-btn {
  display: grid;
  place-items: center;
  width: 29px;
  height: 29px;
  border: 1px solid var(--border, #dfe2dc);
  border-radius: 8px;
  background: white;
  color: var(--navy, #1e3a5f);
  font-size: 21px;
  cursor: pointer;
}

.month-btn:hover {
  background: #f1f4f7;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 5px;
}

.calendar-weekday {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 30px;
  color: var(--muted, #747a80);
  font-size: 11px;
  font-weight: 600;
}

.calendar-day {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 47px;
  border: 1px solid var(--border, #dfe2dc);
  border-radius: 8px;
  background: white;
  color: var(--text, #2e3136);
  font-size: 12px;
}

.calendar-day.has-task {
  background: #e6f0ea;
  color: #39775d;
}

.calendar-day.today {
  border-color: var(--navy, #1e3a5f);
  background: var(--navy, #1e3a5f);
  color: white;
}

.task-dot {
  position: absolute;
  bottom: 6px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: currentColor;
}

.table-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 15px;
}

.data-count {
  color: var(--muted, #747a80);
  font-size: 12px;
  white-space: nowrap;
}

.status-message {
  margin: 0 0 12px;
  color: var(--muted, #747a80);
  font-size: 13px;
}

.error-message {
  color: #9c3833;
}

.retry-button {
  margin-left: 8px;
  padding: 5px 9px;
  border: 1px solid var(--border, #dfe2dc);
  border-radius: 6px;
  background: white;
  color: var(--navy, #1e3a5f);
  cursor: pointer;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.progress-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.progress-table th,
.progress-table td {
  padding: 10px;
  border-bottom: 1px solid #e1e5e1;
  text-align: left;
}

.progress-table th {
  color: #50565b;
  font-weight: 600;
  white-space: nowrap;
}

.progress-table tbody tr:last-child td {
  border-bottom: 0;
}

.progress-table tbody tr:hover {
  background: #f8fbff;
}

.student-name {
  white-space: nowrap;
}

.score-value {
  color: var(--navy, #1e3a5f);
  font-weight: 600;
}

.grade-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  padding: 4px 9px;
  border-radius: 20px;
  font-weight: 700;
}

.grade-a {
  background: #d5eee1;
  color: #286b50;
}

.grade-b {
  background: #dcecff;
  color: #285e9c;
}

.grade-c {
  background: #ffe6b9;
  color: #925c0b;
}

.grade-d {
  background: #f5d9d7;
  color: #9c3833;
}

.empty-row {
  padding: 24px !important;
  color: var(--muted, #747a80);
  text-align: center !important;
}

.note-content {
  margin-top: 8px;
  font-size: 13px;
}

@media (max-width: 900px) {
  .main {
    padding: 22px 18px;
  }

  .page-head {
    align-items: flex-start;
    flex-direction: column;
  }

  .calendar-title-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .calendar-navigation {
    width: 100%;
    justify-content: space-between;
  }
}

@media (max-width: 560px) {
  .main {
    padding: 16px 12px;
  }

  .page-head h1 {
    font-size: 23px;
  }

  .calendar-grid {
    gap: 4px;
  }

  .calendar-day {
    min-height: 40px;
    border-radius: 6px;
    font-size: 11px;
  }

  .calendar-weekday {
    font-size: 10px;
  }

  .table-heading {
    align-items: flex-start;
  }

  .progress-table th,
  .progress-table td {
    padding: 9px 8px;
    white-space: nowrap;
  }
}

@media print {
  .app-shell {
    display: block;
    background: white;
  }

  .main {
    padding: 0;
  }

  .btn,
  .calendar-navigation,
  .app-shell > :first-child {
    display: none !important;
  }

  .card {
    box-shadow: none;
    break-inside: avoid;
  }

  .calendar-day {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
}
</style>
