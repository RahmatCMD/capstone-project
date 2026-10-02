<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import logo from '../assets/logo-sekolah.png'

const props = defineProps({ role: { type: String, default: 'guru' } })
const route = useRoute()
const router = useRouter()
const menuTerbuka = ref(false)

function tutupMenu() {
  menuTerbuka.value = false
}

const menus = computed(() => props.role === 'guru'
  ? [
      { label: 'Dashboard', to: '/guru/dashboard' },
      { label: 'Input Absensi', to: '/guru/absensi' },
      { label: 'Riwayat & Rekap', to: '/guru/riwayat' },
      { label: 'Nilai & Tugas', to: '/guru/null' },
      { label: 'Kelas Saya', to: '/guru/kelas-saya' }
    ]
  : [
      { label: 'Dashboard', to: '/orang-tua/dashboard' },
      { label: 'Absensi Anak', to: '/orang-tua/absensi' },
      { label: 'Kemajuan Belajar', to: '/orang-tua/absensi' },
      { label: 'Pesan dari Guru', to: '/orang-tua/dashboard' }
    ])

function logout() {
  localStorage.removeItem('absen-role')
  router.push('/login')
}
</script>

<template>
  
<header class="mobile-header">
  <div class="mobile-brand">
    <img :src="logo" alt="Logo Sekolah" />
    <span>Absen Sekolah</span>
  </div>

  <button
    class="menu-toggle"
    type="button"
    @click="menuTerbuka = !menuTerbuka"
  >
    {{ menuTerbuka ? '✕' : '☰' }}
  </button>
</header>

  <aside class="sidebar"
        :class="{ 'mobile-open' : menuTerbuka}">
    <div class="brand">
      <div class="brand-mark">
        <img :src="logo" alt="Logo Sekolah" />
      </div>
      <div>
        <div>Absen Sekolah</div>
        <span class="brand-sub">Sistem Absensi & Pemantauan Belajar</span>
      </div>
    </div>

    <div class="nav-title">MENU {{ props.role === 'guru' ? 'GURU' : 'ORANG TUA' }}</div>
    <nav>
      <router-link
        v-for="item in menus"
        :key="item.label"
        :to="item.to"
        class="nav-link"
        :class="{ active: route.path === item.to }"
        @click="tutupMenu"
      >• {{ item.label }}</router-link>
    </nav>

    <div class="nav-title">LAINNYA</div>
    <router-link
      class="nav-link"
      :class="{ active: route.path.includes('profil') }"
      :to="props.role === 'guru' ? '/guru/dashboard' : '/orang-tua/profil'"
    >• Profil & Pengaturan</router-link>
    <button class="nav-link" style="border:0;background:transparent;text-align:left;width:100%;" @click="logout">• Keluar</button>

    <div class="user-card">
      <div class="avatar">{{ props.role === 'guru' ? 'MS' : 'SH' }}</div>
      <div>
        <div class="user-name">{{ props.role === 'guru' ? 'Manto R Simatupang.' : 'Siti Handayani' }}</div>
        <div class="user-role">{{ props.role === 'guru' ? 'Wali Kelas 4' : 'Orang Tua' }}</div>
      </div>
    </div>
  </aside>
</template>
