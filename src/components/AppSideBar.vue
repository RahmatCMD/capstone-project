<script setup>
defineProps({
  role: { type: String, required: true }, // 'guru' | 'ortu'
  userName: { type: String, required: true },
  userSubtitle: { type: String, required: true },
  userInitials: { type: String, required: true }
})

const guruMenu = [
  { label: 'Dashboard', to: '/guru/dashboard' },
  { label: 'Input Absensi', to: '/guru/input-absensi' },
  { label: 'Riwayat & Rekap', to: '/guru/riwayat-rekap' },
  { label: 'Nilai & Tugas', to: null },
  { label: 'Kelas Saya', to: null }
]

const ortuMenu = [
  { label: 'Dashboard', to: '/ortu/dashboard' },
  { label: 'Absensi Anak', to: '/ortu/absensi-anak' },
  { label: 'Kemajuan Belajar', to: null },
  { label: 'Pesan dari Guru', to: null }
]
</script>

<template>
  <aside class="sidebar">
    <div class="brand">
      <span class="brand-badge">A</span>
      <span class="brand-title">AbsenSekolah</span>
    </div>

    <nav>
      <div class="menu-group">
        <span class="group-title">{{ role === 'guru' ? 'MENU GURU' : 'MENU ORANG TUA' }}</span>
        <template v-for="item in (role === 'guru' ? guruMenu : ortuMenu)" :key="item.label">
          <router-link v-if="item.to" :to="item.to" class="nav-item" active-class="active">
            {{ item.label }}
          </router-link>
          <a v-else href="#" class="nav-item" @click.prevent>{{ item.label }}</a>
        </template>
      </div>

      <div class="menu-group">
        <span class="group-title">LAINNYA</span>
        <router-link :to="`/${role}/profil`" class="nav-item" active-class="active">Profil & Pengaturan</router-link>
        <router-link to="/" class="nav-item">Keluar</router-link>
      </div>
    </nav>

    <div class="user-card">
      <span class="user-avatar">{{ userInitials }}</span>
      <div>
        <div class="user-name">{{ userName }}</div>
        <div class="user-subtitle">{{ userSubtitle }}</div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 240px;
  background: var(--navy);
  color: #fff;
  padding: 24px 16px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 36px;
  padding-left: 8px;
}

.brand-badge {
  background: var(--amber);
  color: #fff;
  font-weight: bold;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.brand-title { font-weight: 700; font-size: 18px; letter-spacing: -0.3px; }

nav { flex: 1; }

.menu-group { margin-bottom: 28px; }

.group-title {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: var(--navy-text-muted);
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  padding-left: 8px;
}

.nav-item {
  display: block;
  padding: 10px 12px;
  color: var(--navy-text);
  text-decoration: none;
  border-radius: 6px;
  font-size: 14px;
  margin-bottom: 4px;
}
.nav-item:hover { background: rgba(255,255,255,0.05); color: #fff; }
.nav-item.active { background: var(--navy-active); color: #fff; font-weight: 600; }

.user-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 8px 0;
  border-top: 1px solid rgba(255,255,255,0.08);
  margin-top: 12px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--navy-active);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.user-name { font-size: 13px; font-weight: 600; color: #fff; }
.user-subtitle { font-size: 11px; color: var(--navy-text-muted); }

@media (max-width: 860px) {
  .sidebar { display: none; }
}
</style>