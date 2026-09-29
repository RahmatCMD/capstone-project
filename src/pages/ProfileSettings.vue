<script setup>
import { reactive, ref } from 'vue'
import Sidebar from '../components/Sidebar.vue'
const form = reactive({ name:'Siti Handayani', email:'siti.handayani@gmail.com', phone:'0812-3456-7890' })
const notifications = reactive({ alpha:true, sakit:true, weekly:true, grades:false, messages:true })
const toast = ref('')
function save() { localStorage.setItem('parent-profile', JSON.stringify(form)); toast.value='Perubahan profil berhasil disimpan.'; setTimeout(()=>toast.value='',2200) }
function password() { toast.value='Form ubah kata sandi siap dihubungkan ke backend.'; setTimeout(()=>toast.value='',2200) }
function toggle(key) { notifications[key] = !notifications[key] }
</script>

<template>
  <div class="app-shell"><Sidebar role="orang-tua" /><main class="main">
    <div class="page-head"><div><h1>Profil & Pengaturan</h1><p>Kelola informasi akun dan preferensi notifikasi</p></div><button class="btn primary" @click="save">Simpan Perubahan</button></div>
    <div class="form-section">
      <section class="card"><h3 class="card-title">Informasi Akun</h3><div class="form-group"><label>Nama Lengkap</label><input v-model="form.name"></div><div class="form-group"><label>Email</label><input v-model="form.email" type="email"></div><div class="form-group"><label>Nomor WhatsApp</label><input v-model="form.phone"></div><div class="form-group"><label>Anak yang Terhubung</label><input value="Nadia Putri — Kelas 5B, SDN 12 Jakarta Barat" disabled></div><button class="btn" @click="password">Ubah Kata Sandi</button></section>
      <section class="card"><h3 class="card-title">Notifikasi</h3><div class="toggle-row"><span>Notifikasi saat anak tidak hadir (Alpha)</span><button class="switch" :class="{on:notifications.alpha}" @click="toggle('alpha')"></button></div><div class="toggle-row"><span>Notifikasi saat anak sakit / izin</span><button class="switch" :class="{on:notifications.sakit}" @click="toggle('sakit')"></button></div><div class="toggle-row"><span>Ringkasan kehadiran mingguan</span><button class="switch" :class="{on:notifications.weekly}" @click="toggle('weekly')"></button></div><div class="toggle-row"><span>Nilai & tugas baru diinput guru</span><button class="switch" :class="{on:notifications.grades}" @click="toggle('grades')"></button></div><div class="toggle-row"><span>Pesan baru dari wali kelas</span><button class="switch" :class="{on:notifications.messages}" @click="toggle('messages')"></button></div><div class="small-note" style="margin-top:10px">Notifikasi dapat dikirim melalui email dan WhatsApp sesuai kontak yang terdaftar.</div></section>
      <section class="card"><h3 class="card-title">Keamanan Akun</h3><div class="settings-row"><span>Verifikasi 2 langkah</span><button class="link-button">Diaktifkan</button></div><div class="settings-row"><span>Perangkat aktif</span><span>1 perangkat — iPhone, Jakarta</span></div><div class="settings-row"><span>Keluar dari semua perangkat</span><button class="btn danger">Keluar Semua</button></div></section>
    </div>
  </main><div v-if="toast" class="toast">{{toast}}</div></div>
</template>
