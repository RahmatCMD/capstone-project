import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'login', component: () => import('../views/LoginView.vue') },

  { path: '/guru', redirect: '/guru/dashboard' },
  { path: '/guru/dashboard', name: 'guru-dashboard', component: () => import('../views/guru/DashboardGuru.vue') },
  { path: '/guru/input-absensi', name: 'guru-input-absensi', component: () => import('../views/guru/InputAbsensi.vue') },
  { path: '/guru/riwayat-rekap', name: 'guru-riwayat-rekap', component: () => import('../views/guru/RiwayatRekap.vue') },
  { path: '/guru/profil', name: 'guru-profil', component: () => import('../views/ProfilPengaturan.vue'), props: { role: 'guru' } },

  { path: '/ortu', redirect: '/ortu/dashboard' },
  { path: '/ortu/dashboard', name: 'ortu-dashboard', component: () => import('../views/ortu/DashboardOrtu.vue') },
  { path: '/ortu/absensi-anak', name: 'ortu-absensi-anak', component: () => import('../views/ortu/AbsensiAnak.vue') },
  { path: '/ortu/profil', name: 'ortu-profil', component: () => import('../views/ProfilPengaturan.vue'), props: { role: 'ortu' } }
]

export default createRouter({
  history: createWebHistory(),
  routes
})