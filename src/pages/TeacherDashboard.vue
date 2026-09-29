<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '../components/Sidebar.vue'

const router = useRouter()
const toast = ref('')

// Tanggal sekarang otomatis
const now = new Date()

const today = computed(() =>
  now.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
)

// Format singkat untuk tombol
const currentDate = computed(() =>
  now.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
)

const weekly = [
  ['26–30 Agu', '96%', '2%', '1%', '1%'],
  ['2–6 Sep', '94%', '3%', '2%', '1%'],
  ['9–13 Sep', '91%', '5%', '2%', '2%'],
  ['16–20 Sep', '90%', '6%', '2%', '2%']
]

const attention = [
  ['Nadia Putri', '3x alpha bulan ini', 'Cek'],
  ['Bima Saputra', 'sakit 4 hari berturut', 'Cek'],
  ['Rangga Aditya', 'sering telat', 'Cek'],
  []
]

function show(message) {
  toast.value = message
  setTimeout(() => toast.value = '', 2200)
}
</script>

<template>
  <div class="app-shell">
    <Sidebar role="guru" />
    <main class="main">
      <div class="page-head">
        <div><h1>Selamat pagi, Pak Manto</h1><p>{{ today }} · Kelas 4, SD Negeri 173203 Purbatua</p></div>
        <div class="actions"><button class="btn">{{ currentDate }}</button><button class="btn primary" @click="router.push('/guru/absensi')">+ Input Absensi Hari Ini</button></div>
      </div>

      <section class="grid stats">
        <div class="card stat-card"><h3 class="card-title">Hadir Hari Ini</h3><div class="big-number" style="color:#56816d">27</div><div class="small-note">dari 30 siswa (90%)</div></div>
        <div class="card stat-card"><h3 class="card-title">Sakit</h3><div class="big-number" style="color:#bd922d">2</div><div class="small-note">butuh surat keterangan</div></div>
        <div class="card stat-card"><h3 class="card-title">Izin</h3><div class="big-number" style="color:#5b7890">1</div><div class="small-note">sudah ada keterangan</div></div>
        <div class="card stat-card"><h3 class="card-title">Belum Diisi</h3><div class="big-number">0</div><div class="small-note">absensi hari ini sudah lengkap</div></div>
      </section>

      <section class="card section">
        <h3 class="card-title">Kehadiran Kelas 4 — 4 Minggu Terakhir</h3>
        <div class="table-wrap"><table><thead><tr><th>Minggu</th><th>Hadir</th><th>Sakit</th><th>Izin</th><th>Alpha</th></tr></thead><tbody><tr v-for="row in weekly" :key="row[0]"><td>{{ row[0] }}</td><td>{{ row[1] }}</td><td>{{ row[2] }}</td><td>{{ row[3] }}</td><td>{{ row[4] }}</td></tr></tbody></table></div>
        <div class="small-note" style="margin-top:10px">Tren kehadiran menurun ringan 3 minggu terakhir — pantau di halaman Riwayat & Rekap.</div>
      </section>

      <section class="card section">
        <h3 class="card-title">Perlu Perhatian</h3>
        <div v-for="item in attention" :key="item[0]" class="attention-row"><span>{{ item[0] }} — {{ item[1] }}</span><button class="link-button" @click="show(item[2] === 'Isi' ? 'Form nilai dibuka pada modul Nilai & Tugas.' : 'Detail siswa dibuka.')">{{ item[2] }}</button></div>
      </section>
    </main>
    <div v-if="toast" class="toast">{{ toast }}</div>
  </div>
</template>
