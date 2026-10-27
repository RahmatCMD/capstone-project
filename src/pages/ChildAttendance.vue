
<script setup>
import { ref, computed, watch } from 'vue'
import Sidebar from '../components/Sidebar.vue'

const SISWA_API_URL = 'http://localhost/absensi-api/siswa.php'
const ABSEN_API_URL = 'http://localhost/absensi-api/absen.php'

const namaAnak = 'Nadia Putri'

const sekarang = new Date()
const bulanDipilih = ref(
  `${sekarang.getFullYear()}-${String(sekarang.getMonth() + 1).padStart(2, '0')}`
)

const semuaSiswa = ref([])
const semuaAbsensi = ref([])
const loading = ref(false)
const pesanError = ref('')


const riwayatNadia = computed(() => {
  return semuaAbsensi.value
    .map((item, index) => ({
      id: `${item.tanggal}-${index}`,
      tanggal: item.tanggal,
      status: item.status,
      catatan: item.catatan ?? ''
    }))
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal))
})

function formatTanggal(tanggal) {
  if (!tanggal) return '-'

  const [tahun, bulan, hari] = tanggal.split('-').map(Number)

  return new Date(tahun, bulan - 1, hari).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

function labelStatus(status) {
  const labels = {
    hadir: 'Hadir',
    sakit: 'Sakit',
    izin: 'Izin',
    alpha: 'Alpha'
  }

  return labels[status] || status || '-'
}

const namaBulan = computed(() => {
  const [tahun, bulan] = bulanDipilih.value.split('-').map(Number)

  return new Date(tahun, bulan - 1, 1).toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric'
  })
})

const siswaNadia = computed(() => {
  return semuaSiswa.value.find(s => {
    const nama = s.nama ?? s.nama_siswa ?? s.name ?? ''
    return String(nama).trim().toLowerCase() ===
      namaAnak.toLowerCase()
  })
})

function ambilDaftar(response) {
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.data)) return response.data
  if (Array.isArray(response?.data?.data)) {
    return response.data.data
  }
  return []
}

function tanggalLokal(date) {
  const tahun = date.getFullYear()
  const bulan = String(date.getMonth() + 1).padStart(2, '0')
  const hari = String(date.getDate()).padStart(2, '0')
  return `${tahun}-${bulan}-${hari}`
}

function kunciTanggal(value) {
  if (!value) return ''

  // Menghindari pergeseran tanggal akibat zona waktu.
  const teks = String(value)
  const cocok = teks.match(/^(\d{4}-\d{2}-\d{2})/)
  return cocok ? cocok[1] : ''
}

function normalisasiStatus(value) {
  const status = String(value ?? '')
    .trim()
    .toLowerCase()

  if (status === 'hadir') return 'hadir'
  if (status === 'sakit') return 'sakit'
  if (status === 'izin') return 'izin'

  if (
    status === 'alpha' ||
    status === 'alpa' ||
    status === 'tanpa keterangan'
  ) return 'alpha'

  return ''
}

function cocokDenganNadia(absen) {
  const nama = String(
    absen.nama ??
    absen.nama_siswa ??
    absen.siswa_nama ??
    absen.name ??
    ''
  ).trim().toLowerCase()

  if (nama) return nama === namaAnak.toLowerCase()

  // Jika API menggunakan ID siswa, cocokkan dengan ID Nadia.
  const idNadia = siswaNadia.value?.id ??
    siswaNadia.value?.id_siswa ??
    siswaNadia.value?.siswa_id

  const idAbsen = absen.siswa_id ??
    absen.id_siswa ??
    absen.student_id

  return idNadia != null &&
    idAbsen != null &&
    String(idNadia) === String(idAbsen)
}

async function muatData() {
  loading.value = true
  pesanError.value = ''

  try {
    const [resSiswa, resAbsen] = await Promise.all([
      fetch(SISWA_API_URL),
      fetch(`${ABSEN_API_URL}?bulan=${bulanDipilih.value}`)
    ])

    if (!resSiswa.ok || !resAbsen.ok) {
      throw new Error('Gagal mengambil data dari server.')
    }

    const [jsonSiswa, jsonAbsen] = await Promise.all([
      resSiswa.json(),
      resAbsen.json()
    ])

    if (jsonSiswa.success === false) {
      throw new Error(jsonSiswa.message || 'Data siswa gagal dimuat.')
    }

    if (jsonAbsen.success === false) {
      throw new Error(jsonAbsen.message || 'Data absensi gagal dimuat.')
    }

    semuaSiswa.value = ambilDaftar(jsonSiswa)
    const daftarAbsen = ambilDaftar(jsonAbsen)

    semuaAbsensi.value = daftarAbsen
      .filter(cocokDenganNadia)
      .map(item => ({
        tanggal: kunciTanggal(
          item.tanggal ?? item.tgl ?? item.date
        ),
        status: normalisasiStatus(
          item.status ?? item.kehadiran
        )
      }))
      .filter(item =>
        item.tanggal.startsWith(`${bulanDipilih.value}-`)
      )
  } catch (error) {
    console.error('Gagal memuat absensi Nadia:', error)
    pesanError.value =
      'Data absensi belum dapat dimuat. Periksa koneksi API PHP dan database.'
  } finally {
    loading.value = false
  }
}

watch(bulanDipilih, muatData, { immediate: true })

const namaHari = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

const kalender = computed(() => {
  const [tahun, bulan] = bulanDipilih.value.split('-').map(Number)

  const hariPertama = new Date(tahun, bulan - 1, 1).getDay()
  const jumlahHari = new Date(tahun, bulan, 0).getDate()

  const daftar = []

  // Sel kosong sebelum tanggal pertama bulan.
  for (let i = 0; i < hariPertama; i++) {
    daftar.push({
      key: `kosong-${i}`,
      tanggal: null,
      status: '',
      hariIni: false
    })
  }

  for (let hari = 1; hari <= jumlahHari; hari++) {
    const date = new Date(tahun, bulan - 1, hari)
    const keyTanggal = tanggalLokal(date)

    const dataAbsen = semuaAbsensi.value.find(
      item => item.tanggal === keyTanggal
    )

    daftar.push({
      key: keyTanggal,
      tanggal: hari,
      status: dataAbsen?.status ?? '',
      hariIni: keyTanggal === tanggalLokal(sekarang)
    })
  }

  return daftar
})

function ubahBulan(jumlah) {
  const [tahun, bulan] = bulanDipilih.value.split('-').map(Number)
  const date = new Date(tahun, bulan - 1 + jumlah, 1)

  bulanDipilih.value =
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function printPage() {
  window.print()
}
</script>

<template>
  <div class="app-shell">
    <Sidebar role="orang-tua" />

    <main class="main">
      <div class="page-head">
        <div>
          <h1>Absensi Siswa — Nadia Putri</h1>
          <p>Kelas 4 · {{ namaBulan }}</p>
        </div>

        <button class="btn" @click="printPage">
          Unduh Rapor Kehadiran
        </button>
      </div>

      <!-- Kalender absensi Nadia -->
      <section class="card">
        <div class="calendar-title-row">
          <div>
            <h3 class="card-title">Kalender Absensi</h3>
            <p class="small-note">
              Pilih tanggal untuk melihat data kehadiran Nadia.
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

        <p v-if="loading" class="small-note">
          Memuat data absensi Nadia...
        </p>

        <p v-else-if="pesanError" class="error-message">
          {{ pesanError }}
        </p>

        <p v-else-if="!siswaNadia" class="small-note">
          Data siswa Nadia Putri tidak ditemukan di database.
        </p>

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
            :class="[
              tanggal.status,
              { 'today': tanggal.hariIni }
            ]"
            :title="tanggal.status
              ? `Nadia Putri: ${tanggal.status}`
              : tanggal.tanggal
                ? 'Belum ada data absensi'
                : ''"
          >
            <template v-if="tanggal.tanggal">
              <span>{{ tanggal.tanggal }}</span>
              <span
                v-if="tanggal.status"
                class="attendance-dot"
              ></span>
            </template>
          </div>
        </div>

        <div class="legend">
          <span class="legend-item">
            <i class="legend-dot hadir-dot"></i> Hadir
          </span>
          <span class="legend-item">
            <i class="legend-dot sakit-dot"></i> Sakit
          </span>
          <span class="legend-item">
            <i class="legend-dot izin-dot"></i> Izin
          </span>
          <span class="legend-item">
            <i class="legend-dot alpha-dot"></i> Alpha
          </span>
          <span class="legend-item">
            <i class="legend-dot today-dot"></i> Hari ini
          </span>
        </div>
      </section>
      
<!-- Tabel riwayat absensi khusus Nadia Putri -->
<section class="card section">
  <div class="attendance-table-head">
    <div>
      <h3 class="card-title">Data Absensi Nadia Putri</h3>
      <p class="small-note">
        {{ new Date().toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }) }}
      </p>
    </div>

    <span class="data-count">
      {{ riwayatNadia.length }} data
    </span>
  </div>

  <div class="table-responsive">
    <table class="attendance-table">
      <thead>
        <tr>
          <th>No.</th>
          <th>Nama Siswa</th>
          <th>Tanggal</th>
          <th>Status</th>
          <th>Catatan</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="(item, index) in riwayatNadia" :key="item.id">
          <td>{{ index + 1 }}</td>
          <td>Nadia Putri</td>
          <td>{{ formatTanggal(item.tanggal) }}</td>
          <td>
            <span class="status-badge" :class="item.status">
              {{ labelStatus(item.status) }}
            </span>
          </td>
          <td>{{ item.catatan || '-' }}</td>
        </tr>

        <tr v-if="riwayatNadia.length === 0">
          <td colspan="5" class="empty-row">
            Belum ada data absensi Nadia pada bulan ini.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</section>

      <section class="card section">
        <h3 class="card-title">Catatan</h3>
        <p class="small-note note-content">
          Semua absensi dari anak yang bersangkutan akan ditampilkan di halaman ini.
        </p>
      </section>
    </main>
  </div>
</template>

<style scoped>
.calendar-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.calendar-title-row .card-title {
  margin-bottom: 4px;
}

.calendar-navigation {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 18px;
  white-space: nowrap;
}

.calendar-navigation strong {
  font-size: 14px;
  font-weight: 500;
  text-transform: capitalize;
}

.month-btn {
  width: 31px;
  height: 31px;
  border: 1px solid var(--border, #dfe2dc);
  background: white;
  border-radius: 8px;
  color: var(--navy, #1e3a5f);
  cursor: pointer;
  font-size: 22px;
  line-height: 1;
}

.month-btn:hover {
  background: #f1f4f7;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 6px;
}

.calendar-weekday {
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted, #747a80);
  font-size: 12px;
  font-weight: 600;
}

.calendar-day {
  min-height: 54px;
  border: 1px solid var(--border, #dfe2dc);
  border-radius: 9px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  font-size: 13px;
  color: var(--text, #2e3136);
  transition: background 0.15s ease;
}

.calendar-day.hadir {
  background: #e6f0ea;
  color: #39775d;
}

.calendar-day.sakit {
  background: #fbf0d8;
  color: #a96b00;
}

.calendar-day.izin {
  background: #e7edf5;
  color: #42678d;
}

.calendar-day.alpha {
  background: #f8e5e3;
  color: #bd554e;
}

.calendar-day.today {
  background: var(--navy, #1e3a5f);
  color: white;
  border-color: var(--navy, #1e3a5f);
}

.attendance-dot {
  position: absolute;
  bottom: 7px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: currentColor;
}

.calendar-day.today .attendance-dot {
  background: white;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 18px;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--muted, #747a80);
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.hadir-dot { background: #4f8068; }
.sakit-dot { background: #e0a52f; }
.izin-dot { background: #52728c; }
.alpha-dot { background: #bd554e; }
.today-dot { background: #2196f3; }

.grade-row {
  margin: 15px 0;
}

.grade-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.grade-label strong {
  font-weight: 500;
}

.progress {
  height: 8px;
  border-radius: 20px;
  background: #e9e6dd;
  overflow: hidden;
}

.progress span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: #4f8068;
}

.error-message {
  color: #bd554e;
  font-size: 13px;
  margin-bottom: 12px;
}

.note-content {
  font-size: 14px;
  line-height: 1.6;
}

@media (max-width: 600px) {
  .calendar-title-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .calendar-navigation {
    width: 100%;
    justify-content: space-between;
  }

  .calendar-grid {
    gap: 4px;
  }

  .calendar-day {
    min-height: 43px;
    border-radius: 7px;
    font-size: 12px;
  }

  .calendar-weekday {
    font-size: 11px;
  }

  .legend {
    gap: 10px;
  }
}

@media print {
  .calendar-navigation,
  .btn,
  .app-shell > :first-child {
    display: none !important;
  }

  .calendar-day {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
}
</style>
