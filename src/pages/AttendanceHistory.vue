<script setup>
import {
  computed,
  ref,
  onMounted,
  onUnmounted,
  onActivated
} from 'vue'

import Sidebar from '../components/Sidebar.vue'

const SISWA_API_URL = 'https://portalabsensi.free.nf/siswa.php'
fetch(`${API_URL}siswa.php`)
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('Data siswa:', data);
  })
  .catch(error => {
    console.error('Gagal memuat data siswa:', error);
  });

const ABSEN_API_URL = 'https://portalabsensi.free.nf/absen.php'
fetch(`${API_URL}absen.php`)
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('Data siswa:', data);
  })
  .catch(error => {
    console.error('Gagal memuat data siswa:', error);
  });
const semuaSiswa = ref([])
const semuaAbsensi = ref([])
const loading = ref(false)
const search = ref('')
const status = ref('Semua Status')
const toast = ref('')

let toastTimer

function bulanHariIni() {
  const now = new Date()

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, '0')}`
}

const bulanDipilih = ref(bulanHariIni())

// Mengambil data siswa dan absensi dari PHP API
async function muatRiwayat() {
  loading.value = true

  try {
    const [responseSiswa, responseAbsensi] = await Promise.all([
      fetch(SISWA_API_URL),
      fetch(ABSEN_API_URL)
    ])

    if (!responseSiswa.ok || !responseAbsensi.ok) {
      throw new Error('Gagal menghubungi API PHP.')
    }

    const resultSiswa = await responseSiswa.json()
    const resultAbsensi = await responseAbsensi.json()

    if (
      !resultSiswa.success ||
      !Array.isArray(resultSiswa.data)
    ) {
      throw new Error(
        resultSiswa.message || 'Data siswa tidak valid.'
      )
    }

    if (
      !resultAbsensi.success ||
      !Array.isArray(resultAbsensi.data)
    ) {
      throw new Error(
        resultAbsensi.message || 'Data absensi tidak valid.'
      )
    }

    semuaSiswa.value = resultSiswa.data

    semuaAbsensi.value = resultAbsensi.data.map(item => ({
      id: item.id,
      nisn: String(item.nisn),
      name: item.nama_siswa,
      date: String(item.tanggal).slice(0, 10),
      status: item.status,
      note: item.catatan || ''
    }))

    // Jika bulan yang dipilih belum memiliki data,
    // otomatis pilih bulan terbaru yang tersedia.
    const bulanTerbaru = [
      ...new Set(
        semuaAbsensi.value.map(item => item.date.slice(0, 7))
      )
    ].sort().reverse()

    if (
      bulanTerbaru.length &&
      !bulanTerbaru.includes(bulanDipilih.value)
    ) {
      bulanDipilih.value = bulanTerbaru[0]
    }
  } catch (error) {
    console.error('Gagal memuat rekap:', error)

    showToast(
      'Gagal mengambil data. Periksa XAMPP, MySQL, dan API PHP.'
    )
  } finally {
    loading.value = false
  }
}

// Muat ulang ketika halaman dibuka atau browser kembali aktif
function saatFokus() {
  muatRiwayat()
}

onMounted(() => {
  muatRiwayat()
  window.addEventListener('focus', saatFokus)
})

onActivated(() => {
  muatRiwayat()
})

onUnmounted(() => {
  window.removeEventListener('focus', saatFokus)
  clearTimeout(toastTimer)
})

// Daftar bulan yang memiliki data absensi
const bulanTersedia = computed(() => {
  return [
    ...new Set(
      semuaAbsensi.value.map(item => item.date.slice(0, 7))
    )
  ].sort().reverse()
})

function formatBulan(bulan) {
  const [tahun, bulanAngka] = bulan.split('-')

  return new Date(
    Number(tahun),
    Number(bulanAngka) - 1,
    1
  ).toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric'
  })
}

// Data absensi berdasarkan bulan terpilih
const dataBulanIni = computed(() => {
  return semuaAbsensi.value.filter(item =>
    item.date.startsWith(bulanDipilih.value)
  )
})

// Rekap seluruh siswa, termasuk siswa yang belum memiliki absensi
const dataRekap = computed(() => {
  const siswaMap = {}

  semuaSiswa.value.forEach(item => {
    const nisn = String(item.nisn)

    siswaMap[nisn] = {
      name: item.nama_siswa,
      nisn,
      hadir: 0,
      sakit: 0,
      izin: 0,
      alpha: 0,
      total: 0
    }
  })

  // Satu siswa dihitung maksimal sekali per tanggal.
  // Jika terdapat catatan ganda, gunakan catatan terakhir.
  const absensiUnik = new Map()

  dataBulanIni.value.forEach(item => {
    const key = `${item.nisn}_${item.date}`
    absensiUnik.set(key, item)
  })

  absensiUnik.forEach(item => {
    const siswa = siswaMap[String(item.nisn)]

    if (!siswa) return

    if (
      !['Hadir', 'Sakit', 'Izin', 'Alpha'].includes(item.status)
    ) {
      return
    }

    siswa.total++

    if (item.status === 'Hadir') siswa.hadir++
    if (item.status === 'Sakit') siswa.sakit++
    if (item.status === 'Izin') siswa.izin++
    if (item.status === 'Alpha') siswa.alpha++
  })

  return Object.values(siswaMap).map(siswa => ({
    ...siswa,
    persentase: siswa.total
      ? Math.round((siswa.hadir / siswa.total) * 100)
      : 0
  }))
})

// Pencarian nama dan filter status
const filtered = computed(() => {
  return dataRekap.value.filter(siswa => {
    const cocokNama = siswa.name
      .toLowerCase()
      .includes(search.value.toLowerCase())

    let cocokStatus = true

    if (status.value === 'Hadir') cocokStatus = siswa.hadir > 0
    if (status.value === 'Sakit') cocokStatus = siswa.sakit > 0
    if (status.value === 'Izin') cocokStatus = siswa.izin > 0
    if (status.value === 'Alpha') cocokStatus = siswa.alpha > 0

    return cocokNama && cocokStatus
  })
})

// Jumlah tanggal pembelajaran yang memiliki catatan absensi
const totalHariEfektif = computed(() => {
  return new Set(
    dataBulanIni.value
      .filter(item =>
        ['Hadir', 'Sakit', 'Izin', 'Alpha'].includes(item.status)
      )
      .map(item => item.date)
  ).size
})

// Rata-rata dari seluruh catatan absensi yang valid
const rataRataKehadiran = computed(() => {
  const catatanValid = dataBulanIni.value.filter(item =>
    ['Hadir', 'Sakit', 'Izin', 'Alpha'].includes(item.status)
  )

  if (!catatanValid.length) return 0

  const jumlahHadir = catatanValid.filter(
    item => item.status === 'Hadir'
  ).length

  return Math.round((jumlahHadir / catatanValid.length) * 100)
})

// Siswa dengan Alpha lebih dari dua kali
const siswaPerluTindakLanjut = computed(() => {
  return dataRekap.value.filter(
    siswa => siswa.alpha > 2
  ).length
})

function showToast(message) {
  toast.value = message
  clearTimeout(toastTimer)

  toastTimer = setTimeout(() => {
    toast.value = ''
  }, 2200)
}

function printPage() {
  window.print()
}

function action(name) {
  showToast(`Detail rekap ${name} dipilih.`)
}

// Unduh rekap CSV
function exportData() {
  if (!dataRekap.value.length) {
    showToast('Data siswa belum tersedia.')
    return
  }

  const header = [
    'Nama',
    'NISN',
    'Hadir',
    'Sakit',
    'Izin',
    'Alpha',
    '% Kehadiran'
  ]

  const rows = filtered.value.map(siswa => [
    `"${String(siswa.name).replace(/"/g, '""')}"`,
    `"${String(siswa.nisn).replace(/"/g, '""')}"`,
    siswa.hadir,
    siswa.sakit,
    siswa.izin,
    siswa.alpha,
    `${siswa.persentase}%`
  ].join(','))

  const csv = [header.join(','), ...rows].join('\n')

  const blob = new Blob(['\ufeff' + csv], {
    type: 'text/csv;charset=utf-8;'
  })

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')

  a.href = url
  a.download = `rekap-absensi-${bulanDipilih.value}.csv`
  a.click()

  URL.revokeObjectURL(url)
  showToast('Rekap berhasil diunduh.')
}
</script>


<template>
  <div class="app-shell">
    <Sidebar role="guru" />

    <main class="main">
      <section class="rekap-container">
        <!-- Judul halaman -->
        <header class="rekap-header">
          <h1>Riwayat &amp; Rekap Absensi</h1>
          <p>Kelas 4 · {{ formatBulan(bulanDipilih) }}</p>
        </header>

        <!-- Ringkasan -->
        <div class="ringkasan">
          <div class="ringkasan-item">
            <span>Rata-rata hadir</span>
            <strong class="angka-hadir">
              {{ rataRataKehadiran }}%
            </strong>
          </div>

          <div class="ringkasan-item">
            <span>Hari efektif</span>
            <strong>{{ totalHariEfektif }}</strong>
          </div>

          <div class="ringkasan-item">
            <span>Jumlah siswa</span>
            <strong>{{ semuaSiswa.length }}</strong>
          </div>
        </div>

        <div class="pemisah"></div>

        <!-- Rekap kehadiran -->
        <section class="rekap-tabel">
          <div class="judul-tabel">
            <h2>Rekap Kehadiran Siswa</h2>
          </div>

          <!-- Filter tetap tersedia -->
          <div class="filter-row">
            <select v-model="bulanDipilih">
              <option
                v-for="bulan in bulanTersedia"
                :key="bulan"
                :value="bulan"
              >
                {{ formatBulan(bulan) }}
              </option>

              <option
                v-if="bulanTersedia.length === 0"
                :value="bulanHariIni()"
              >
                {{ formatBulan(bulanHariIni()) }}
              </option>
            </select>

            <select v-model="status">
              <option>Semua Status</option>
              <option>Hadir</option>
              <option>Sakit</option>
              <option>Izin</option>
              <option>Alpha</option>
            </select>

            <input
              v-model="search"
              type="text"
              placeholder="Cari nama siswa..."
            />

            <button class="btn-unduh" @click="exportData">
              Unduh Rekap
            </button>

            <button class="btn-cetak" @click="printPage">
              Cetak
            </button>
          </div>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nama Siswa</th>
                  <th>Hadir</th>
                  <th>Sakit</th>
                  <th>Izin</th>
                  <th>Alpha</th>
                  <th>Kehadiran</th>
                  <th>Detail</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="siswa in filtered"
                  :key="siswa.nisn"
                >
                  <td>{{ siswa.name }}</td>
                  <td>{{ siswa.hadir }}</td>
                  <td>{{ siswa.sakit }}</td>
                  <td>{{ siswa.izin }}</td>
                  <td>{{ siswa.alpha }}</td>
                  <td>
                    {{ siswa.persentase.toLocaleString('id-ID') }}%
                  </td>
                  <td>
                    <button
                      class="btn-detail"
                      @click="action(siswa.name)"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
                <tr v-if="filtered.length === 0">
                  <td colspan="7" class="kosong">
                    {{
                      loading
                        ? 'Sedang memuat data...'
                        : 'Belum ada data absensi pada periode ini.'
                    }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p class="catatan-bawah">
            Rekap data absen siswa per 1 bulan berjalan.
          </p>
        </section>
      </section>

      <div v-if="toast" class="toast">{{ toast }}</div>
    </main>
  </div>
</template>


<style scoped>
.app-shell {
  min-height: 100vh;
}

.main {
  min-width: 0;
  padding: 16px;
  color: #171717;
  font-family: Arial, Helvetica, sans-serif;
}

.rekap-container {
  width: 100%;
  box-sizing: border-box;
  padding: 14px;
  background: #fff;
  border: 1px solid #dedede;
  border-radius: 15px;
}

.rekap-header h1 {
  margin: 0 0 10px;
  font-size: 25px;
  font-weight: 700;
  color: #263247;
}

.rekap-header p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.ringkasan {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
  padding: 25px 8px 28px;
}

.ringkasan-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ringkasan-item span {
  color: #666;
  font-size: 15px;
}

.ringkasan-item strong {
  font-size: 22px;
  font-weight: 500;
}

.ringkasan-item .angka-hadir {
  color: #4f8068;
}

.pemisah {
  height: 1px;
  background: #ededed;
}

.rekap-tabel {
  padding-top: 25px;
}

.judul-tabel h2 {
  margin: 0 0 17px;
  font-size: 17px;
  font-weight: 600;
}

.judul-tabel p {
  margin: 0 0 16px;
  color: #666;
  font-size: 12px;
  line-height: 1.6;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}

.filter-row select,
.filter-row input {
  min-width: 0;
  padding: 9px 11px;
  color: #333;
  background: #fff;
  border: 1px solid #dedede;
  border-radius: 7px;
  font: inherit;
  font-size: 12px;
}

.filter-row input {
  flex: 1;
  min-width: 150px;
}

.btn-unduh,
.btn-cetak,
.btn-detail {
  padding: 8px 12px;
  border: 0;
  border-radius: 6px;
  cursor: pointer;
  font: inherit;
  font-size: 12px;
}

.btn-unduh {
  color: #333;
  background: #f2f2ef;
}

.btn-cetak {
  color: #fff;
  background: #2196ed;
}

.table-wrap {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 13px;
}

th,
td {
  padding: 12px 8px;
  border-bottom: 1px solid #ededed;
}

th {
  font-weight: 600;
  white-space: nowrap;
}

th:not(:first-child),
td:not(:first-child) {
  text-align: center;
}

.btn-detail {
  color: #73500c;
  background: #f5f3ec;
}

.selengkapnya {
  color: #777;
  text-align: left !important;
  font-size: 12px;
}

.kosong {
  padding: 24px 8px;
  color: #777;
  text-align: center !important;
}

.catatan-bawah {
  margin: 22px 0 0;
  color: #666;
  font-size: 15px;
  line-height: 1.6;
}

.toast {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 1000;
  padding: 12px 18px;
  color: white;
  background: #294d75;
  border-radius: 8px;
  box-shadow: 0 4px 14px #0002;
}

@media (max-width: 600px) {
  .main {
    padding: 10px;
  }

  .rekap-container {
    padding: 12px;
  }

  .ringkasan {
    gap: 10px;
    padding: 22px 4px;
  }

  .ringkasan-item strong {
    font-size: 19px;
  }

  .filter-row > * {
    max-width: 100%;
  }

  table {
    min-width: 580px;
  }
}

@media print {
  .filter-row,
  .btn-detail,
  .toast,
  .catatan-bawah {
    display: none !important;
  }

  .main {
    padding: 0;
  }

  .rekap-container {
    border: none;
  }
}
</style>
