<script setup>
import { computed, ref } from 'vue'
import Sidebar from '../components/Sidebar.vue'
const search = ref('')
const status = ref('Semua Status')
const data = [
  ['Aditya Rahman',17,1,0,0], ['Bima Saputra',13,4,1,0], ['Citra Ayu Lestari',18,0,0,0], ['Nadia Putri',12,1,1,4], ['Fajar Nugroho',16,0,2,0], ['Gita Ramadhani',18,0,0,0], ['Rangga Aditya',14,1,0,3]
]
const filtered = computed(() => data.filter(r => r[0].toLowerCase().includes(search.value.toLowerCase())))
const toast = ref('')
function printPage() { window.print() }
function action(name) { toast.value = `Detail rekap ${name} dipilih.`; setTimeout(() => toast.value='', 2200) }
function exportData() { const csv = ['Nama,Hadir,Sakit,Izin,Alpha,% Kehadiran', ...data.map(r => `${r[0]},${r[1]},${r[2]},${r[3]},${r[4]},${Math.round(r[1]/18*100)}%`)].join('\n'); const blob = new Blob([csv], {type:'text/csv'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='rekap-absensi-kelas-5B.csv'; a.click(); URL.revokeObjectURL(a.href); toast.value='Rekap CSV berhasil dibuat.'; setTimeout(()=>toast.value='',2200) }
</script>

<template>
  <div class="app-shell"><Sidebar role="guru" /><main class="main">
    <div class="page-head"><div><h1>Riwayat & Rekap Absensi</h1><p>Kelas 5B · Periode September 2026</p></div><div class="actions"><button class="btn" @click="exportData">Unduh Rekap</button><button class="btn primary" @click="printPage">Cetak</button></div></div>
    <div class="filter-row"><select><option>Kelas 5B</option></select><select><option>Bulan: September 2026</option></select><select v-model="status"><option>Semua Status</option><option>Hadir</option><option>Sakit</option><option>Izin</option><option>Alpha</option></select><input v-model="search" class="search" placeholder="Cari nama siswa..." /></div>
    <section class="grid" style="gap:6px"><div class="card"><h3 class="card-title">Rata-rata Kehadiran</h3><div class="big-number">92%</div><div class="progress"><span style="width:92%"></span></div></div><div class="card"><h3 class="card-title">Total Hari Efektif</h3><div class="big-number">18</div><div class="small-note">hari belajar bulan ini</div></div><div class="card"><h3 class="card-title">Siswa Perlu Tindak Lanjut</h3><div class="big-number" style="color:#bd554e">3</div><div class="small-note">alpha &gt; 2 kali bulan ini</div></div></section>
    <section class="card section"><div class="table-wrap"><table><thead><tr><th>Nama Siswa</th><th>Hadir</th><th>Sakit</th><th>Izin</th><th>Alpha</th><th>% Kehadiran</th><th></th></tr></thead><tbody><tr v-for="r in filtered" :key="r[0]"><td>{{r[0]}}</td><td>{{r[1]}}</td><td>{{r[2]}}</td><td>{{r[3]}}</td><td>{{r[4]}}</td><td>{{Math.round(r[1]/18*100)}}%</td><td><button class="link-button" @click="action(r[0])">Detail</button></td></tr></tbody></table></div></section>
    <p class="small-note" style="margin-top:10px">Klik “Detail” untuk melihat rekap harian per siswa dan menyiapkan catatan untuk orang tua.</p>
  </main><div v-if="toast" class="toast">{{toast}}</div></div>
</template>
