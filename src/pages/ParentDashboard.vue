<script setup>
import { ref } from 'vue'
import Sidebar from '../components/Sidebar.vue'
const toast = ref('')
function message() { toast.value = 'Pesan baru siap dikirim ke wali kelas.'; setTimeout(() => toast.value='', 2200) }
</script>

<template>
  <div class="app-shell"><Sidebar role="orang-tua" /><main class="main">
    <div class="page-head">
      <div><h1>Selamat datang, Bu Siti</h1>
      <p>Memantau: <strong>Nadia Putri</strong> · Kelas 4, SD Negeri 173203 Purbatua</p></div>
      <select><option>Nadia Putri — Kelas 4</option></select></div>
      
    <section class="grid" style="grid-template-columns:repeat(4,minmax(0,1fr))"><div class="card stat-card"><h3 class="card-title">Kehadiran Bulan Ini</h3><div class="big-number">67%</div><div class="small-note">12 hadir dari 18 hari</div></div><div class="card stat-card"><h3 class="card-title">Alpha Bulan Ini</h3><div class="big-number" style="color:#bd554e">4</div><div class="small-note">perlu perhatian</div></div><div class="card stat-card"><h3 class="card-title">Sakit / Izin</h3><div class="big-number" style="color:#bd922d">2</div><div class="small-note">sudah ada keterangan</div></div><div class="card stat-card"><h3 class="card-title">Nilai Rata-rata</h3><div class="big-number">78</div><div class="small-note">dari 5 tugas terakhir</div></div></section>
    <section class="card section"><h3 class="card-title">Kehadiran 2 Minggu Terakhir</h3><div class="table-wrap"><table><thead><tr><th>Tanggal</th><th>Mapel</th><th>Status</th><th>Catatan Guru</th></tr></thead><tbody><tr><td>22 Sep</td><td>Tematik</td><td><span class="badge alpha">Alpha</span></td><td>Tanpa keterangan</td></tr><tr><td>19 Sep</td><td>Matematika</td><td><span class="badge hadir">Hadir</span></td><td>-</td></tr><tr><td>18 Sep</td><td>Tematik</td><td><span class="badge alpha">Alpha</span></td><td>Tanpa keterangan</td></tr><tr><td>17 Sep</td><td>IPA</td><td><span class="badge hadir">Hadir</span></td><td>-</td></tr><tr><td>16 Sep</td><td>Tematik</td><td><span class="badge izin">Izin</span></td><td>Acara keluarga</td></tr></tbody></table></div><button class="btn" style="margin-top:10px" @click="$router.push('/orang-tua/absensi')">Lihat semua riwayat absensi ›</button></section>
    <section class="card section"><h3 class="card-title">Pesan Terbaru dari Wali Kelas</h3><div class="attention-row"><div><strong>Bu Ratna Wijaya · 22 Sep</strong><br><span class="small-note">Nadia sudah 4 kali tidak hadir tanpa keterangan bulan ini. Mohon dikonfirmasi kondisinya.</span></div></div><div class="attention-row"><div><strong>Bu Ratna Wijaya · 15 Sep</strong><br><span class="small-note">Nilai ulangan Matematika Nadia membaik dari bulan lalu, pertahankan ya.</span></div></div><button class="btn" style="width:100%;text-align:left" @click="message">Kirim Pesan ke Guru</button></section>
  </main><div v-if="toast" class="toast">{{toast}}</div></div>
</template>
