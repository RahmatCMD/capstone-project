<script setup>
import { ref, onMounted } from 'vue'
import Sidebar from '../components/Sidebar.vue'

const students = ref([])
const loading = ref(false)
const error = ref('')
const dbConnected = ref(false)

const showAddModal = ref(false)
const saving = ref(false)
const formError = ref('')

const form = ref({
  nama_siswa: '',
  jenis_kelamin: '',
  nisn: '',
  alamat:''
})

const addStudent = async () => {
  if (saving.value) return

  saving.value = true
  formError.value = ''

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nama_siswa: form.value.nama_siswa,
        jenis_kelamin: form.value.jenis_kelamin,
        nisn: form.value.nisn
      })
    })

    const result = await response.json()

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || 'Gagal menyimpan data siswa'
      )
    }

    // Tutup modal dan kosongkan formulir
    showAddModal.value = false

    form.value = {
      nama_siswa: '',
      jenis_kelamin: '',
      nisn: '',
      alamat:''
    }

    // Ambil ulang data dari database
    await getStudents()

    window.alert('Siswa berhasil ditambahkan!')

  } catch (err) {
    console.error('Gagal menambahkan siswa:', err)

    formError.value =
      err.message || 'Terjadi kesalahan saat menyimpan data'
  } finally {
    saving.value = false
  }
}

// Alamat PHP API
const API_URL =
'https://portalabsensi.free.nf/siswa.php'

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

        <button class="btn primary" @click="showAddModal = true">
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
      
<!-- Modal Tambah Siswa -->
<div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
  <div class="modal-card">
    <div class="modal-header">
      <div>
        <h2>Tambah Siswa</h2>
        <p>Masukkan data siswa baru</p>
      </div>

      <button
        type="button"
        class="modal-close"
        @click="showAddModal = false"
      >
        &times;
      </button>
    </div>

    <form @submit.prevent="addStudent">
      <div class="form-group">
        <label for="nama-siswa">Nama Siswa</label>
        <input
          id="nama-siswa"
          v-model.trim="form.nama_siswa"
          type="text"
          placeholder="Masukkan nama lengkap"
          required
        />
      </div>

      <div class="form-group">
        <label for="jenis-kelamin">Jenis Kelamin</label>
        <select
          id="jenis-kelamin"
          v-model="form.jenis_kelamin"
          required
        >
          <option value="" disabled>Pilih jenis kelamin</option>
          <option value="Laki-laki">Laki-laki</option>
          <option value="Perempuan">Perempuan</option>
        </select>
      </div>

      <div class="form-group">
        <div class="form-group">
        <label for="alamat">Alamat</label>
        <textarea id="alamat"
          v-model.trim="form.alamat"
          placeholder="Masukkan alamat siswa"
          rows="3"></textarea>
        </div>
      </div>

      <p v-if="formError" class="form-error">
        {{ formError }}
      </p>

      <div class="modal-actions">
        <button
          type="button"
          class="btn cancel"
          @click="showAddModal = false"
        >
          Batal
        </button>

        <button
          type="submit"
          class="btn primary"
          :disabled="saving"
        >
          {{ saving ? 'Menyimpan...' : 'Simpan Siswa' }}
        </button>
      </div>
    </form>
  </div>
</div>

    </main>
  </div>
</template>

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
  font-weight: 500;
  color: #272727;
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

/* Modal Tambah Siswa */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.5);
}

.modal-card {
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  background: white;
  border-radius: 14px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.18);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding: 22px;
  border-bottom: 1px solid #edf0f4;
}

.modal-header h2 {
  margin: 0;
  color: #20293a;
  font-size: 20px;
}

.modal-header p {
  margin: 7px 0 0;
  color: #8992a3;
  font-size: 13px;
}

.modal-close {
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 27px;
  cursor: pointer;
}

.modal-card form {
  padding: 22px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 18px;
}

.form-group label {
  color: #394357;
  font-size: 14px;
  font-weight: 600;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 12px;
  border: 1px solid #dfe4ec;
  border-radius: 9px;
  background: white;
  color: #20293a;
  font-size: 14px;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus {
  outline: 2px solid #bfdbfe;
  border-color: #2563eb;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
}

.cancel {
  background: #f1f5f9;
  color: #475569;
}

.form-error {
  color: #dc2626;
  font-size: 13px;
}

@media (max-width: 480px) {
  .modal-actions {
    flex-direction: column-reverse;
  }

  .modal-actions .btn {
    width: 100%;
  }
}

</style>