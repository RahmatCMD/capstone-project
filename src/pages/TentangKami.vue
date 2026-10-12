<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from '../components/Sidebar.vue'
import logo from '../assets/logo-sekolah.png'

const route = useRoute()

const rolePortal = computed(() =>
  route.path.startsWith('/orang-tua') ? 'ortu' : 'guru'
)

// Sesuaikan informasi berikut dengan data sekolah sebenarnya.
const sekolah = ref({
  nama: 'SD Negeri 173203 Purbatua',
  npsn: '10206372',
  jenjang: 'Sekolah Dasar',
  status: 'Negeri',
  akreditasi: 'C',
  tahunBerdiri: '16 Juni 1966',
  alamat: '3673+35H, Purbatua, Kec. Pangaribuan, Kabupaten Tapanuli Utara, Sumatera Utara 22471',
  kelurahan: 'Purbatua',
  kecamatan: 'Pangaribuan',
  provinsi: 'Sumatera Utara',
  kodePos: '22471',
  telepon: '081264664397',
  deskripsi:
    'SD Negeri 173203 Purbatua merupakan salah satu satuan pendidikan dasar berstatus negeri yang berada di Desa Purbatua, di dirikan pada tanggal 16 Juni 1966 Kecamatan Pangaribuan, Kabupaten Tapanuli Utara, Provinsi Sumatera Utara. Sekolah ini berada di bawah naungan Pemerintah Daerah dan menyelenggarakan pendidikan pada jenjang pendidikan dasar.'
})

function bukaTelepon() {
  if (sekolah.value.telepon === '-') return
  window.location.href = `tel:${sekolah.value.telepon}`
}

function bukaEmail() {
  if (sekolah.value.email === '-') return
  window.location.href = `mailto:${sekolah.value.email}`
}

function bukaWebsite() {
  if (sekolah.value.website === '-') return

  let url = sekolah.value.website.trim()

  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`
  }

  window.open(url, '_blank', 'noopener,noreferrer')
}
</script>

<template>
  <div class="app-shell tentang-shell">
    <Sidebar :role="rolePortal" />

    <main class="main tentang-main">
      <!-- Header halaman -->
      <header class="tentang-header">
        <div>
          <span class="eyebrow">PROFIL SEKOLAH</span>
          <h1>Tentang Sekolah Kami</h1>
          <p>
            Mengenal lebih dekat sekolah, identitas, dan informasi
            pendidikan.
          </p>
        </div>
      </header>

      <!-- Konten utama -->
      <div class="profil-layout">
        <!-- Kolom kiri -->
        <aside class="profil-kiri">
          <!-- Profil sekolah -->
          <section class="card profil-card">
            <div class="profil-banner">
              <img :src="logo" alt="Logo sekolah" />

              <h2>{{ sekolah.nama }}</h2>
              <p>NPSN: {{ sekolah.npsn }}</p>
            </div>

            <div class="profil-ringkas">
              <div class="ringkas-item">
                <span class="ringkas-icon">🎓</span>
                <div>
                  <small>Jenjang Pendidikan</small>
                  <strong>{{ sekolah.jenjang }}</strong>
                </div>
              </div>

              <div class="ringkas-item">
                <span class="ringkas-icon">🏫</span>
                <div>
                  <small>Status Sekolah</small>
                  <strong>{{ sekolah.status }}</strong>
                </div>
              </div>

              <div class="ringkas-item">
                <span class="ringkas-icon">🏅</span>
                <div>
                  <small>Akreditasi</small>
                  <strong>{{ sekolah.akreditasi }}</strong>
                </div>
              </div>

              <div class="ringkas-item">
                <span class="ringkas-icon">📅</span>
                <div>
                  <small>Tahun Berdiri</small>
                  <strong>{{ sekolah.tahunBerdiri }}</strong>
                </div>
              </div>
            </div>
          </section>

          <!-- Kontak sekolah -->
          <section class="card kontak-card">
            <div class="card-heading">
              <h2>Kontak Kami</h2>
            </div>

            <div class="kontak-item">
              <span>📍</span>
              <p>{{ sekolah.alamat }}</p>
            </div>

            <button
              type="button"
              class="kontak-item kontak-button"
              @click="bukaTelepon"
            >
              <span>☎️</span>
              <p>{{ sekolah.telepon }}</p>
            </button>

            <div class="lokasi-box">
              <span class="lokasi-icon">📍</span>
              <strong>Lokasi Sekolah</strong>
              <p>{{ sekolah.alamat }}</p>
              <small>Informasi alamat sekolah</small>
            </div>
          </section>
        </aside>

        <!-- Kolom kanan -->
        <div class="profil-kanan">
          <!-- Tentang sekolah -->
          <section class="card konten-card">
            <div class="card-heading heading-with-icon">
              <span class="heading-icon">📖</span>
              <div>
                <h2>Tentang Sekolah</h2>
                <p>Sejarah singkat dan gambaran umum sekolah</p>
              </div>
            </div>

            <div class="deskripsi-sekolah">
              {{ sekolah.deskripsi }}
            </div>

            <div class="garis-pemisah">
              <span>IDENTITAS SINGKAT</span>
            </div>

            <div class="identitas-grid">
              <div class="identitas-box">
                <small>Jenjang Pendidikan</small>
                <strong>{{ sekolah.jenjang }}</strong>
              </div>

              <div class="identitas-box">
                <small>Tahun Berdiri</small>
                <strong>{{ sekolah.tahunBerdiri }}</strong>
              </div>

              <div class="identitas-box">
                <small>Status Sekolah</small>
                <strong>{{ sekolah.status }}</strong>
              </div>

              <div class="identitas-box">
                <small>NPSN</small>
                <strong>{{ sekolah.npsn }}</strong>
              </div>
            </div>
          </section>

          <!-- Data identitas sekolah -->
          <section class="card konten-card">
            <div class="card-heading heading-with-icon">
              <span class="heading-icon">📋</span>
              <div>
                <h2>Data Identitas Sekolah</h2>
                <p>Informasi lengkap identitas sekolah</p>
              </div>
            </div>

            <div class="tabel-identitas">
              <div class="tabel-row">
                <span>Nama Sekolah</span>
                <strong>{{ sekolah.nama }}</strong>
              </div>

              <div class="tabel-row">
                <span>NPSN</span>
                <strong>{{ sekolah.npsn }}</strong>
              </div>

              <div class="tabel-row">
                <span>Jenjang Pendidikan</span>
                <strong>{{ sekolah.jenjang }}</strong>
              </div>

              <div class="tabel-row">
                <span>Status Sekolah</span>
                <strong>{{ sekolah.status }}</strong>
              </div>

              <div class="tabel-row">
                <span>Akreditasi</span>
                <strong>{{ sekolah.akreditasi }}</strong>
              </div>

              <div class="tabel-row">
                <span>Tahun Berdiri</span>
                <strong>{{ sekolah.tahunBerdiri }}</strong>
              </div>

              <div class="tabel-row">
                <span>Alamat</span>
                <strong>{{ sekolah.alamat }}</strong>
              </div>

              <div class="tabel-row">
                <span>Kelurahan</span>
                <strong>{{ sekolah.kelurahan }}</strong>
              </div>

              <div class="tabel-row">
                <span>Kecamatan</span>
                <strong>{{ sekolah.kecamatan }}</strong>
              </div>

              <div class="tabel-row">
                <span>Provinsi</span>
                <strong>{{ sekolah.provinsi }}</strong>
              </div>

              <div class="tabel-row">
                <span>Kode Pos</span>
                <strong>{{ sekolah.kodePos }}</strong>
              </div>

              <div class="tabel-row">
                <span>Telepon</span>
                <strong>{{ sekolah.telepon }}</strong>
              </div>
            </div>
          </section>
        </div>
      </div>

      <!-- Footer -->
      <footer class="tentang-footer">
        <p>
          © {{ new Date().getFullYear() }} {{ sekolah.nama }}
          <span>·</span>
          NPSN {{ sekolah.npsn }}
          <span>·</span>
          Informasi Sekolah
        </p>
      </footer>
    </main>
  </div>
</template>

<style scoped>
.tentang-shell {
  min-height: 100vh;
  background: var(--cream, #f4f5f0);
}

.tentang-main {
  min-width: 0;
  min-height: 100vh;
  padding: 0;
  display: flex;
  flex-direction: column;
  color: var(--text, #2e3136);
}

/* Header */
.tentang-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  overflow: hidden;
  margin: 0;
  padding: 25px 28px;
  color: #000000;
  background:#f4f5f0;
  border-radius: 0 0 10px 10px;
}

.tentang-header::after {
  content: '';
  position: absolute;
  right: -25px;
  bottom: -80px;
  width: 220px;
  height: 120px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.eyebrow {
  font-size: 10px;
  letter-spacing: 1.5px;
  opacity: 0.85;
}

.tentang-header h1 {
  margin: 7px 0;
  font-size: clamp(24px, 2.5vw, 34px);
  line-height: 1.3;
}

.tentang-header p {
  max-width: 600px;
  margin: 0;
  font-size: 13px;
  line-height: 1.7;
  opacity: 0.9;
}

/* Layout utama */
.profil-layout {
  display: grid;
  grid-template-columns: minmax(220px, 270px) minmax(0, 1fr);
  align-items: start;
  gap: 18px;
  padding: 20px 24px;
  flex: 1;
}

.profil-kiri,
.profil-kanan {
  display: grid;
  align-content: start;
  gap: 16px;
  min-width: 0;
}

.card {
  min-width: 0;
  overflow: hidden;
  background: #fff;
  border: 1px solid var(--border, #dfe2dc);
  border-radius: 10px;
  box-shadow: 0 2px 7px rgba(30, 58, 95, 0.06);
}

/* Profil sekolah kiri */
.profil-banner {
  padding: 20px 17px;
  color: #000000;
  background: #f4f5f0;
}

.profil-banner img {
  display: block;
  width: 48px;
  height: 48px;
  margin-bottom: 12px;
  object-fit: contain;
  border-radius: 50%;
  background: #fff;
}

.profil-banner h2 {
  margin: 0 0 6px;
  font-size: 16px;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.profil-banner p {
  margin: 0;
  font-size: 11px;
  opacity: 0.85;
}

.profil-ringkas {
  display: grid;
  gap: 8px;
  padding: 13px;
}

.ringkas-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px;
  border-radius: 7px;
  background: var(--cream, #f4f5f0);
}

.ringkas-icon {
  font-size: 17px;
}

.ringkas-item div {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.ringkas-item small {
  color: var(--muted, #747a80);
  font-size: 10px;
}

.ringkas-item strong {
  color: #000000;
  font-size: 12px;
  overflow-wrap: anywhere;
}

/* Kontak */
.kontak-card {
  padding: 16px;
}

.card-heading {
  padding-bottom: 13px;
  margin-bottom: 14px;
  border-bottom: 1px solid var(--border, #dfe2dc);
}

.card-heading h2 {
  margin: 0;
  color: #000000;
  font-size: 17px;
}

.heading-with-icon {
  display: flex;
  align-items: center;
  gap: 11px;
}

.heading-icon {
  font-size: 22px;
}

.heading-with-icon p {
  margin: 5px 0 0;
  color: var(--muted, #747a80);
  font-size: 11px;
  line-height: 1.6;
}

.kontak-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  padding: 0;
  margin: 0 0 14px;
  border: 0;
  background: transparent;
  color: var(--text, #2e3136);
  text-align: left;
  font: inherit;
}

.kontak-item > span {
  flex-shrink: 0;
  font-size: 13px;
}

.kontak-item p {
  margin: 0;
  font-size: 11px;
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.kontak-button {
  cursor: pointer;
}

.kontak-button:hover p {
  color: var(--blue, #2196ed);
  text-decoration: underline;
}

.lokasi-box {
  display: grid;
  justify-items: center;
  gap: 7px;
  margin-top: 18px;
  padding: 15px 10px;
  border: 1px solid var(--border, #dfe2dc);
  border-radius: 8px;
  background: var(--cream, #f4f5f0);
  text-align: center;
}

.lokasi-icon {
  font-size: 23px;
}

.lokasi-box strong {
  font-size: 12px;
  color: var(--navy,    );
}

.lokasi-box p {
  margin: 0;
  font-size: 11px;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.lokasi-box small {
  color: var(--muted, #747a80);
  font-size: 10px;
}

/* Konten kanan */
.konten-card {
  padding: 19px;
}

.deskripsi-sekolah {
  padding: 14px;
  border-left: 3px solid var(--blue, #2196ed);
  border-radius: 5px;
  background: var(--cream, #f4f5f0);
  font-size: 12px;
  line-height: 1.9;
}

.garis-pemisah {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0 14px;
  color: #000000;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.7px;
}

.garis-pemisah::before,
.garis-pemisah::after {
  content: '';
  height: 1px;
  flex: 1;
  background: var(--border, #dfe2dc);
}

.identitas-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
}

.identitas-box {
  display: grid;
  gap: 7px;
  min-width: 0;
  padding: 13px;
  border: 1px solid var(--border, #dfe2dc);
  border-radius: 7px;
}

.identitas-box small {
  color: var(--muted, #747a80);
  font-size: 10px;
}

.identitas-box strong {
  color: #000000;
  font-size: 12px;
  overflow-wrap: anywhere;
}

/* Tabel identitas */
.tabel-identitas {
  width: 100%;
}

.tabel-row {
  display: grid;
  grid-template-columns: minmax(130px, 0.8fr) minmax(0, 1.4fr);
  gap: 15px;
  padding: 12px 3px;
  border-bottom: 1px solid var(--border, #dfe2dc);
  font-size: 12px;
  line-height: 1.6;
}

.tabel-row:last-child {
  border-bottom: 0;
}

.tabel-row span {
  color: var(--muted, #747a80);
}

.tabel-row strong {
  font-weight: 500;
  overflow-wrap: anywhere;
}

/* Footer */
.tentang-footer {
  margin-top: auto;
  padding: 23px 18px;
  background: #fff;
  color: #000000;
  text-align: center;
}

.tentang-footer p {
  margin: 0;
  font-size: 12px;
  line-height: 1.8;
  opacity: 0.9;
}

.tentang-footer span {
  margin: 0 7px;
  opacity: 0.65;
}

/* Tablet */
@media (max-width: 1050px) {
  .profil-layout {
    grid-template-columns: minmax(190px, 230px) minmax(0, 1fr);
    gap: 13px;
    padding: 16px;
  }

  .konten-card {
    padding: 15px;
  }
}

/* HP */
@media (max-width: 700px) {
  .tentang-header {
    padding: 22px 17px;
  }

  .tentang-header h1 {
    font-size: 25px;
  }

  .tentang-header p {
    font-size: 12px;
  }

  .header-logo {
    width: 42px;
    height: 42px;
  }

  .profil-layout {
    grid-template-columns: minmax(0, 1fr);
    gap: 14px;
    padding: 13px 11px 20px;
  }

  .profil-kiri,
  .profil-kanan {
    gap: 13px;
  }

  .konten-card {
    padding: 14px;
  }

  .tabel-row {
    grid-template-columns: minmax(100px, 0.8fr) minmax(0, 1.2fr);
    gap: 10px;
    font-size: 11px;
  }

  .tentang-footer {
    padding: 19px 12px;
  }

  .tentang-footer p {
    font-size: 10px;
  }
}
</style>
