import { createRouter, createWebHistory } from 'vue-router'
import Login from './pages/Login.vue'
import TeacherDashboard from './pages/TeacherDashboard.vue'
import AttendanceInput from './pages/AttendanceInput.vue'
import AttendanceHistory from './pages/AttendanceHistory.vue'
import ParentDashboard from './pages/ParentDashboard.vue'
import ChildAttendance from './pages/ChildAttendance.vue'
import ProfileSettings from './pages/ProfileSettings.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    { path: '/guru/dashboard', component: TeacherDashboard, meta: { role: 'guru' } },
    { path: '/guru/absensi', component: AttendanceInput, meta: { role: 'guru' } },
    { path: '/guru/riwayat', component: AttendanceHistory, meta: { role: 'guru' } },
    { path: '/orang-tua/dashboard', component: ParentDashboard, meta: { role: 'orang-tua' } },
    { path: '/orang-tua/absensi', component: ChildAttendance, meta: { role: 'orang-tua' } },
    { path: '/orang-tua/profil', component: ProfileSettings, meta: { role: 'orang-tua' } },
    { path: '/:pathMatch(.*)*', redirect: '/login' }
  ]
})

router.beforeEach((to) => {
  if (to.path === '/login') return true
  const role = localStorage.getItem('absen-role')
  if (!role) return '/login'
  if (to.meta.role && to.meta.role !== role) {
    return role === 'guru' ? '/guru/dashboard' : '/orang-tua/dashboard'
  }
  return true
})

export default router
