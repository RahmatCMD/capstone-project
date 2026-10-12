<script setup>
import { computed, ref, onMounted } from 'vue'
import Sidebar from '../components/Sidebar.vue'

const API_URL = 'http://localhost/absensi-api/siswa.php'
const ABSEN_API_URL = 'http://localhost/absensi-api/absen.php'

const toast = ref('')
const filter = ref('Semua')
const loading = ref(false)
const errorMessage = ref('')

const students = ref([])

const statuses = ['Hadir', 'Sakit', 'Izin', 'Alpha']

function getToday() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const today = ref(getToday())

function formatTanggalIndonesia(dateString) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString(
    'id-ID',
    {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }
  )
}

const tanggalHariIni = computed(() =>
  formatTanggalIndonesia(today.value)
)

const defaultNotes = {
  Hadir: '-',
  Sakit: 'Siswa sedang sakit',
  Izin: 'Siswa mendapat izin',
  Alpha: 'Tanpa keterangan'
}

// Mengambil siswa dari MySQL melalui API PHP

async function getStudents() {
  loading.value = true
  errorMessage.value = ''

  try {
    // Ambil daftar siswa dari MySQL
    const responseSiswa = await fetch(API_URL)

    if (!responseSiswa.ok) {
      throw new Error(`Gagal mengambil siswa: HTTP ${responseSiswa.status}`)
    }

    const resultSiswa = await responseSiswa.json()

    if (!resultSiswa.success || !Array.isArray(resultSiswa.data)) {
      throw new Error(resultSiswa.message || 'Data siswa tidak valid.')
    }

    // Ambil absensi dari MySQL berdasarkan tanggal terpilih
    const urlAbsensi =
      `${ABSEN_API_URL}?tanggal=${encodeURIComponent(today.value)}`

    const responseAbsensi = await fetch(urlAbsensi)

    if (!responseAbsensi.ok) {
      throw new Error(`Gagal mengambil absensi: HTTP ${responseAbsensi.status}`)
    }

    const resultAbsensi = await responseAbsensi.json()

    if (!resultAbsensi.success || !Array.isArray(resultAbsensi.data)) {
      throw new Error(resultAbsensi.message || 'Data absensi tidak valid.')
    }

    const dataAbsensi = resultAbsensi.data

    // Gabungkan data siswa dan absensi berdasarkan NISN
    students.value = resultSiswa.data.map((item, index) => {
      const absensiSiswa = dataAbsensi.find(
        data => String(data.nisn) === String(item.nisn)
      )

      return {
        no: index + 1,
        id_siswa: item.id_siswa,
        name: item.nama_siswa,
        jenis_kelamin: item.jenis_kelamin,
        nisn: item.nisn,
        status: absensiSiswa?.status || '',
        note: absensiSiswa?.catatan ?? '-'
      }
    })
  } catch (error) {
    console.error('Gagal memuat data:', error)

    errorMessage.value =
      'Data gagal dimuat. Pastikan XAMPP aktif dan API siswa.php serta absen.php dapat diakses.'

    show('Gagal memuat data siswa atau absensi dari database.')
  } finally {
    loading.value = false
  }
}


// Statistik status
const counts = computed(() =>
  Object.fromEntries(
    statuses.map(status => [
      status,
      students.value.filter(
        student => student.status === status
      ).length
    ])
  )
)

const belumDiisi = computed(() =>
  students.value.filter(student => !student.status).length
)

// Filter tabel termasuk siswa yang belum diisi
const visible = computed(() => {
  if (filter.value === 'Semua') {
    return students.value
  }

  if (filter.value === 'Belum diisi') {
    return students.value.filter(student => !student.status)
  }

  return students.value.filter(
    student => student.status === filter.value
  )
})

// Mengubah status dan catatan default
function setStatus(student, status) {
  student.status = status

  if (defaultNotes[status] !== undefined) {
    student.note = defaultNotes[status]
  }
}

// Menandai semua siswa hadir
function allPresent() {
  students.value.forEach(student => {
    setStatus(student, 'Hadir')
  })

  show('Semua siswa ditandai hadir.')
}

// Menyimpan absensi berdasarkan tanggal

async function save() {
  if (students.value.length === 0) {
    show('Data siswa belum tersedia.')
    return
  }

  const semuaSudahDiisi = students.value.every(
    student => Boolean(student.status)
  )

  if (!semuaSudahDiisi) {
    show('Silakan isi status semua siswa terlebih dahulu.')
    filter.value = 'Belum diisi'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const payload = {
      tanggal: today.value,
      data: students.value.map(student => ({
        nisn: String(student.nisn),
        status: student.status,
        catatan: student.note || '-'
      }))
    }

    const response = await fetch(ABSEN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const result = await response.json()

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Gagal menyimpan absensi.')
    }

    show(`Absensi ${tanggalHariIni.value} berhasil disimpan ke MySQL.`)

    // Muat ulang data dari database untuk memastikan hasil tersimpan
    await getStudents()
  } catch (error) {
    console.error('Gagal menyimpan absensi:', error)

    errorMessage.value = error.message

    show('Absensi gagal disimpan. Periksa API dan koneksi database.')
  } finally {
    loading.value = false
  }
}


function show(message) {
  toast.value = message

  setTimeout(() => {
    toast.value = ''
  }, 2400)
}

onMounted(() => {
  getStudents()
})
</script>

<template>
  <div class="app-shell">
    <Sidebar role="guru" />
    <main class="main">
      
<!-- ================= HEADER ================= -->
<div class="page-head">
    <div>
      <h1>Input Absensi</h1>
          <p>{{tanggalHariIni}}</p>
          <p>Mapel : Olahraga dan Keterampilan , Jam 1–2
          </p>

        </div>


        <div class="actions">

          <button
            class="btn"
            @click="allPresent"
          >
            Tandai Semua Hadir
          </button>


          <button
            class="btn primary"
            @click="save"
          >
            Simpan Absensi
          </button>

        </div>

      </div>

      <p v-if="loading" class="small-note">
        Memuat data siswa dari database...
      </p>

      <p v-else-if="errorMessage" class="small-note">
          {{ errorMessage }}
          <button class="btn" @click="getStudents">
                Coba Lagi
          </button>
      </p>

      <!-- ================= FILTER ================= -->
    <div class="tabs">
      <button
        class="tab"
        :class="{ active: filter === 'Semua' }"
        @click="filter = 'Semua'">
        Semua ({{ students.length }})
      </button>

      <button
        class="tab"
        :class="{ active: filter === 'Belum diisi' }"
        @click="filter = 'Belum diisi'">
        Belum diisi ({{ belumDiisi }})
      </button>

  <button
    v-for="s in statuses"
    :key="s"
    class="tab"
    :class="{ active: filter === s }"
    @click="filter = s"
  >
    {{ s }} ({{ counts[s] }})
  </button>
</div>


      <!-- ================= TABLE ================= -->

      <section class="card">

        <div class="table-wrap">

          <table>

            <thead>

              <tr>

                <th>No</th>

                <th>Nama Siswa</th>

                <th>NISN</th>

                <th>Status Kehadiran</th>

                <th>Catatan</th>

              </tr>

            </thead>


            <tbody>

              <tr
                v-for="student in visible"
                :key="student.no"
              >

                <!-- NO -->
                <td>
                  {{ student.no }}
                </td>


                <!-- NAMA -->
                <td>
                  {{ student.name }}
                </td>


                <!-- NISN -->
                <td>
                  {{ student.nisn }}
                </td>


                <!-- STATUS -->
                <td>
                <select
                  v-model="student.status"
                  class="status-select" @change="setStatus(student, student.status)">
  
                  <option value="">Pilih status</option>
                  <option value="Hadir">Hadir</option>
                  <option value="Sakit">Sakit</option>
                  <option value="Izin">Izin</option>
                  <option value="Alpha">Alpha</option>
                </select>
                </td>


                <!-- CATATAN -->
                <td>

                  <input
                    v-model="student.note"
                    class="note-input"
                    type="text"
                    placeholder="Masukkan catatan..."
                  />

                </td>

              </tr>

            </tbody>

          </table>

        </div>

      </section>


      <!-- ================= FOOTER ================= -->

      <p
        class="small-note"
        style="margin-top:10px"
      >
        Menampilkan {{ visible.length }}
        dari {{ students.length }} siswa.
        Data absensi disimpan ke database MySQL berdasarkan tanggal.
      </p>

    </main>


    <!-- ================= TOAST ================= -->

    <div
      v-if="toast"
      class="toast"
    >
      {{ toast }}
    </div>

  </div>

</template>


<style scoped>

/* =========================
  LAYOUT UTAMA
========================= */

.app-shell {
  display: flex;
  min-height: 100vh;
  width: 100%;
  background: #f4f5f0;
  color: #263247;
  box-sizing: border-box;
}

.main {
  flex: 1;
  min-width: 0;
  padding: 30px;
  box-sizing: border-box;
}

/* =========================
  HEADER
========================= */

.page-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 26px;
}

.page-head h1 {
  margin: 0 0 10px;
  font-size: 28px;
  font-weight: 700;
  color: #263247;
}

.page-head p {
  margin: 0;
  color: #7d899d;
  font-size: 14px;
  line-height: 1.7;
}

/* =========================
  TOMBOL
========================= */

.actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.btn {
  min-height: 42px;
  padding: 10px 16px;
  border: 1px solid #dce3ed;
  border-radius: 9px;
  background: #fff;
  color: #34445d;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s ease;
}

.btn:hover {
  background: #f0f5ff;
  border-color: #9db9f9;
}

.btn.primary {
  background: #2864e8;
  color: #fff;
  border-color: #2864e8;
}

.btn.primary:hover {
  background: #1f52c6;
}

/* =========================
  FILTER STATUS
========================= */

.tabs {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.tab {
  padding: 10px 15px;
  border: 1px solid #e0e6ef;
  border-radius: 9px;
  background: #fff;
  color: #68768b;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.tab:hover {
  border-color: #9db9f9;
}

.tab.active {
  background: #eaf1ff;
  color: #2864e8;
  border-color: #cbdcff;
}

/* =========================
  KARTU DAN TABEL
========================= */

.card {
  width: 100%;
  min-width: 0;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e5eaf2;
  border-radius: 16px;
  box-shadow: 0 3px 12px rgba(31, 45, 70, 0.04);
}

.table-wrap {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

table {
  width: 100%;
  min-width: 800px;
  border-collapse: collapse;
  font-size: 14px;
}

thead {
  background: #f8faff;
}

th {
  padding: 16px;
  text-align: left;
  color: #65738a;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  border-bottom: 1px solid #e8edf4;
}

td {
  padding: 15px 16px;
  color: #344158;
  vertical-align: middle;
  border-bottom: 1px solid #edf0f5;
}

tbody tr:last-child td {
  border-bottom: none;
}

tbody tr:hover {
  background: #fafcff;
}

/* =========================
  DROPDOWN STATUS
========================= */

.status-select {
  width: 145px;
  max-width: 100%;
  height: 40px;
  padding: 0 10px;
  border: 1px solid #d9dee7;
  border-radius: 8px;
  background: #fff;
  color: #344158;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
  outline: none;
}

.status-select:hover,
.status-select:focus {
  border-color: #2864e8;
  box-shadow: 0 0 0 3px rgba(40, 100, 232, 0.1);
}

/* =========================
  INPUT CATATAN
========================= */

.note-input {
  width: 190px;
  min-width: 150px;
  height: 40px;
  padding: 0 12px;
  box-sizing: border-box;
  border: 1px solid #d9dee7;
  border-radius: 8px;
  background: #fff;
  color: #344158;
  font: inherit;
  font-size: 13px;
  outline: none;
}

.note-input:focus {
  border-color: #2864e8;
  box-shadow: 0 0 0 3px rgba(40, 100, 232, 0.1);
}

.note-input::placeholder {
  color: #a0a9b8;
}

/* =========================
  CATATAN BAWAH
========================= */

.small-note {
  color: #7d899d;
  font-size: 12px;
  line-height: 1.7;
}

/* =========================
  NOTIFIKASI
========================= */

.toast {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 1000;
  max-width: calc(100vw - 48px);
  padding: 14px 20px;
  border-radius: 10px;
  background: #263247;
  color: #fff;
  font-size: 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

/* =========================
  TABLET
========================= */

@media (max-width: 1024px) {
  .main {
    padding: 22px;
  }

  .page-head {
    flex-direction: column;
  }

  .actions {
    width: 100%;
  }
}

/* =========================
  HP
========================= */
@media (max-width: 768px) {
  .main {
    width: 100%;
    padding: 16px 12px 24px;
  }
  .page-head {
    gap: 16px;
    margin-bottom: 20px;
  }
  .page-head h1 {
    font-size: 23px;
  }
  .page-head p {
    font-size: 13px;
  }
  .actions {
    display: grid;
    grid-template-columns: 1fr;
    gap: 9px;
  }
  .btn {
    width: 100%;
    min-height: 44px;
  }
  .tabs {
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: 8px;
  }
  .tab {
    flex-shrink: 0;
  }
  .card {
    border-radius: 12px;
  }
  table {
    min-width: 760px;
  }
  th,
  td {
    padding: 12px;
  }
  .toast {
    right: 12px;
    bottom: 12px;
    max-width: calc(100vw - 24px);
  }
}
</style>