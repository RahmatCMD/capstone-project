<script setup>
import Sidebar from '../components/Sidebar.vue'
const days = [
  ['1','hadir'],['2','hadir'],['3','hadir'],['4','sakit'],['5','sakit'],['8','hadir'],['9','hadir'],['10','hadir'],['11','hadir'],['12','hadir'],['15','hadir'],['16','izin'],['17','hadir'],['18','alpha'],['19','hadir'],['22','hadir'],['23','alpha'],['24',''],['25',''],['26','']
]
function printPage() { window.print() }
const grades = [['Ulangan Matematika — Bab Pecahan',82],['Tugas IPA — Ekosistem',75],['Tematik — Proyek Kelompok',70],['Bahasa Indonesia — Menulis Cerpen',85]]
</script>

<template>
  <div class="app-shell"><Sidebar role="orang-tua" /><main class="main">
    <div class="page-head"><div><h1>Absensi & Kemajuan Belajar — Nadia Putri</h1><p>Kelas 4 · September 2026</p></div><button class="btn" @click="printPage">Unduh Rapor Kehadiran</button></div>
    <section class="card"><h3 class="card-title">Kalender Kehadiran — September 2026</h3><div class="calendar-wrap"><div class="calendar"><div v-for="h in ['Sen','Sel','Rab','Kam','Jum']" :key="h" class="day-head">{{h}}</div><div v-for="d in days" :key="d[0]" class="day" :class="d[1]">{{d[0]}}</div></div></div><div class="legend"><span class="badge hadir">Hadir</span><span class="badge sakit">Sakit</span><span class="badge izin">Izin</span><span class="badge alpha">Alpha</span></div></section>
    <section class="card section"><h3 class="card-title">Kemajuan Belajar Terbaru</h3><div v-for="g in grades" :key="g[0]" style="margin:15px 0"><div style="display:flex;justify-content:space-between;gap:10px"><span>{{g[0]}}</span><strong>{{g[1]}}</strong></div><div class="progress" style="margin-top:8px"><span :style="{width:g[1]+'%'}"></span></div></div><button class="btn" @click="$router.push('/orang-tua/dashboard')">Lihat semua nilai & tugas ›</button></section>
    <section class="card section"><h3 class="card-title">Catatan Wali Kelas untuk Nadia</h3><p class="small-note" style="font-size:14px;line-height:1.55">Nadia cukup aktif di kelas dan nilai tugasnya konsisten baik. Namun kehadirannya menurun dalam 2 minggu terakhir dengan 4 kali alpha tanpa keterangan. Mohon Ibu/Bapak dapat mengonfirmasi kondisi Nadia agar dapat kami bantu bila ada kendala.</p></section>
  </main></div>
</template>
