<script setup>
import { computed, ref, onMounted, watch, onUnmounted } from 'vue'
import Sidebar from '../components/Sidebar.vue'

const SISWA_API_URL = 'http://localhost/absensi-api/siswa.php'
const NILAI_API_URL = 'http://localhost/absensi-api/nilai.php'

const mataPelajaran = 'Olahraga dan Keterampilan'

const siswaAwal = [
  { nisn: '0091234561', name: 'Aditya Rahman' },
  { nisn: '0091234562', name: 'Bima Saputra' },
  { nisn: '0091234563', name: 'Citra Ayu Lestari' },
  { nisn: '0091234564', name: 'Dimas Prakoso' },
  { nisn: '0091234565', name: 'Nadia Putri' },
  { nisn: '0091234566', name: 'Fajar Nugroho' },
  { nisn: '0091234567', name: 'Gita Ramadhani' },
  { nisn: '0091234568', name: 'Rangga Aditya' },
  { nisn: '0091234569', name: 'Salsabila Putri' },
  { nisn: '0091234570', name: 'Rizky Maulana' },
  { nisn: '0091234571', name: 'Ahmad Elzan Nur Fadillah' }
]

function siswaBaru(item) {
  return {
    ...item,
    id_siswa: null,
    nilaiPraktik: '',
    nilaiTertulis: '',
    tanggalPraktik: '',
    tanggalTertulis: '',
    tugasDipilih: 'praktik'
  }
}

const siswa = ref(siswaAwal.map(siswaBaru))
const pencarian = ref('')
const toast = ref('')
const loading = ref(false)
const modalTerbuka = ref(false)
const modeEdit = ref(false)
const menyimpanNilai = ref(false)

const form = ref({
  nisn: '',
  name: '',
  jenisTugas: 'praktik',
  nilai: ''
})

const pilihanNilai = Array.from({ length: 101 }, (_, index) => index)

let toastTimer

async function muatDataNilai() {
  loading.value = true

  try {
    const responsSiswa = await fetch(SISWA_API_URL)
    const hasilSiswa = await responsSiswa.json()

    if (!responsSiswa.ok || !hasilSiswa.success) {
      throw new Error(hasilSiswa.message || 'Gagal mengambil data siswa.')
    }

    const dataSiswaDB = hasilSiswa.data || []

    const siswaDenganId = siswaAwal.map(item => {
      const siswaDB = dataSiswaDB.find(
        data =>
          String(data.nisn || '') === String(item.nisn) ||
          String(data.nama_siswa || '').trim().toLowerCase() ===
            item.name.trim().toLowerCase()
      )

      return {
        ...siswaBaru(item),
        id_siswa: siswaDB?.id_siswa ?? null
      }
    })

    const responsNilai = await fetch(NILAI_API_URL)
    const hasilNilai = await responsNilai.json()

    if (!responsNilai.ok || !hasilNilai.success) {
      throw new Error(hasilNilai.message || 'Gagal mengambil data nilai.')
    }

    const semuaNilai = hasilNilai.data || []

    siswa.value = siswaDenganId.map(item => {
      const nilaiPraktik = semuaNilai.find(
        nilai =>
          String(nilai.id_siswa) === String(item.id_siswa) &&
          nilai.jenis_tugas === 'praktik'
      )

      const nilaiTertulis = semuaNilai.find(
        nilai =>
          String(nilai.id_siswa) === String(item.id_siswa) &&
          nilai.jenis_tugas === 'tertulis'
      )

      return {
        ...item,
        nilaiPraktik: nilaiPraktik ? Number(nilaiPraktik.nilai) : '',
        nilaiTertulis: nilaiTertulis ? Number(nilaiTertulis.nilai) : '',
        tanggalPraktik: nilaiPraktik?.tanggal_nilai
          ? String(nilaiPraktik.tanggal_nilai).slice(0, 10)
          : '',
        tanggalTertulis: nilaiTertulis?.tanggal_nilai
          ? String(nilaiTertulis.tanggal_nilai).slice(0, 10)
          : ''
      }
    })
  } catch (error) {
    console.error('Gagal memuat nilai:', error)
    tampilkanToast(error.message || 'Gagal mengambil data dari database.')
  } finally {
    loading.value = false
  }
}

onMounted(muatDataNilai)
onUnmounted(() => clearTimeout(toastTimer))

function grade(nilai) {
  if (
    nilai === '' ||
    nilai === null ||
    nilai === undefined ||
    !Number.isFinite(Number(nilai)) ||
    Number(nilai) < 0 ||
    Number(nilai) > 100
  ) {
    return ''
  }

  const angka = Number(nilai)
  if (angka >= 88) return 'A'
  if (angka >= 71) return 'B'
  if (angka >= 55) return 'C'
  return 'D'
}

function nilaiOverall(item) {
  if (item.nilaiPraktik === '' || item.nilaiTertulis === '') return null

  return Math.round(
    (Number(item.nilaiPraktik) + Number(item.nilaiTertulis)) / 2
  )
}

function gradeOverall(item) {
  const overall = nilaiOverall(item)
  return overall === null ? '' : grade(overall)
}

function nilaiBerdasarkanTugas(item) {
  return item.tugasDipilih === 'tertulis'
    ? (item.nilaiTertulis !== '' ? item.nilaiTertulis : '-')
    : (item.nilaiPraktik !== '' ? item.nilaiPraktik : '-')
}

function overallPreview() {
  if (form.value.nilai === '' || form.value.nisn === '') return null

  const item = siswa.value.find(siswaItem => siswaItem.nisn === form.value.nisn)
  if (!item) return null

  const nilaiPraktik = form.value.jenisTugas === 'praktik'
    ? Number(form.value.nilai)
    : item.nilaiPraktik

  const nilaiTertulis = form.value.jenisTugas === 'tertulis'
    ? Number(form.value.nilai)
    : item.nilaiTertulis

  if (nilaiPraktik === '' || nilaiTertulis === '') return null

  return Math.round((Number(nilaiPraktik) + Number(nilaiTertulis)) / 2)
}

function gradePreview() {
  const overall = overallPreview()
  return overall === null ? '' : grade(overall)
}

const daftarSiswa = computed(() => {
  const kata = pencarian.value.trim().toLowerCase()

  return siswa.value
    .filter(item => item.name.toLowerCase().includes(kata))
    .map(item => ({
      ...item,
      overall: nilaiOverall(item),
      grade: gradeOverall(item)
    }))
})

const jumlahSiswa = computed(() => siswa.value.length)

const nilaiValid = computed(() =>
  siswa.value
    .map(item => nilaiOverall(item))
    .filter(nilai => nilai !== null)
)

const rataRata = computed(() => {
  if (!nilaiValid.value.length) return '-'

  const total = nilaiValid.value.reduce((jumlah, nilai) => jumlah + nilai, 0)
  return Math.round(total / nilaiValid.value.length)
})

const gradeTertinggi = computed(() => {
  if (!nilaiValid.value.length) return '-'

  const urutan = { A: 4, B: 3, C: 2, D: 1 }

  return nilaiValid.value
    .map(nilai => grade(nilai))
    .sort((a, b) => urutan[b] - urutan[a])[0]
})

function tampilkanToast(pesan) {
  toast.value = pesan
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toast.value = ''
  }, 3000)
}

function ubahJenisTugas(item, jenisTugas) {
  const dataSiswa = siswa.value.find(siswaItem => siswaItem.nisn === item.nisn)
  if (!dataSiswa) return

  dataSiswa.tugasDipilih = jenisTugas
}

async function simpanKeDatabase(item, jenisTugas, nilai) {
  if (!item.id_siswa) {
    tampilkanToast(`ID database untuk ${item.name} tidak ditemukan. Periksa data siswa di database.`)
    return false
  }

  try {
    const respons = await fetch(NILAI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_siswa: Number(item.id_siswa),
        jenis_tugas: jenisTugas,
        nilai: Number(nilai)
      })
    })

    const hasil = await respons.json()

    if (!respons.ok || !hasil.success) {
      throw new Error(hasil.message || 'Nilai gagal disimpan.')
    }

    return true
  } catch (error) {
    console.error('Gagal menyimpan nilai ke database:', error)
    tampilkanToast(error.message || 'Gagal menghubungi server.')
    return false
  }
}

async function ubahNilai(item, nilai) {
  const dataSiswa = siswa.value.find(siswaItem => siswaItem.nisn === item.nisn)
  if (!dataSiswa) return

  if (nilai === '') {
    tampilkanToast('Pilih nilai antara 0 sampai 100.')
    return
  }

  const angka = Number(nilai)
  const jenisTugas = dataSiswa.tugasDipilih || 'praktik'

  const berhasil = await simpanKeDatabase(dataSiswa, jenisTugas, angka)
  if (!berhasil) return

  if (jenisTugas === 'praktik') {
    dataSiswa.nilaiPraktik = angka
    dataSiswa.tanggalPraktik = tanggalLokalUntukNilai()
  } else {
    dataSiswa.nilaiTertulis = angka
    dataSiswa.tanggalTertulis = tanggalLokalUntukNilai()
  }

  tampilkanToast('Nilai berhasil disimpan ke database.')
}

function tanggalLokalUntukNilai() {
  const sekarang = new Date()
  const tahun = sekarang.getFullYear()
  const bulan = String(sekarang.getMonth() + 1).padStart(2, '0')
  const hari = String(sekarang.getDate()).padStart(2, '0')
  return `${tahun}-${bulan}-${hari}`
}

function bukaInput() {
  modeEdit.value = false
  form.value = {
    nisn: '',
    name: '',
    jenisTugas: 'praktik',
    nilai: ''
  }
  modalTerbuka.value = true
}

function editNilai(item) {
  modeEdit.value = true
  const jenisTugas = item.tugasDipilih || 'praktik'

  form.value = {
    nisn: item.nisn,
    name: item.name,
    jenisTugas,
    nilai: jenisTugas === 'praktik' ? item.nilaiPraktik : item.nilaiTertulis
  }

  modalTerbuka.value = true
}

watch(
  () => form.value.jenisTugas,
  jenisTugas => {
    const item = siswa.value.find(siswaItem => siswaItem.nisn === form.value.nisn)
    if (!item) return

    form.value.nilai = jenisTugas === 'praktik'
      ? item.nilaiPraktik
      : item.nilaiTertulis
  }
)

async function simpanNilai() {
  if (form.value.nisn === '' || form.value.nilai === '') {
    tampilkanToast('Pilih siswa dan masukkan nilai.')
    return
  }

  const angka = Number(form.value.nilai)
  if (!Number.isInteger(angka) || angka < 0 || angka > 100) {
    tampilkanToast('Pilih nilai antara 0 sampai 100.')
    return
  }

  const item = siswa.value.find(siswaItem => siswaItem.nisn === form.value.nisn)
  if (!item) {
    tampilkanToast('Siswa tidak ditemukan.')
    return
  }

  menyimpanNilai.value = true
  try {
    const jenisTugas = form.value.jenisTugas
    const berhasil = await simpanKeDatabase(item, jenisTugas, angka)
    if (!berhasil) return

    if (jenisTugas === 'praktik') {
      item.nilaiPraktik = angka
      item.tanggalPraktik = tanggalLokalUntukNilai()
    } else {
      item.nilaiTertulis = angka
      item.tanggalTertulis = tanggalLokalUntukNilai()
    }

    item.tugasDipilih = jenisTugas
    modalTerbuka.value = false
    tampilkanToast('Nilai berhasil disimpan ke database.')
  } finally {
    menyimpanNilai.value = false
  }
}

function cetakNilai() {
  window.print()
}

function unduhRekap() {
  const kolom = [
    'NISN',
    'Nama Siswa',
    'Nilai Praktik',
    'Nilai Tertulis',
    'Nilai Overall',
    'Grade Overall'
  ]

  const baris = siswa.value.map(item => [
    item.nisn,
    item.name,
    item.nilaiPraktik,
    item.nilaiTertulis,
    nilaiOverall(item) ?? '',
    gradeOverall(item) || '-'
  ])

  const escapeCSV = value =>
    `"${String(value ?? '').replace(/"/g, '""')}"`

  const csv = [kolom, ...baris]
    .map(row => row.map(escapeCSV).join(','))
    .join('\r\n')

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'nilai-olahraga-dan-keterampilan.csv'
  link.click()
  URL.revokeObjectURL(url)

  tampilkanToast('Rekap nilai berhasil diunduh.')
}
</script>

<template>
  <div class="app-shell">
    <Sidebar role="guru" />

    <main class="main">
      <header class="page-head">
        <div>
          <h1>Nilai &amp; Tugas</h1>
          <p class="subtitle">Kelas 4 · {{ mataPelajaran }}</p>
        </div>

        <div class="header-actions">
          <div class="date-badge">
            <span>▦</span>
            {{
              new Date().toLocaleDateString('id-ID', {
                weekday: 'long',
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })
            }}
          </div>
          <button class="btn primary" @click="bukaInput">
            + Input Nilai
          </button>
        </div>
      </header>

      <section class="summary-grid">
        <article class="summary-card">
          <div class="summary-icon blue-icon">♙</div>
          <div>
            <p>Jumlah Siswa</p>
            <h2>{{ jumlahSiswa }}</h2>
          </div>
        </article>

        <article class="summary-card">
          <div class="summary-icon orange-icon">★</div>
          <div>
            <p>Rata-rata Nilai</p>
            <h2>{{ rataRata }}</h2>
          </div>
        </article>

        <article class="summary-card">
          <div class="summary-icon green-icon">✦</div>
          <div>
            <p>Grade Tertinggi</p>
            <h2>{{ gradeTertinggi }}</h2>
          </div>
        </article>
      </section>

      <section class="card table-card">
        <div class="table-heading">
          <h2>Daftar Nilai Siswa</h2>
          <input
            v-model="pencarian"
            class="search-input"
            type="search"
            placeholder="Cari nama siswa..."
            aria-label="Cari nama siswa"
          />
        </div>

        <p v-if="loading" class="table-message">Memuat data siswa dan nilai...</p>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>No.</th>
                <th>Nama Siswa</th>
                <th>Tugas</th>
                <th>Nilai</th>
                <th>Grade</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(item, index) in daftarSiswa" :key="item.nisn">
                <td>{{ index + 1 }}</td>
                <td class="student-name">{{ item.name }}</td>

                <td>
                  <select
                    :value="item.tugasDipilih || 'praktik'"
                    class="table-select"
                    aria-label="Pilih jenis tugas"
                    @change="ubahJenisTugas(item, $event.target.value)"
                  >
                    <option value="praktik">Tugas Praktik</option>
                    <option value="tertulis">Tugas Tertulis</option>
                  </select>
                </td>

                <td class="score">{{ nilaiBerdasarkanTugas(item) }}</td>

                <td>
                  <span
                    v-if="item.grade"
                    class="grade-badge"
                    :class="'grade-' + item.grade.toLowerCase()"
                  >
                    {{ item.grade }}
                  </span>
                  <span v-else>-</span>
                </td>

                <td>
                  <button class="edit-button" @click="editNilai(item)">
                    Edit
                  </button>
                </td>
              </tr>

              <tr v-if="daftarSiswa.length === 0">
                <td colspan="6" class="empty-state">Siswa tidak ditemukan.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="grade-info">
          Grade berdasarkan nilai:
          <span class="grade-letter grade-a">A</span> 88–100 ·
          <span class="grade-letter grade-b">B</span> 71–87 ·
          <span class="grade-letter grade-c">C</span> 55–70 ·
          <span class="grade-letter grade-d">D</span> di bawah 55
        </p>

        <div class="footer-actions">
          <button class="btn secondary" @click="unduhRekap">↓ Unduh Rekap</button>
          <button class="btn primary" @click="cetakNilai">Cetak</button>
        </div>
      </section>
    </main>

    <div v-if="modalTerbuka" class="modal-overlay" @click.self="modalTerbuka = false">
      <section class="modal-card">
        <div class="modal-heading">
          <h2>{{ modeEdit ? 'Edit Nilai Siswa' : 'Input Nilai' }}</h2>
          <button class="close-button" aria-label="Tutup" @click="modalTerbuka = false">
            ×
          </button>
        </div>

        <p class="modal-subtitle">{{ mataPelajaran }}</p>

        <form @submit.prevent="simpanNilai">
          <label for="namaSiswa">Nama Siswa</label>
          <select
            id="namaSiswa"
            v-model="form.nisn"
            required
            :disabled="modeEdit"
            @change="form.name = siswa.find(item => item.nisn === form.nisn)?.name || ''"
          >
            <option value="" disabled>Pilih siswa</option>
            <option v-for="item in siswa" :key="item.nisn" :value="item.nisn">
              {{ item.name }}
            </option>
          </select>

          <label for="jenisTugas">Jenis Tugas</label>
          <select id="jenisTugas" v-model="form.jenisTugas" required>
            <option value="praktik">Tugas Praktik</option>
            <option value="tertulis">Tugas Tertulis</option>
          </select>

          <label for="nilaiSiswa">Nilai (0–100)</label>
          <select id="nilaiSiswa" v-model="form.nilai" required>
            <option value="" disabled>Pilih nilai</option>
            <option v-for="nilai in pilihanNilai" :key="nilai" :value="nilai">
              {{ nilai }}
            </option>
          </select>

          <div v-if="overallPreview() !== null" class="grade-preview">
            Nilai overall: <strong>{{ overallPreview() }}</strong>
            <span>· Grade:</span>
            <span class="grade-badge" :class="'grade-' + gradePreview().toLowerCase()">
              {{ gradePreview() }}
            </span>
          </div>
          <p v-else class="grade-preview">
            Grade akan dihitung setelah nilai Tugas Praktik dan Tugas Tertulis terisi.
          </p>

          <div class="modal-actions">
            <button type="button" class="btn secondary" @click="modalTerbuka = false">
              Batal
            </button>
            <button type="submit" class="btn primary" :disabled="menyimpanNilai">
              {{ menyimpanNilai ? 'Menyimpan...' : 'Simpan Nilai' }}
            </button>
          </div>
        </form>
      </section>
    </div>

    <div v-if="toast" class="toast">{{ toast }}</div>
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
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 22px;
}

.page-head h1 {
  margin: 0 0 6px;
  font-size: 30px;
  color: var(--navy, #1e3a5f);
}

.subtitle {
  margin: 0;
  color: var(--muted, #747a80);
  font-size: 16px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.date-badge {
  white-space: nowrap;
  background: white;
  border: 1px solid var(--border, #dfe2dc);
  border-radius: 11px;
  padding: 12px 15px;
  font-size: 14px;
}

.date-badge span {
  margin-right: 7px;
}

.btn {
  border: 0;
  border-radius: 9px;
  padding: 12px 17px;
  font-family: inherit;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn:hover { opacity: 0.88; }
.btn:disabled { opacity: 0.6; cursor: wait; }
.primary { background: #2196f3; color: white; }
.secondary { background: #edf0f3; color: var(--navy, #1e3a5f); }

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 17px;
  padding: 22px;
  min-height: 105px;
  background: var(--card, #fff);
  border: 1px solid var(--border, #dfe2dc);
  border-radius: 13px;
  box-shadow: 0 2px 5px #1e3a5f0a;
}

.summary-card p {
  margin: 0 0 6px;
  color: var(--muted, #747a80);
  font-size: 15px;
}

.summary-card h2 {
  margin: 0;
  color: var(--navy, #1e3a5f);
  font-size: 32px;
}

.summary-icon {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 50%;
  font-size: 25px;
}

.blue-icon { background: #e1efff; color: #2196f3; }
.orange-icon { background: #fff0d5; color: #d99018; }
.green-icon { background: #e0f1e8; color: #4f8068; }

.card {
  background: var(--card, #fff);
  border: 1px solid var(--border, #dfe2dc);
  border-radius: 13px;
  box-shadow: 0 2px 5px #1e3a5f0a;
}

.table-card { padding: 20px; }

.table-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 15px;
}

.table-heading h2 {
  margin: 0;
  color: var(--navy, #1e3a5f);
  font-size: 22px;
}

.search-input {
  width: min(100%, 300px);
  padding: 11px 13px;
  border: 1px solid var(--border, #dfe2dc);
  border-radius: 9px;
  background: white;
  color: var(--text, #2e3136);
  font: inherit;
  outline-color: #2196f3;
}

.table-message {
  margin: 0 0 12px;
  color: var(--muted, #747a80);
  font-size: 13px;
}

.table-wrap { width: 100%; overflow-x: auto; }

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 14px;
}

th, td {
  padding: 13px 15px;
  text-align: left;
  border-bottom: 1px solid #e5e9ed;
}

th {
  background: #f5f8fb;
  color: #526783;
  font-weight: 600;
  white-space: nowrap;
}

thead th:first-child { border-top-left-radius: 7px; }
thead th:last-child { border-top-right-radius: 7px; }
tbody tr:last-child td { border-bottom: 0; }
tbody tr:hover { background: #f8fbff; }

.student-name {
  font-weight: 500;
  color: #000000;
  white-space: nowrap;
}

.score {
  font-weight: 700;
  color: var(--navy, #1e3a5f);
}

.table-select {
  max-width: 100%;
  padding: 8px 9px;
  border: 1px solid var(--border, #dfe2dc);
  border-radius: 8px;
  background: #fff;
  color: var(--text, #2e3136);
  font: inherit;
  cursor: pointer;
}

.grade-badge {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  min-width: 42px;
  padding: 5px 13px;
  border-radius: 20px;
  font-weight: 700;
}

.grade-a { background: #d5eee1; color: #286b50; }
.grade-b { background: #dcecff; color: #285e9c; }
.grade-c { background: #ffe6b9; color: #925c0b; }
.grade-d { background: #f5d9d7; color: #9c3833; }

.grade-info {
  margin: 17px 0 0;
  color: var(--muted, #747a80);
  font-size: 13px;
  line-height: 2;
}

.grade-letter {
  padding: 2px 5px;
  border-radius: 5px;
  font-weight: 700;
}

.edit-button {
  padding: 5px 9px;
  border: 0;
  background: transparent;
  color: #1683e8;
  font-family: inherit;
  font-size: 14px;
  cursor: pointer;
}

.edit-button:hover { text-decoration: underline; }

.empty-state {
  padding: 28px;
  text-align: center;
  color: var(--muted, #747a80);
}

.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 18px;
  background: rgb(18 32 48 / 45%);
}

.modal-card {
  width: 100%;
  max-width: 440px;
  padding: 24px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 15px 50px #0002;
}

.modal-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.modal-heading h2 {
  margin: 0;
  color: var(--navy, #1e3a5f);
  font-size: 22px;
}

.close-button {
  border: 0;
  background: transparent;
  color: #68717b;
  font-size: 27px;
  cursor: pointer;
}

.modal-subtitle {
  margin: 8px 0 22px;
  color: var(--muted, #747a80);
}

.modal-card form { display: flex; flex-direction: column; gap: 9px; }

.modal-card label {
  margin-top: 8px;
  font-size: 14px;
  font-weight: 600;
}

.modal-card input,
.modal-card select {
  width: 100%;
  box-sizing: border-box;
  padding: 12px;
  border: 1px solid var(--border, #dfe2dc);
  border-radius: 8px;
  background: white;
  color: var(--text, #2e3136);
  font: inherit;
}

.grade-preview {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-top: 9px;
  color: var(--muted, #747a80);
  font-size: 14px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.toast {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 1100;
  padding: 13px 19px;
  border-radius: 9px;
  background: #254e3c;
  color: white;
  box-shadow: 0 4px 16px #0002;
}

@media (max-width: 900px) {
  .main { padding: 22px 18px; }
  .page-head { align-items: flex-start; flex-direction: column; }
  .header-actions { flex-wrap: wrap; }
  .summary-grid { grid-template-columns: 1fr; }
}

@media (max-width: 560px) {
  .main { padding: 16px 12px; }
  .page-head h1 { font-size: 25px; }
  .header-actions { width: 100%; }
  .date-badge { font-size: 12px; }
  .table-card { padding: 13px; }
  .table-heading { align-items: stretch; flex-direction: column; }
  .search-input { width: auto; }
  th, td { padding: 11px 12px; white-space: nowrap; }
}

@media print {
  .app-shell { display: block; background: white; }
  .main { padding: 0; }
  .header-actions, .search-input, .footer-actions, .edit-button, .modal-overlay, .toast {
    display: none !important;
  }
  .summary-card, .card { box-shadow: none; break-inside: avoid; }
  .table-card { padding: 10px 0; }
  .table-wrap { overflow: visible; }
  table { font-size: 11px; }
  th, td { padding: 8px; }
}
</style>
