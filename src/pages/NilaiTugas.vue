<script setup>
import { computed, ref, onMounted } from 'vue'
import Sidebar from '../components/Sidebar.vue'

const mataPelajaran = 'Olahraga dan Keterampilan'
const storageKey = 'nilai-tugas'

// Data awal hanya sebagai contoh.
// Nanti nama siswa dapat diambil dari database MySQL.
const siswaAwal = [
  { nisn: '0091234561', name: 'Aditya Rahman', nilai: '' },
  { nisn: '0091234562', name: 'Bima Saputra', nilai: '' },
  { nisn: '0091234563', name: 'Citra Ayu Lestari', nilai: '' },
  { nisn: '0091234564', name: 'Dimas Prakoso', nilai: '' },
  { nisn: '0091234565', name: 'Nadia Putri', nilai: '' },
  { nisn: '0091234566', name: 'Fajar Nugroho', nilai: '' },
  { nisn: '0091234567', name: 'Gita Ramadhani', nilai: '' },
  { nisn: '0091234568', name: 'Rangga Aditya', nilai: '' },
  { nisn: '0091234569', name: 'Salsabila Putri', nilai: '' },
  { nisn: '0091234570', name: 'Rizky Maulana', nilai: '' }
]

function bacaNilai() {
  return siswaAwal.map(siswa => ({ ...siswa }))
}

const siswa = ref(siswaAwal.map(siswa => ({ ...siswa })))
const pencarian = ref('')
const toast = ref('')

// Kosongkan nilai setiap kali halaman dibuka
onMounted(() => {
  siswa.value = siswaAwal.map(siswa => ({
    ...siswa,
    nilai: ''
  }))

  // Hapus nilai lama dari browser
  localStorage.removeItem(storageKey)
})

const modalTerbuka = ref(false)
const modeEdit = ref(false)
const form = ref({
  nisn: '',
  name: '',
  nilai: ''
})

let toastTimer

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

const daftarSiswa = computed(() => {
  const kata = pencarian.value.trim().toLowerCase()

  return siswa.value
    .filter(item => item.name.toLowerCase().includes(kata))
    .map(item => ({
      ...item,
      grade: grade(item.nilai)
    }))
})

const jumlahSiswa = computed(() => siswa.value.length)

const nilaiValid = computed(() =>
  siswa.value.filter(item =>
    item.nilai !== '' &&
    Number.isFinite(Number(item.nilai)) &&
    Number(item.nilai) >= 0 &&
    Number(item.nilai) <= 100
  )
)

const rataRata = computed(() => {
  if (!nilaiValid.value.length) return 0

  const total = nilaiValid.value.reduce(
    (jumlah, item) => jumlah + Number(item.nilai),
    0
  )

  return Math.round(total / nilaiValid.value.length)
})

const gradeTertinggi = computed(() => {
  if (!nilaiValid.value.length) return '-'

  const urutan = { A: 4, B: 3, C: 2, D: 1 }

  return nilaiValid.value
    .map(item => grade(item.nilai))
    .sort((a, b) => urutan[b] - urutan[a])[0]
})

function simpanKeBrowser() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(siswa.value))
    return true
  } catch (error) {
    console.error('Gagal menyimpan nilai:', error)
    tampilkanToast('Nilai gagal disimpan.')
    return false
  }
}

function tampilkanToast(pesan) {
  toast.value = pesan
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toast.value = ''
  }, 2500)
}

function bukaInput() {
  modeEdit.value = false
  form.value = {
    nisn: '',
    name: '',
    nilai: ''
  }
  modalTerbuka.value = true
}

function editNilai(item) {
  modeEdit.value = true
  form.value = {
    nisn: item.nisn,
    name: item.name,
    nilai: item.nilai
  }
  modalTerbuka.value = true
}

function simpanNilai() {
  const nilai = Number(form.value.nilai)

  if (
    form.value.nilai === '' ||
    !Number.isFinite(nilai) ||
    nilai < 0 ||
    nilai > 100
  ) {
    tampilkanToast('Masukkan nilai antara 0 sampai 100.')
    return
  }

  const index = siswa.value.findIndex(
    item => item.nisn === form.value.nisn
  )

  if (index === -1) {
    tampilkanToast('Siswa tidak ditemukan.')
    return
  }

  siswa.value[index].nilai = nilai

  if (simpanKeBrowser()) {
    modalTerbuka.value = false
    tampilkanToast('Nilai berhasil disimpan.')
  }
}

function cetakNilai() {
  window.print()
}

function unduhRekap() {
  const kolom = [
    'NISN',
    'Nama Siswa',
    'Mata Pelajaran',
    'Nilai',
    'Grade'
  ]

  const baris = siswa.value.map(item => [
    item.nisn,
    item.name,
    mataPelajaran,
    item.nilai,
    grade(item.nilai)
  ])

  const escapeCSV = value =>
    `"${String(value ?? '').replace(/"/g, '""')}"`

  const csv = [
    kolom,
    ...baris
  ].map(row => row.map(escapeCSV).join(',')).join('\r\n')

  const blob = new Blob(['\uFEFF' + csv], {
    type: 'text/csv;charset=utf-8;'
  })

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

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>No.</th>
                <th>Nama Siswa</th>
                <th>Mata Pelajaran</th>
                <th>Nilai</th>
                <th>Grade</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(item, index) in daftarSiswa" :key="item.nisn">
                <td>{{ index + 1 }}</td>
                <td class="student-name">{{ item.name }}</td>
                <td>{{ mataPelajaran }}</td>
                <td class="score">
                     {{ item.nilai === '' || item.nilai == null ? '-' : item.nilai }}
                </td>
                    <td>
                    <span
                        v-if="item.nilai !== '' && item.nilai != null"
                        class="grade-badge"
                        :class="'grade-' + item.grade">{{ item.grade }}
                    </span>
                    <span v-else>-</span>
                    </td>
                <td>
                  <button
                    class="edit-button"
                    @click="editNilai(item)"
                  >
                    Edit
                  </button>
                </td>
              </tr>

              <tr v-if="daftarSiswa.length === 0">
                <td colspan="6" class="empty-state">
                  Siswa tidak ditemukan.
                </td>
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
          <button class="btn secondary" @click="unduhRekap">
            ↓ Unduh Rekap
          </button>
          <button class="btn primary" @click="cetakNilai">
            Cetak
          </button>
        </div>
      </section>
    </main>

    <div v-if="modalTerbuka" class="modal-overlay" @click.self="modalTerbuka = false">
      <section class="modal-card">
        <div class="modal-heading">
          <h2>{{ modeEdit ? 'Edit Nilai Siswa' : 'Input Nilai' }}</h2>
          <button
            class="close-button"
            aria-label="Tutup"
            @click="modalTerbuka = false"
          >
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
            <option
              v-for="item in siswa"
              :key="item.nisn"
              :value="item.nisn"
            >
              {{ item.name }}
            </option>
          </select>

          <label for="nilaiSiswa">Nilai (0–100)</label>
          <input
            id="nilaiSiswa"
            v-model="form.nilai"
            type="number"
            min="0"
            max="100"
            step="1"
            required
            placeholder="Masukkan nilai"
          />

          <div v-if="form.nilai !== ''" class="grade-preview">
            Grade yang diperoleh:
            <span
              class="grade-badge"
              :class="'grade-' + grade(form.nilai)"
            >
              {{ grade(form.nilai) }}
            </span>
          </div>

          <div class="modal-actions">
            <button
              type="button"
              class="btn secondary"
              @click="modalTerbuka = false"
            >
              Batal
            </button>
            <button type="submit" class="btn primary">
              Simpan Nilai
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

.btn:hover {
  opacity: 0.88;
}

.primary {
  background: #2196f3;
  color: white;
}

.secondary {
  background: #edf0f3;
  color: var(--navy, #1e3a5f);
}

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

.blue-icon {
  background: #e1efff;
  color: #2196f3;
}

.orange-icon {
  background: #fff0d5;
  color: #d99018;
}

.green-icon {
  background: #e0f1e8;
  color: #4f8068;
}

.card {
  background: var(--card, #fff);
  border: 1px solid var(--border, #dfe2dc);
  border-radius: 13px;
  box-shadow: 0 2px 5px #1e3a5f0a;
}

.table-card {
  padding: 20px;
}

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

.table-wrap {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 14px;
}

th,
td {
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

thead th:first-child {
  border-top-left-radius: 7px;
}

thead th:last-child {
  border-top-right-radius: 7px;
}

tbody tr:last-child td {
  border-bottom: 0;
}

tbody tr:hover {
  background: #f8fbff;
}

.student-name {
  font-weight: 600;
  color: var(--navy, #1e3a5f);
  white-space: nowrap;
}

.score {
  font-weight: 700;
  color: var(--navy, #1e3a5f);
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

.edit-button:hover {
  text-decoration: underline;
}

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

.modal-card form {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

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
  .main {
    padding: 22px 18px;
  }

  .page-head {
    align-items: flex-start;
    flex-direction: column;
  }

  .header-actions {
    flex-wrap: wrap;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .main {
    padding: 16px 12px;
  }

  .page-head h1 {
    font-size: 25px;
  }

  .header-actions {
    width: 100%;
  }

  .date-badge {
    font-size: 12px;
  }

  .table-card {
    padding: 13px;
  }

  .table-heading {
    align-items: stretch;
    flex-direction: column;
  }

  .search-input {
    width: auto;
  }

  th,
  td {
    padding: 11px 12px;
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

  .header-actions,
  .search-input,
  .footer-actions,
  .edit-button,
  .modal-overlay,
  .toast {
    display: none !important;
  }

  .summary-card,
  .card {
    box-shadow: none;
    break-inside: avoid;
  }

  .table-card {
    padding: 10px 0;
  }

  .table-wrap {
    overflow: visible;
  }

  table {
    font-size: 11px;
  }

  th,
  td {
    padding: 8px;
  }
}
</style>
