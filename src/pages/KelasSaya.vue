
<template>
  <div class="app-shell">
    <Sidebar role="guru" />

    <main class="main">
      <!-- Header -->
      <div class="page-head">
        <div>
          <h1>Data Kelas</h1>
          <p>Daftar siswa kelas 4</p>
        </div>

        <button class="btn primary">
          + Tambah Siswa
        </button>
      </div>

      <!-- Informasi kelas -->
      <div class="class-info">
        <div class="info-card">
          <span class="info-label">Kelas</span>
          <strong>4</strong>
        </div>

        <div class="info-card">
          <span class="info-label">Jumlah Siswa</span>
          <strong>{{ students.length }} Siswa</strong>
        </div>

        <div class="info-card">
          <span class="info-label">Status Database</span>
          <strong :class="dbConnected ? 'online' : 'offline'">
            {{ dbConnected ? 'Terhubung' : 'Tidak terhubung' }}
          </strong>
        </div>
      </div>

      <!-- Tabel siswa -->
      <section class="card section">
        <div class="card-title">
          <div>
            <h2>Daftar Siswa</h2>
            <p>Data siswa dari database MySQL</p>
          </div>

          <button
            class="btn refresh"
            @click="getStudents"
            :disabled="loading"
          >
            {{ loading ? 'Memuat...' : '↻ Refresh' }}
          </button>
        </div>

        <div class="table-wrap">
          <div v-if="loading" class="message">
            Memuat data siswa...
          </div>

          <div v-else-if="error" class="message error">
            {{ error }}
            <button class="btn refresh" @click="getStudents">
              Coba Lagi
            </button>
          </div>

          <table v-else>
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Siswa</th>
                <th>Jenis Kelamin</th>
                <th>NISN</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(student, index) in students"
                :key="student.id_siswa"
              >
                <td>{{ index + 1 }}</td>
                <td class="student-name">
                  {{ student.nama_siswa }}
                </td>
                <td>{{ student.jenis_kelamin }}</td>
                <td>{{ student.nisn }}</td>
              </tr>

              <tr v-if="students.length === 0">
                <td colspan="4" class="empty">
                  Belum ada data siswa.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Sidebar from '../components/Sidebar.vue'

const students = ref([])
const loading = ref(false)
const error = ref('')
const dbConnected = ref(false)

// Alamat PHP API
const API_URL =
'http://localhost/absensi-api/siswa.php'

// Mengambil data dari MySQL melalui PHP
const getStudents = async () => {
loading.value = true
error.value = ''

try {
    const response = await fetch(API_URL)

    if (!response.ok) {
    throw new Error('Server API tidak merespons')
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(
        result.message || 'Gagal mengambil data'
      )
    }

    students.value = result.data
    dbConnected.value = true

  } catch (err) {
    console.error('Kesalahan:', err)

    error.value =
      'Data siswa gagal dimuat. Periksa koneksi PHP dan MySQL.'

    dbConnected.value = false
  } finally {
    loading.value = false
  }
}

// Memuat data saat halaman dibuka
onMounted(() => {
  getStudents()
})
</script>

<style scoped>
.app-shell {
  display: flex;
  min-height: 100vh;
  background: #f3f3ee;
}

.main {
  flex: 1;
  min-width: 0;
  padding: 32px;
}

/* Header */
.page-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
}

.page-head h1 {
  margin: 0;
  font-size: 28px;
  color: #172033;
}

.page-head p {
  margin-top: 7px;
  color: #7b8497;
  font-size: 14px;
}

/* Button */
.btn {
  padding: 11px 17px;
  border: none;
  border-radius: 9px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.primary {
  background: #2563eb;
  color: white;
}

.refresh {
  background: #eff6ff;
  color: #2563eb;
}

/* Info cards */
.class-info {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  margin-bottom: 24px;
}

.info-card {
  padding: 20px;
  background: white;
  border: 1px solid #e8ebf1;
  border-radius: 12px;
}

.info-label {
  display: block;
  margin-bottom: 8px;
  color: #8992a3;
  font-size: 13px;
}

.info-card strong {
  font-size: 20px;
  color: #20293a;
}

.online {
  color: #16a34a !important;
}

.offline {
  color: #dc2626 !important;
}

/* Table card */
.card {
  background: white;
  border: 1px solid #e8ebf1;
  border-radius: 14px;
}

.section {
  overflow: hidden;
}

.card-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 20px 22px;
  border-bottom: 1px solid #edf0f4;
}

.card-title h2 {
  margin: 0;
  font-size: 18px;
  color: #20293a;
}

.card-title p {
  margin: 5px 0 0;
  color: #8992a3;
  font-size: 13px;
}

/* Table */
.table-wrap {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #f8fafc;
}

th {
  padding: 14px 20px;
  text-align: left;
  color: #697386;
  font-size: 13px;
}

td {
  padding: 15px 20px;
  border-top: 1px solid #edf0f4;
  color: #394357;
  font-size: 14px;
}

tbody tr:hover {
  background: #fafbfc;
}

th:first-child,
td:first-child {
  width: 70px;
  text-align: center;
}

.student-name {
  font-weight: 600;
  color: #20293a;
}

.message,
.empty {
  padding: 30px;
  text-align: center;
  color: #64748b;
}

.error {
  color: #dc2626;
}

/* Responsive */
@media (max-width: 768px) {
.main {
    padding: 20px;
}

.class-info {
    grid-template-columns: 1fr;
}

.page-head {
    align-items: flex-start;
    flex-direction: column;
}
}
</style>