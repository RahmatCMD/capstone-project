
<script setup>
import { computed, ref, onMounted, onUnmounted, onActivated } from 'vue'
import Sidebar from '../components/Sidebar.vue'

const semuaAbsensi = ref({})
const search = ref('')
const status = ref('Semua Status')
const toast = ref('')

// Membaca data absensi yang disimpan oleh halaman Input Absensi
function muatRiwayat() {
  try {
    semuaAbsensi.value = JSON.parse(
      localStorage.getItem('absensi-data') || '{}'
    )
  } catch (error) {
    console.error('Gagal membaca riwayat absensi:', error)
    semuaAbsensi.value = {}
  }
}

onMounted(() => {
  muatRiwayat()
  window.addEventListener('storage', muatRiwayat)
  window.addEventListener('focus', muatRiwayat)
})

onActivated(() => {
  muatRiwayat()
})

onUnmounted(() => {
  window.removeEventListener('storage', muatRiwayat)
  window.removeEventListener('focus', muatRiwayat)
})

// Daftar bulan yang memiliki data
const bulanTersedia = computed(() => {
  return [...new Set(
    Object.keys(semuaAbsensi.value).map(tanggal => tanggal.substring(0, 7))
  )].sort().reverse()
})

function bulanHariIni() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

const bulanDipilih = ref(
  bulanTersedia.value.includes(bulanHariIni())
    ? bulanHariIni()
    : bulanTersedia.value[0] || bulanHariIni()
)

// Jika data baru masuk dan bulan yang dipilih belum tersedia,
// pilih bulan terbaru yang mempunyai data.
const bulanTersediaKey = computed(() => bulanTersedia.value.join(','))

import { watch } from 'vue'

watch(bulanTersediaKey, () => {
  if (
    bulanTersedia.value.length &&
    !bulanTersedia.value.includes(bulanDipilih.value)
  ) {
    bulanDipilih.value = bulanTersedia.value[0]
  }
})

function formatBulan(bulan) {
  const [tahun, bulanAngka] = bulan.split('-')
  return new Date(Number(tahun), Number(bulanAngka) - 1, 1)
    .toLocaleDateString('id-ID', {
      month: 'long',
      year: 'numeric'
    })
}

// Gabungkan absensi seluruh tanggal pada bulan yang dipilih
const dataBulanIni = computed(() => {
  const hasil = []

  Object.entries(semuaAbsensi.value).forEach(([tanggal, siswa]) => {
    if (tanggal.startsWith(bulanDipilih.value) && Array.isArray(siswa)) {
      siswa.forEach(student => {
        hasil.push({ ...student, date: tanggal })
      })
    }
  })

  return hasil
})

// Rekap absensi per siswa
const dataRekap = computed(() => {
  const siswaMap = {}

  dataBulanIni.value.forEach(student => {
    if (!student.nisn) return

    if (!siswaMap[student.nisn]) {
      siswaMap[student.nisn] = {
        name: student.name || 'Tanpa nama',
        nisn: student.nisn,
        hadir: 0,
        sakit: 0,
        izin: 0,
        alpha: 0,
        total: 0
      }
    }

    const siswa = siswaMap[student.nisn]

    if (['Hadir', 'Sakit', 'Izin', 'Alpha'].includes(student.status)) {
      siswa.total++
    }

    if (student.status === 'Hadir') siswa.hadir++
    if (student.status === 'Sakit') siswa.sakit++
    if (student.status === 'Izin') siswa.izin++
    if (student.status === 'Alpha') siswa.alpha++
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

// Ringkasan bulan terpilih
const totalHariEfektif = computed(() => {
  return new Set(
    dataBulanIni.value
      .filter(item => ['Hadir', 'Sakit', 'Izin', 'Alpha'].includes(item.status))
      .map(item => item.date)
  ).size
})

const rataRataKehadiran = computed(() => {
  const total = dataBulanIni.value.filter(item =>
    ['Hadir', 'Sakit', 'Izin', 'Alpha'].includes(item.status)
  )

  if (!total.length) return 0

  const hadir = total.filter(item => item.status === 'Hadir').length
  return Math.round((hadir / total.length) * 100)
})

const siswaPerluTindakLanjut = computed(() => {
  return dataRekap.value.filter(siswa => siswa.alpha > 2).length
})

function showToast(message) {
  toast.value = message
  setTimeout(() => {
    toast.value = ''
  }, 2200)
}

// Cetak halaman
function printPage() {
  window.print()
}

// Tombol Detail
function action(name) {
  showToast(`Detail rekap ${name} dipilih.`)
}

// Unduh rekap CSV
function exportData() {
  if (!dataRekap.value.length) {
    showToast('Belum ada data absensi untuk diunduh.')
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

  const rows = dataRekap.value.map(siswa => [
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
      <div class="page-head">
        <div>
          <h1>Riwayat & Rekap Absensi</h1>
          <p>Kelas 4 · Periode {{ formatBulan(bulanDipilih) }}</p>
        </div>

        <div class="actions">
          <button class="btn" @click="exportData">Unduh Rekap</button>
          <button class="btn primary" @click="printPage">Cetak</button>
        </div>
      </div>

      <div class="filter-row">
        <select>
          <option>Kelas 4</option>
        </select>

        <select v-model="bulanDipilih">
          <option
            v-for="bulan in bulanTersedia"
            :key="bulan"
            :value="bulan"
          >
            Bulan: {{ formatBulan(bulan) }}
          </option>

          <option
            v-if="bulanTersedia.length === 0"
            :value="bulanHariIni()"
          >
            Bulan: {{ formatBulan(bulanHariIni()) }}
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
          class="search"
          placeholder="Cari nama siswa..."
        />
      </div>

      <section class="grid" style="gap:6px">
        <div class="card">
          <h3 class="card-title">Rata-rata Kehadiran</h3>
          <div class="big-number">{{ rataRataKehadiran }}%</div>
          <div class="progress">
            <span :style="{ width: rataRataKehadiran + '%' }"></span>
          </div>
        </div>

        <div class="card">
          <h3 class="card-title">Total Hari Efektif</h3>
          <div class="big-number">{{ totalHariEfektif }}</div>
          <div class="small-note">hari belajar bulan ini</div>
        </div>

        <div class="card">
          <h3 class="card-title">Siswa Perlu Tindak Lanjut</h3>
          <div class="big-number" style="color:#bd554e">
            {{ siswaPerluTindakLanjut }}
          </div>
          <div class="small-note">alpha lebih dari 2 kali bulan ini</div>
        </div>
      </section>

      <section class="card section">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nama Siswa</th>
                <th>Hadir</th>
                <th>Sakit</th>
                <th>Izin</th>
                <th>Alpha</th>
                <th>% Kehadiran</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="siswa in filtered" :key="siswa.nisn">
                <td>{{ siswa.name }}</td>
                <td>{{ siswa.hadir }}</td>
                <td>{{ siswa.sakit }}</td>
                <td>{{ siswa.izin }}</td>
                <td>{{ siswa.alpha }}</td>
                <td>{{ siswa.persentase }}%</td>
                <td>
                  <button
                    class="link-button"
                    @click="action(siswa.name)"
                  >
                    Detail
                  </button>
                </td>
              </tr>

              <tr v-if="filtered.length === 0">
                <td colspan="7" style="text-align:center">
                  Belum ada data absensi pada periode ini.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <p class="small-note" style="margin-top:10px">
        Rekap dihitung dari data absensi yang tersimpan untuk bulan terpilih.
      </p>
    </main>

    <div v-if="toast" class="toast">{{ toast }}</div>
  </div>
</template>

<style scoped>
@media print {
  .actions,
  .filter-row,
  .sidebar,
  .toast {
    display: none !important;
  }

  .main {
    width: 100%;
    padding: 0;
  }

  .card {
    box-shadow: none;
    border: 1px solid #ddd;
  }

  .page-head {
    margin-bottom: 20px;
  }

  table {
    width: 100%;
  }

  .link-button {
    display: none !important;
  }
}
</style>