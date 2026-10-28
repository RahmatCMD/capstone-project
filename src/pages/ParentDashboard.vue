<script setup>
import { computed, ref, onMounted, onActivated, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '../components/Sidebar.vue'

const router = useRouter()
const toast = ref('')

// API PHP
const ABSEN_API_URL = 'http://localhost/absensi-api/absen.php'

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
const dataAbsensiBulan = ref([])
const loading = ref(false)
const errorApi = ref('')

const absensiNadia = computed(() => {
  return dataAbsensiBulan.value.filter(item => {
    const nama = String(
      item.nama_siswa || item.nama || ''
    ).trim().toLowerCase()

    return nama === 'nadia putri'
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
    const response = await fetch(
      `${ABSEN_API_URL}?bulan=${tahun}-${bulan}`
    )

    const result = await response.json()

    if (!response.ok || result.success === false) {
      throw new Error(result.message || 'Gagal mengambil data absensi.')
    }

    dataAbsensiBulan.value = Array.isArray(result.data)
      ? result.data
      : []
  } catch (error) {
    console.error('Gagal memuat absensi:', error)
    errorApi.value =
      'Data belum dapat dimuat. Periksa Apache, MySQL, dan API PHP.'
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

const statistikHariIni = computed(() => {
  const data = absensiHariIni.value

  return {
    hadir: data.filter(
      s => String(s.status).toLowerCase() === 'hadir'
    ).length,

    sakit: data.filter(
      s => String(s.status).toLowerCase() === 'sakit'
    ).length,

    izin: data.filter(
      s => String(s.status).toLowerCase() === 'izin'
    ).length,

    alpha: data.filter(
      s => String(s.status).toLowerCase() === 'alpha'
    ).length,

    belumDiisi: 0,
    total: data.length
  }
})

const persentaseHadir = computed(() => {
  const total = statistikHariIni.value.total

  if (!total) return 0

  return Math.round(
    (statistikHariIni.value.hadir / total) * 100
  )
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

function show(message) {
  toast.value = message
  setTimeout(() => {
    toast.value = ''
  }, 2200)
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
      <button class="btn">{{ currentDate }}</button>
      <button
        class="btn primary"
        @click="router.push('/guru/absensi')"
      >
        + Input Absensi Hari Ini
      </button>
    </div>
  </div>

  <!-- Statistik absensi -->
  <section class="grid stats">
    <div class="card stat-card">
      <h3 class="card-title">Hadir Hari Ini</h3>
      <div class="big-number" style="color:#56816d">
        {{ statistikHariIni.hadir }}
      </div>
      <div class="small-note">
        dari {{ statistikHariIni.total }} catatan absensi
        ({{ persentaseHadir }}%)
      </div>
    </div>

    <div class="card stat-card">
      <h3 class="card-title">Sakit</h3>
      <div class="big-number" style="color:#bd922d">
        {{ statistikHariIni.sakit }}
      </div>
      <div class="small-note">siswa berstatus sakit</div>
    </div>

    <div class="card stat-card">
      <h3 class="card-title">Izin</h3>
      <div class="big-number" style="color:#5b7890">
        {{ statistikHariIni.izin }}
      </div>
      <div class="small-note">siswa berstatus izin</div>
    </div>

    <div class="card stat-card">
      <h3 class="card-title">Alpha</h3>
      <div class="big-number" style="color:#bd554e">
        {{ statistikHariIni.alpha }}
      </div>
      <div class="small-note">siswa berstatus alpha</div>
    </div>
  </section>

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

  <!-- DAFTAR SISWA BERDASARKAN TANGGAL -->
  <section class="card attendance-list-card">
    <div class="section-heading">
      <div>
        <h2>Data Absensi Siswa</h2>
        <p>{{ tanggalDipilihFormat }}</p>
      </div>

      <span class="attendance-count">
        {{ absensiHariIni.length }} data
      </span>
    </div>

    <div v-if="loading" class="empty-state">
      Memuat data absensi...
    </div>

    <div v-else-if="errorApi" class="empty-state error-state">
      {{ errorApi }}
      <button class="btn primary" @click="muatAbsensiBulan">
        Coba Lagi
      </button>
    </div>

    <div v-else-if="absensiHariIni.length === 0" class="empty-state">
      Belum ada data absensi pada tanggal ini.
    </div>

    <div v-else class="table-wrapper">
      <table class="attendance-table">
        <thead>
          <tr>
            <th>No.</th>
            <th>Nama Siswa</th>
            <th>NISN</th>
            <th>Status</th>
            <th>Catatan</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(siswa, index) in absensiHariIni"
            :key="`${siswa.nisn}-${siswa.tanggal}`"
          >
            <td>{{ index + 1 }}</td>
            <td>{{ siswa.nama_siswa || siswa.nama || '-' }}</td>
            <td>{{ siswa.nisn }}</td>
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