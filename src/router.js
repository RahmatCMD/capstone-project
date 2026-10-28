import { createRouter, createWebHistory } from 'vue-router'

import Login from './pages/Login.vue'
import TeacherDashboard from './pages/TeacherDashboard.vue'
import AttendanceInput from './pages/AttendanceInput.vue'
import AttendanceHistory from './pages/AttendanceHistory.vue'
import KelasSaya from './pages/KelasSaya.vue'
import NilaiTugas from './pages/NilaiTugas.vue'
import TentangKami from './pages/TentangKami.vue'
import Pengumuman from './pages/Pengumuman.vue'
import ParentDashboard from './pages/ParentDashboard.vue'
import ChildAttendance from './pages/ChildAttendance.vue'
import ProfileSettings from './pages/ProfileSettings.vue'
import KemajuanBelajar from './pages/KemajuanBelajar.vue'

const router = createRouter({
  history: createWebHistory(),

  routes: [
    {
      path: '/',
      redirect: '/login'
    },

    {
      path: '/login',
      component: Login
    },

    {
      path: '/guru/dashboard',
      component: TeacherDashboard,
      meta: { role: 'guru' }
    },

    {
      path: '/guru/absensi',
      component: AttendanceInput,
      meta: { role: 'guru' }
    },

    {
      path: '/guru/riwayat',
      component: AttendanceHistory,
      meta: { role: 'guru' }
    },

    {
      path: '/guru/kelas-saya',
      component: KelasSaya,
      meta: { role: 'guru' }
    },
    {
      path: '/guru/tentang-kami',
      component: TentangKami,
      meta: { role: 'guru' }
    },
    {
      path: '/guru/pengumuman',
      component: Pengumuman,
      meta: { role: 'guru' }
    },
    {
      path: '/orang-tua/dashboard',
      component: ParentDashboard,
      meta: { role: 'orang-tua' }
    },

    {
      path: '/orang-tua/absensi',
      component: ChildAttendance,
      meta: { role: 'orang-tua' }
    },

    {
      path: '/orang-tua/profil',
      component: ProfileSettings,
      meta: { role: 'orang-tua' }
    },
    {
      path: '/orang-tua/tentang-kami',
      component: TentangKami,
      meta: { role: 'orang-tua' }
    },
    {
      path: '/orang-tua/pengumuman',
      component: Pengumuman,
      meta: { role: 'orang-tua' }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/login'
    }
  ]
})

router.beforeEach((to) => {
  if (to.path === '/login') {
    return true
  }

  const role = localStorage.getItem('absen-role')

  if (!role) {
    return '/login'
  }

  if (to.meta.role && to.meta.role !== role) {
    return role === 'guru'
      ? '/guru/dashboard'
      : '/orang-tua/dashboard'
  }

  return true
})

export default router