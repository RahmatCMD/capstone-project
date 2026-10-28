<script setup>
import { computed, ref, onMounted, onActivated, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '../components/Sidebar.vue'

const router = useRouter()
const toast = ref('')

// API PHP
const ABSEN_API_URL = 'http://localhost/absensi-api/absen.php'
const SISWA_API_URL = 'http://localhost/absensi-api/siswa.php'

// ================================
// TANGGAL DAN KALENDER
// ================================
function formatTanggal(date) {
  const tahun = date.getFullYear()
  const bulan = String(date.getMonth() + 1).padStart(2, '0')
  const hari = String(date.getDate()).padStart(2, '0')

  return `${tahun}-${bulan}-${hari}`
}

function tanggalSekarang() {
  return formatTanggal(new Date())
}

const today = computed(() =>
  new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
)

const currentDate = computed(() =>
  new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
)

// Bulan yang sedang ditampilkan pada kalender
const bulanDitampilkan = ref(
  new Date(new Date().getFullYear(), new Date().getMonth(), 1)
)

// Tanggal yang dipilih
const tanggalDipilih = ref(tanggalSekarang())

const namaBulan = computed(() =>
  bulanDitampilkan.value.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric'
  })
)

const namaHari = [
  'Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'
]

// Membuat kotak kalender berdasarkan bulan aktif
const kalender = computed(() => {
  const tahun = bulanDitampilkan.value.getFullYear()
  const bulan = bulanDitampilkan.value.getMonth()

  const hariPertama = new Date(tahun, bulan, 1).getDay()
  const jumlahHari = new Date(tahun, bulan + 1, 0).getDate()

  const tanggal = []

  // Kotak kosong sebelum tanggal 1
  for (let i = 0; i < hariPertama; i++) {
    tanggal.push(null)
  }

  for (let hari = 1; hari <= jumlahHari; hari++) {
    tanggal.push(formatTanggal(new Date(tahun, bulan, hari)))
  }

  return tanggal
})

function ubahBulan(jumlah) {
  const baru = new Date(
    bulanDitampilkan.value.getFullYear(),
    bulanDitampilkan.value.getMonth() + jumlah,
    1
  )

  bulanDitampilkan.value = baru

  // Pilih tanggal yang sama jika tersedia pada bulan baru.
  // Jika tidak, pilih tanggal pertama bulan tersebut.
  const hariLama = Number(tanggalDipilih.value.slice(-2))
  const hariAkhir = new Date(
    baru.getFullYear(),
    baru.getMonth() + 1,
    0
  ).getDate()

  const hariBaru = Math.min(hariLama || 1, hariAkhir)

  tanggalDipilih.value = formatTanggal(
    new Date(baru.getFullYear(), baru.getMonth(), hariBaru)
  )
}

function pilihTanggal(tanggal) {
  if (!tanggal) return
  tanggalDipilih.value = tanggal
}

// ================================
// DATA ABSENSI DARI DATABASE
// ================================
const dataSiswa = ref([])
const loading = ref(false)
const errorApi = ref('')

// ================================
// DATA ABSENSI DARI DATABASE
// ================================
const dataAbsensiBulan = ref([])

const absensiNadia = computed(() => {
  if (!siswaNadia.value) return []

  return dataAbsensiBulan.value.filter(item => {
    if (
      item.id_siswa != null &&
      siswaNadia.value.id_siswa != null
    ) {
      return String(item.id_siswa) ===
        String(siswaNadia.value.id_siswa)
    }

    return String(item.nama_siswa || item.nama || '')
      .trim()
      .toLowerCase() === 'nadia putri'
  })
})

async function muatAbsensiBulan() {
  loading.value = true
  errorApi.value = ''

  const tahun = bulanDitampilkan.value.getFullYear()
  const bulan = String(
    bulanDitampilkan.value.getMonth() + 1
  ).padStart(2, '0')

  try {
    const [responseSiswa, responseAbsen] = await Promise.all([
      fetch(SISWA_API_URL),
      fetch(`${ABSEN_API_URL}?bulan=${tahun}-${bulan}`)
    ])

    if (!responseSiswa.ok || !responseAbsen.ok) {
      throw new Error('Gagal mengambil data dari API.')
    }

    const resultSiswa = await responseSiswa.json()
    const resultAbsen = await responseAbsen.json()

    if (
      resultSiswa.success === false ||
      resultAbsen.success === false
    ) {
      throw new Error('API mengembalikan kesalahan.')
    }

    dataSiswa.value = Array.isArray(resultSiswa.data)
      ? resultSiswa.data
      : []

    dataAbsensiBulan.value = Array.isArray(resultAbsen.data)
      ? resultAbsen.data
      : []
  } catch (error) {
    console.error('Gagal memuat data absensi:', error)

    errorApi.value =
      'Data belum dapat dimuat. Periksa Apache, MySQL, dan API PHP.'

    dataSiswa.value = []
    dataAbsensiBulan.value = []
  } finally {
    loading.value = false
  }
}

// Muat ulang data ketika bulan berubah
watch(bulanDitampilkan, () => {
  muatAbsensiBulan()
})

// Ambil data nadia putri
const absensiHariIni = computed(() => {
  return absensiNadia.value.filter(
    item =>
      String(item.tanggal).slice(0, 10) ===
      tanggalDipilih.value
  )
})

// Tanggal mana saja yang memiliki data absensi nadia
const tanggalMemilikiAbsensi = computed(() => {
  return new Set(
    absensiNadia.value.map(
      item => String(item.tanggal).slice(0, 10)
    )
  )
})

// status absensi nadia putri
const siswaNadia = computed(() => {
  return dataSiswa.value.find(siswa =>
    String(siswa.nama_siswa || '')
      .trim()
      .toLowerCase() === 'nadia putri'
  )
})

const riwayatAbsensiNadia = computed(() => {
  return [...absensiNadia.value].sort((a, b) =>
    String(a.tanggal || '').localeCompare(
      String(b.tanggal || '')
    )
  )
})

// Status absensi yang tercatat pada setiap tanggal
const statusAbsensiTanggal = computed(() => {
  const hasil = {}

  absensiNadia.value.forEach(item => {
    const tanggal = String(item.tanggal || '').slice(0, 10)
    const status = String(item.status || '').trim().toLowerCase()

    if (!tanggal) return

    if (!hasil[tanggal]) {
      hasil[tanggal] = []
    }

    if (
      ['hadir', 'sakit', 'izin', 'alpha'].includes(status) &&
      !hasil[tanggal].includes(status)
    ) {
      hasil[tanggal].push(status)
    }
  })

  return hasil
})

const tanggalDipilihFormat = computed(() =>
  new Date(`${tanggalDipilih.value}T12:00:00`).toLocaleDateString(
    'id-ID',
    {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }
  )
)

// ================================
// SIKLUS HALAMAN
// ================================
onMounted(() => {
  muatAbsensiBulan()
  window.addEventListener('focus', muatAbsensiBulan)
})

onActivated(() => {
  muatAbsensiBulan()
})

onUnmounted(() => {
  window.removeEventListener('focus', muatAbsensiBulan)
})

// ================================
// CETAK RIWAYAT ABSENSI
// ================================
function cetakAbsensi() {
  if (loading.value || errorApi.value) {
    show('Data absensi belum siap dicetak.')
    return
  }

  if (riwayatAbsensiNadia.value.length === 0) {
    show('Belum ada data absensi untuk dicetak.')
    return
  }

  window.print()
}

// ================================
// UNDUH RIWAYAT ABSENSI KE CSV
// ================================
function unduhCSV() {
  if (loading.value) {
    show('Tunggu sampai data selesai dimuat.')
    return
  }

  if (errorApi.value) {
    show('Data gagal dimuat. Silakan coba lagi.')
    return
  }

  if (riwayatAbsensiNadia.value.length === 0) {
    show('Belum ada data absensi untuk diunduh.')
    return
  }

  const kolom = [
    'No.',
    'Nama Siswa',
    'Tanggal',
    'Status Kehadiran',
    'Catatan'
  ]

  const barisData = riwayatAbsensiNadia.value.map((item, index) => [
    index + 1,
    item.nama_siswa || item.nama || 'Nadia Putri',
    String(item.tanggal || '').slice(0, 10),
    item.status || '-',
    item.catatan || '-'
  ])

  // Mengamankan tanda kutip dan pemisah dalam data
  const escapeCSV = nilai =>
    `"${String(nilai ?? '').replace(/"/g, '""')}"`

  const isiCSV = [kolom, ...barisData]
    .map(baris => baris.map(escapeCSV).join(';'))
    .join('\r\n')

  // BOM agar karakter Bahasa Indonesia terbaca dengan baik
  const blob = new Blob(
    ['\uFEFF' + isiCSV],
    { type: 'text/csv;charset=utf-8;' }
  )

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  const tahun = bulanDitampilkan.value.getFullYear()
  const bulan = String(
    bulanDitampilkan.value.getMonth() + 1
  ).padStart(2, '0')

  link.href = url
  link.download = `Rekap_Absensi_Nadia_Putri_${tahun}-${bulan}.csv`

  document.body.appendChild(link)
  link.click()
  link.remove()

  setTimeout(() => URL.revokeObjectURL(url), 1000)

  show('File CSV berhasil diunduh.')
}
</script>

<template>
  <div class="app-shell">
    <Sidebar role="ortu" />

    
<main class="main">
  <div class="page-head">
    <div>
      <h1>Rekap absensi Nadia Putri</h1>
      <p>Kelas 4 {{ today }}</p>
    </div>

    <div class="actions">
        <button class="btn">
          {{ currentDate }}
        </button>

      <button
    class="btn btn-cetak"
    @click="cetakAbsensi"
    :disabled="loading || riwayatAbsensiNadia.length === 0"
      >
    Cetak
      </button>

      <button
    class="btn primary btn-unduh"
    @click="unduhCSV"
    :disabled="loading || !!errorApi || riwayatAbsensiNadia.length === 0"
      >
      Unduh CSV
      </button>
    </div>
  </div>

  <!-- KALENDER ABSENSI -->
  <section class="card calendar-card">
    <div class="section-heading">
      <div>
        <h2>Kalender Absensi</h2>
        <p>Pilih tanggal untuk melihat data kehadiran siswa.</p>
      </div>

      <div class="calendar-navigation">
        <button
          class="calendar-nav-btn"
          aria-label="Bulan sebelumnya"
          @click="ubahBulan(-1)"
        >
          ‹
        </button>

        <strong>{{ namaBulan }}</strong>

        <button
          class="calendar-nav-btn"
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

      <template v-for="(tanggal, index) in kalender" :key="index">
        <div v-if="!tanggal" class="calendar-empty"></div>

        <button
            v-else
            class="calendar-day"
            :class="[
          {
            selected: tanggal === tanggalDipilih,
            'is-today': tanggal === tanggalSekarang()
          },
            ...(statusAbsensiTanggal[tanggal] || []).map(
            status => `status-${status}`
          )
        ]"
          @click="pilihTanggal(tanggal)"
          >
          <span>{{ Number(tanggal.slice(-2)) }}</span>
          </button>
      </template>
    </div>
  </section>

  <!-- DAFTAR ABSEN NADIA PUTRI BERDASARKAN TANGGAL -->
  <section class="card attendance-list-card">
  <div class="section-heading">
    <div>
      <h2>Data Absensi Nadia Putri</h2>
      <p>{{ namaBulan }}</p>
    </div>

    <span class="attendance-count">
      {{ riwayatAbsensiNadia.length }} data
    </span>
  </div>

  <div v-if="loading" class="empty-state">
    Memuat riwayat absensi...
  </div>

  <div v-else-if="errorApi" class="empty-state error-state">
    {{ errorApi }}

    <button class="btn primary" @click="muatAbsensiBulan">
      Coba Lagi
    </button>
  </div>

  <div
    v-else-if="riwayatAbsensiNadia.length === 0"
    class="empty-state"
  >
    Belum ada catatan absensi Nadia Putri pada bulan ini.
  </div>

  <div v-else class="table-wrapper">
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
        <tr
          v-for="(siswa, index) in riwayatAbsensiNadia"
          :key="`${siswa.id_absen || siswa.id_siswa || 'nadia'}-${siswa.tanggal}-${index}`"
        >
          <td>{{ index + 1 }}</td>

          <td>
            {{ siswa.nama_siswa || siswa.nama || 'Nadia Putri' }}
          </td>

          <td>
            {{
              new Date(
                `${String(siswa.tanggal).slice(0, 10)}T12:00:00`
              ).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })
            }}
          </td>

          <td>
            <span
              class="status-label"
              :class="String(siswa.status || '').toLowerCase()"
            >
              {{ siswa.status || '-' }}
            </span>
          </td>

          <td>{{ siswa.catatan || '-' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</section>
</main>


    <div v-if="toast" class="toast">
      {{ toast }}
    </div>
  </div>
</template>

<style scoped>
/* Kalender dan daftar absensi */
.calendar-card,
.attendance-list-card {
  margin-top: 22px;
  padding: 22px;
  min-width: 0;
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 14px;
  margin-bottom: 20px;
}

.section-heading h2 {
  margin: 0 0 6px;
  font-size: 20px;
  color: var(--text, #2e3136);
}

.section-heading p {
  margin: 0;
  color: var(--muted, #747a80);
  font-size: 13px;
}

.calendar-navigation {
  display: flex;
  align-items: center;
  gap: 14px;
}

.calendar-navigation strong {
  min-width: 145px;
  text-align: center;
  text-transform: capitalize;
}

.calendar-nav-btn {
  width: 34px;
  height: 34px;
  border: 1px solid var(--border, #dfe2dc);
  border-radius: 8px;
  background: white;
  color: var(--navy, #1e3a5f);
  font-size: 24px;
  cursor: pointer;
}

.calendar-nav-btn:hover {
  background: #eaf3fb;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 7px;
}

.calendar-weekday {
  padding: 10px 2px;
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  color: var(--muted, #747a80);
}

.calendar-day,
.calendar-empty {
  min-height: 60px;
}

.calendar-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid var(--border, #dfe2dc);
  border-radius: 9px;
  background: white;
  color: var(--text, #2e3136);
  cursor: pointer;
}

/* Warna latar berdasarkan status absensi */
.calendar-day.status-hadir {
  background: #e6f0ea;
  color: #39775d;
}

.calendar-day.status-sakit {
  background: #fbf0d8;
  color: #a96b00;
}

.calendar-day.status-izin {
  background: #e7edf5;
  color: #42678d;
}

.calendar-day.status-alpha {
  background: #f8e5e3;
  color: #bd554e;
}

/* Tanggal yang dipilih tetap berwarna navy */
.calendar-day.selected {
  background: var(--navy, #1e3a5f);
  color: white;
  border-color: var(--navy, #1e3a5f);
}

/* Hari ini tetap ditandai dengan border biru */
.calendar-day.is-today:not(.selected) {
  border: 2px solid #2196e9;
  font-weight: 700;
}

/* Hari ini yang juga dipilih */
.calendar-day.is-today.selected {
  border: 2px solid #2196e9;
}

.calendar-day:hover {
  border-color: #2196f3;
  box-shadow: 0 0 0 1px rgba(33, 150, 243, 0.12);
}

.calendar-day.selected {
  background: var(--navy, #1e3a5f);
  color: white;
  border-color: var(--navy, #1e3a5f);
} 

.calendar-day.is-today:not(.selected) {
  border: 2px solid #2196e9;
  font-weight: 700;
}

.calendar-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  margin-top: 18px;
  color: var(--muted, #747a80);
  font-size: 12px;
}

.calendar-legend span {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.legend-dot,
.legend-today {
  display: inline-block;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #4f8068;
}

.legend-today {
  background: #2196e9;
}

.attendance-count {
  padding: 7px 12px;
  border-radius: 20px;
  background: #eaf3fb;
  color: var(--navy, #1e3a5f);
  font-size: 12px;
  font-weight: 700;
}

.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.attendance-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 13px;
}

.attendance-table th,
.attendance-table td {
  padding: 13px 12px;
  border-bottom: 1px solid var(--border, #dfe2dc);
  vertical-align: top;
}

.attendance-table th {
  background: #f4f5f0;
  color: var(--text, #2e3136);
  font-weight: 700;
  white-space: nowrap;
}

.status-label {
  display: inline-block;
  padding: 5px 9px;
  border-radius: 20px;
  background: #edf0f2;
  color: #555;
  font-size: 12px;
  white-space: nowrap;
}

.status-label.hadir {
  background: #e6f3eb;
  color: #397452;
}

.status-label.sakit {
  background: #fff3d8;
  color: #966b10;
}

.status-label.izin {
  background: #e8f0fa;
  color: #426a92;
}

.status-label.alpha {
  background: #fbe8e6;
  color: #a33e38;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 30px 16px;
  text-align: center;
  color: var(--muted, #747a80);
  font-size: 14px;
}

.error-state {
  color: #a33e38;
}

@media (max-width: 600px) {
  .calendar-card,
  .attendance-list-card {
    padding: 15px;
  }

  .calendar-grid {
    gap: 4px;
  }

  .calendar-day,
  .calendar-empty {
    min-height: 43px;
  }

  .calendar-weekday {
    font-size: 11px;
  }

  .attendance-table th,
  .attendance-table td {
    padding: 10px 9px;
  }
}

</style>