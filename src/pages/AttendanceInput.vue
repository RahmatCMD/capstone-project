<script setup>
import { computed, ref } from 'vue'
import Sidebar from '../components/Sidebar.vue'

const toast = ref('')
const filter = ref('Semua')

const students = ref([
  { no: 1, name: 'Aditya Rahman', nisn: '0091234561', note: '-' },
  { no: 2, name: 'Bima Saputra', nisn: '0091234562', note: '-' },
  { no: 3, name: 'Citra Ayu Lestari', nisn: '0091234563', note: '-' },
  { no: 4, name: 'Dimas Prakoso', nisn: '0091234564', note: '-' },
  { no: 5, name: 'Nadia Putri', nisn: '0091234565', note : '-'},
  { no: 6, name: 'Fajar Nugroho', nisn: '0091234566', note :'-' },
  { no: 7, name: 'Gita Ramadhani', nisn: '0091234567', note: '-' },
  { no: 8, name: 'Hafiz Maulana', nisn: '0091234568', note: '-' },
  { no: 9, name: 'Indah Permatasari', nisn: '0091234569', note: '-' },
  { no: 10, name: 'Joko Prasetyo', nisn: '0091234570', note: '-' }
])

const statuses = ['Hadir', 'Sakit', 'Izin', 'Alpha']

/*
 * Catatan default berdasarkan status
 */
const defaultNotes = {
  Hadir: '-',
  Sakit: 'Siswa sedang sakit',
  Izin: 'Siswa mendapat izin',
  Alpha: 'Tanpa keterangan'
}

const counts = computed(() =>
  Object.fromEntries(
    statuses.map(s => [
      s,
      students.value.filter(x => x.status === s).length
    ])
  )
)

const visible = computed(() =>
  filter.value === 'Semua'
    ? students.value
    : students.value.filter(s => s.status === filter.value)
)


/*
 * Mengubah status sekaligus mengubah catatan
 */
function setStatus(student, status) {
  student.status = status

  // Catatan otomatis mengikuti status
  student.note = defaultNotes[status]
}


/*
 * Semua siswa menjadi Hadir
 */
function allPresent() {
  students.value.forEach(student => {
    setStatus(student, 'Hadir')
  })

  show('Semua siswa ditandai hadir.')
}


/*
 * Simpan data
 */
function save() {
  localStorage.setItem(
    'absensi-hari-ini',
    JSON.stringify(students.value)
  )

  show('Absensi berhasil disimpan sebagai data lokal.')
}


/*
 * Toast
 */
function show(message) {
  toast.value = message

  setTimeout(() => {
    toast.value = ''
  }, 2400)
}
</script>


<template>

  <div class="app-shell">

    <Sidebar role="guru" />

    <main class="main">

      <!-- ================= HEADER ================= -->

      <div class="page-head">

        <div>

          <h1>Input Absensi</h1>

          <p>
            Kelas 5B · Senin, 22 September 2026 ·
            Mapel: Tematik, Jam 1–2
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


      <!-- ================= FILTER ================= -->

      <div class="tabs">

        <button
          class="tab"
          :class="{ active: filter === 'Semua' }"
          @click="filter = 'Semua'"
        >
          Semua ({{ students.length }})
        </button>


        <button
          class="tab"
          :class="{ active: filter === 'Belum diisi' }"
          @click="filter = 'Belum diisi'"
        >
          Belum diisi (0)
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
                    class="status-select"
                    @change="setStatus(student, student.status)"
                  >

                    <option value="Hadir">
                      Hadir
                    </option>

                    <option value="Sakit">
                      Sakit
                    </option>

                    <option value="Izin">
                      Izin
                    </option>

                    <option value="Alpha">
                      Alpha
                    </option>

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
        Status dapat diubah dengan memilih dropdown.
        Catatan otomatis mengikuti status dan dapat diedit.
        Data disimpan di browser untuk demo.
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
   DROPDOWN STATUS
========================= */

.status-select {

  width: 180px;
  height: 42px;

  padding: 0 38px 0 14px;

  border: 1px solid #d9dee7;
  border-radius: 8px;

  background-color: #ffffff;

  color: #333333;

  font-size: 14px;
  font-family: inherit;

  outline: none;

  cursor: pointer;

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}


.status-select:hover {
  border-color: #18b6c9;
}


.status-select:focus {

  border-color: #18b6c9;

  box-shadow:
    0 0 0 2px rgba(24, 182, 201, 0.12);
}


.status-select option {

  padding: 10px;

  background: #ffffff;

  color: #333333;
}


/* =========================
   INPUT CATATAN
========================= */

.note-input {

  width: 100%;
  min-width: 220px;

  height: 40px;

  padding: 0 12px;

  border: 1px solid #d9dee7;

  border-radius: 7px;

  background: #ffffff;

  color: #333333;

  font-size: 14px;

  font-family: inherit;

  outline: none;

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}


.note-input:hover {
  border-color: #b9c3d0;
}


.note-input:focus {

  border-color: #18b6c9;

  box-shadow:
    0 0 0 2px rgba(24, 182, 201, 0.12);
}


/* =========================
   TABLE
========================= */

.table-wrap {

  width: 100%;

  overflow-x: auto;
}


table {

  width: 100%;

  border-collapse: collapse;
}


th {

  text-align: left;

  padding: 14px 16px;
}


td {

  padding: 14px 16px;

  vertical-align: middle;
}


/* =========================
RESPONSIVE
========================= */

@media (max-width: 768px) {

  .status-select {
    width: 150px;
  }

  .note-input {
    min-width: 180px;
  }

}

</style>