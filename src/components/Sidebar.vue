<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import logo from '../assets/logo-sekolah.png'

const props = defineProps({
  role: { type: String, default: 'guru' }
})

const route = useRoute()
const router = useRouter()

const menuTerbuka = ref(false)
const profilTerbuka = ref(false)
const sidebarMenyusut = ref(true)

function toggleSidebar() {
  sidebarMenyusut.value = !sidebarMenyusut.value
}
function tutupMenu() {
  menuTerbuka.value = false
}
// Menu otomatis terbuka ketika halaman Tentang Kami
// atau Pengumuman sedang aktif.
watch(
  () => route.path,
  (path) => {
    if (
      path.includes('/tentang-kami') ||
      path.includes('/pengumuman')
    ) {
      profilTerbuka.value = true
    }
  },
  { immediate: true }
)

const menus = computed(() => props.role === 'guru'
  ? [
      { label: 'Dashboard', to: '/guru/dashboard' },
      { label: 'Input Absensi', to: '/guru/absensi' },
      { label: 'Riwayat & Rekap', to: '/guru/riwayat' },
      { label: 'Kelas Saya', to: '/guru/kelas-saya' }
    ]
  : [
      { label: 'Dashboard', to: '/orang-tua/dashboard' },
      { label: 'Absensi Anak', to: '/orang-tua/absensi' },
    ])

const profilMenus = computed(() => {
  const prefix = props.role === 'guru' ? '/guru' : '/orang-tua'

  return [
    {
      label: 'Tentang Kami',
      to: `${prefix}/tentang-kami`
    },
    {
      label: 'Pengumuman',
      to: `${prefix}/pengumuman`
    }
  ]
})

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
      :aria-expanded="menuTerbuka"
      aria-label="Buka atau tutup navigasi"
      @click="menuTerbuka = !menuTerbuka"
    >
      {{ menuTerbuka ? '✕' : '☰' }}
    </button>
  </header>

<aside
  class="sidebar"
  :class="{
    'mobile-open': menuTerbuka,
    'sidebar-collapsed': sidebarMenyusut
  }"
>
  <button
    class="desktop-sidebar-toggle"
    type="button"
    @click="toggleSidebar"
    :aria-label="sidebarMenyusut ? 'Buka sidebar' : 'Tutup sidebar'"
  >
    {{ sidebarMenyusut ? '»' : '«' }}
  </button>

  <!-- Pertahankan seluruh isi sidebar kamu di sini -->
    <div class="brand">
      <div class="brand-mark">
        <img :src="logo" alt="Logo Sekolah" />
      </div>

      <div>
        <div>Absen Sekolah</div>
        <span class="brand-sub">
          Sistem Absensi & Pemantauan Belajar
        </span>
      </div>
    </div>

    <div class="nav-title">
      MENU {{ props.role === 'guru' ? 'GURU' : 'ORANG TUA' }}
    </div>

    <nav>
      <router-link
        v-for="item in menus"
        :key="item.label"
        :to="item.to"
        class="nav-link"
        :class="{ active: route.path === item.to }"
        @click="tutupMenu"
      >
        {{ item.label }}
      </router-link>
    </nav>

    <div class="nav-title">LAINNYA</div>

    
<!-- Profil & Informasi -->
<button
  type="button"
  class="nav-link profil-toggle"
  :class="{ active: profilMenus.some(item => route.path === item.to) }"
  :aria-expanded="profilTerbuka"
  @click="profilTerbuka = !profilTerbuka"
>
  Profil & Informasi
  <span class="submenu-arrow">
    {{ profilTerbuka ? '⌄' : '›' }}
  </span>
</button>

<!-- Submenu -->
<div v-if="profilTerbuka" class="submenu">
  <router-link
    v-for="item in profilMenus"
    :key="item.to"
    :to="item.to"
    class="nav-link submenu-link"
    :class="{ active: route.path === item.to }"
    @click="tutupMenu"
  >
    {{ item.label }}
  </router-link>
</div>


    <button
      class="nav-link logout-link"
      type="button"
      @click="logout"
    >
      Keluar
    </button>

    <div class="user-card">
      <div class="avatar">
        {{ props.role === 'guru' ? 'MS' : 'RW' }}
      </div>

      <div>
        <div class="user-name">
          {{ props.role === 'guru' ? 'Manto R Simatupang.' : 'Ratna Wijaya' }}
        </div>
        <div class="user-role">
          {{ props.role === 'guru' ? 'Wali Kelas 4' : 'Orang Tua' }}
        </div>
      </div>
    </div>
  </aside>
</template>

<style>
/* Samakan tombol dengan menu sidebar yang lama */
.sidebar .profil-toggle,
.sidebar .logout-link {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: inherit;
  font-family: inherit;
  font-size: inherit;
  font-weight: normal;
  line-height: inherit;
  text-align: left  ;
  text-decoration: none;
  padding: 10px;
  appearance: none;
  -webkit-appearance: none;
  box-shadow: none;
  cursor: pointer;
}

.sidebar .profil-toggle:hover,
.sidebar .logout-link:hover {
  background: rgba(255, 255, 255, 0.12);
}

.sidebar .submenu {
  margin: 0 0 8px 12px;
  padding-left: 10px;
  border-left: 2px solid rgba(255, 255, 255, 0.35);
}

.sidebar .submenu-link {
  display: block;
  padding: 8px 10px;
  border-radius: 8px;
  color: #ffffff !important;
  text-decoration: none;
  background: transparent;
}

.sidebar .submenu-link:hover,
.sidebar .submenu-link.active {
  background: rgba(255, 255, 255, 0.15);
}
.sidebar .submenu-link,
.sidebar .submenu-link:visited,
.sidebar .submenu-link:hover,
.sidebar .submenu-link:focus,
.sidebar .submenu-link:active,
.sidebar .submenu-link.active,
.sidebar .submenu-link.router-link-active,
.sidebar .submenu-link.router-link-exact-active {
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
}
</style>