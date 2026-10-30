<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from '../components/Sidebar.vue'
import fotoLombaAdat from '../assets/lomba-adat.jpeg'
import fotoHariGuru from '../assets/hari-guru.jpg'

const route = useRoute()

// Menyesuaikan Sidebar dengan portal Guru atau Orang Tua
const rolePortal = computed(() =>
  route.path.startsWith('/orang-tua') ? 'ortu' : 'guru'
)

// Identitas sekolah mengikuti halaman Tentang Kami
const sekolah = {
  nama: 'SD Negeri 173203 Purbatua',
  npsn: '10206372'
}

// Filter kategori
const kategoriAktif = ref('Semua')

// Modal detail pengumuman
const pengumumanTerpilih = ref(null)

// Data pengumuman ditulis langsung di Vue
const daftarPengumuman = ref([
  {
    id: 1,
    judul: 'Class Meeting Sekolah',
    kategori: 'Kegiatan Sekolah',
    ikon: '🏆',
    tanggal: '14 Desember 2026',
    lokasi: 'Lapangan sekolah',
    ringkasan:
      'Dalam rangka mengisi kegiatan setelah pelaksanaan ujian semester, sekolah akan menyelenggarakan class meeting yang diikuti oleh seluruh kelas.',
    isi: [
      'Dalam rangka mengisi kegiatan setelah pelaksanaan ujian semester, sekolah akan menyelenggarakan class meeting yang diikuti oleh seluruh kelas.',
      'Kegiatan meliputi pertandingan olahraga, permainan kelompok, dan berbagai perlombaan antarkelas.',
      'Seluruh siswa diharapkan berpartisipasi dengan menjunjung tinggi sportivitas, kedisiplinan, dan kebersamaan.'
    ]
  },
  {
    id: 2,
    judul: 'Peringatan Hari Guru Nasional',
    kategori: 'Hari Besar',
    ikon: '👨‍🏫',
    foto:fotoHariGuru,
    tanggal: '25 November 2026',
    lokasi: 'Lingkungan sekolah',
    ringkasan:
      'Dalam rangka memperingati Hari Natal, sekolah akan mengadakan kegiatan penghormatan kepada guru serta kegiatan kebersamaan antara siswa dan tenaga pendidik.',
    isi: [
      'Dalam rangka memperingati Hari Guru Nasional, sekolah dapat menyelenggarakan kegiatan untuk menghargai jasa para guru dan tenaga pendidik.',
      'Kegiatan dapat berupa upacara peringatan, penampilan siswa, serta kegiatan kebersamaan antara siswa dan guru.',
      'Siswa diharapkan mengikuti kegiatan dengan tertib sesuai arahan pihak sekolah.'
    ]
  },
  {
    id: 3,
    judul: 'Informasi Libur Sekolah',
    kategori: 'Libur Sekolah',
    ikon: '📅',
    tanggal: '29 Oktober 2026',
    lokasi: 'Informasi sekolah',
    ringkasan:
      'Pemberitahuan kepada seluruh orang tua dan siswa mengenai jadwal libur sekolah yang mengikuti kalender pendidikan dan ketentuan resmi sekolah di daerah masing-masing.',
    isi: [
      'Diberitahukan kepada seluruh orang tua dan siswa bahwa jadwal libur sekolah akan mengikuti kalender pendidikan dan ketentuan resmi sekolah.',
      'Tanggal mulai libur : Minggu, 20 Desember 2026.',
      'Tanggal masuk kekmbali : Senin, 10 Januari 2027',
      'Ketentuan Hari Pertama Masuk: Memakai seragam lengkap sesuai jadwal, membawa perlengkapan sekolah, dan hadir tepat waktu.',
      'Orang tua diharapkan memperhatikan informasi terbaru jadwal sekolah.'
    ]
  },
  {
    id: 4,
    judul: 'Lomba Adat dan Budaya Daerah',
    kategori: 'Perlombaan',
    ikon: '🎭',
    foto:fotoLombaAdat,
    tanggal: '29 Oktober 2026',
    lokasi: 'Lingkungan sekolah',
    ringkasan:
      'Kegiatan untuk mengenalkan dan melestarikan kebudayaan daerah melalui festival budaya yang melibatkan siswa dari berbagai kelas.',
    isi: [
      'Dalam rangka mengenalkan serta melestarikan kebudayaan daerah, sekolah dapat menyelenggarakan festival budaya yang melibatkan siswa dari berbagai kelas.',
      'Kegiatan dapat mencakup lomba pakaian adat, pertunjukan tari tradisional, permainan tradisional, serta pameran kebudayaan daerah.',
      'Melalui kegiatan ini, siswa diharapkan semakin mengenal keberagaman budaya Indonesia dan menumbuhkan rasa saling menghargai.'
    ]
  }
])

// Pilihan kategori
const daftarKategori = [
  { nama: 'Semua', ikon: '' },
  { nama: 'Kegiatan Sekolah', ikon: '' },
  { nama: 'Hari Besar', ikon: '' },
  { nama: 'Libur Sekolah', ikon: '' },
  { nama: 'Perlombaan', ikon: '' },
  { nama: 'Informasi Umum', ikon: '' }
]

// Menampilkan pengumuman sesuai kategori yang dipilih
const pengumumanTampil = computed(() => {
  if (kategoriAktif.value === 'Semua') {
    return daftarPengumuman.value
  }

  return daftarPengumuman.value.filter(
    item => item.kategori === kategoriAktif.value
  )
})

// Warna kategori
function warnaKategori(kategori) {
  const warna = {
    'Kegiatan Sekolah': 'kategori-biru',
    'Hari Besar': 'kategori-merah',
    'Libur Sekolah': 'kategori-oranye',
    Perlombaan: 'kategori-hijau',
    'Informasi Umum': 'kategori-ungu'
  }

  return warna[kategori] || 'kategori-biru'
}

// Membuka detail pengumuman
function bukaDetail(item) {
  pengumumanTerpilih.value = item
  document.body.style.overflow = 'hidden'
}

// Menutup detail pengumuman
function tutupDetail() {
  pengumumanTerpilih.value = null
  document.body.style.overflow = ''
}

// Menutup modal dengan tombol Escape
function tanganiTombolKeyboard(event) {
  if (event.key === 'Escape') {
    tutupDetail()
  }
}

onMounted(() => {
  window.addEventListener('keydown', tanganiTombolKeyboard)
})

onUnmounted(() => {
  window.removeEventListener('keydown', tanganiTombolKeyboard)
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="app-shell pengumuman-shell">
    <!-- Sidebar asli dari project -->
    <Sidebar :role="rolePortal" />

    <main class="main pengumuman-main">
      <!-- Header halaman -->
      <header class="pengumuman-header">
        <div class="header-content">

          <div>
            <span class="eyebrow">INFORMASI SEKOLAH</span>

            <h1>Pengumuman Sekolah</h1>

            <p>
              Informasi terbaru mengenai kegiatan, agenda,
              dan pemberitahuan sekolah.
            </p>
          </div>
        </div>
      </header>

      <!-- Konten utama -->
      <section class="pengumuman-content">
        <!-- Filter kategori -->
        <div
          class="filter-kategori"
          aria-label="Filter kategori pengumuman"
        >
          <button
            v-for="kategori in daftarKategori"
            :key="kategori.nama"
            type="button"
            class="filter-button"
            :class="{
              'filter-active': kategoriAktif === kategori.nama
            }"
            :aria-pressed="kategoriAktif === kategori.nama"
            @click="kategoriAktif = kategori.nama"
          >
            <span class="filter-icon">{{ kategori.ikon }}</span>
            <span>{{ kategori.nama }}</span>
          </button>
        </div>

        <!-- Informasi jumlah pengumuman -->
        <div class="daftar-heading">
          <div>
            <h2>Daftar Pengumuman</h2>

            <p>
              Informasi dan kegiatan {{ sekolah.nama }}
            </p>
          </div>

          <span class="jumlah-pengumuman">
            {{ pengumumanTampil.length }} pengumuman
          </span>
        </div>

        <!-- Daftar kartu pengumuman -->
        <div class="daftar-pengumuman">
          <article
            v-for="item in pengumumanTampil"
            :key="item.id"
            class="card pengumuman-card"
          >
            <!-- Ilustrasi -->
            <div
              class="pengumuman-ilustrasi"
              :class="warnaKategori(item.kategori)"
            >
              <span>{{ item.ikon }}</span>
            </div>

            <!-- Isi kartu -->
            <div class="pengumuman-info">
              <span
                class="kategori-label"
                :class="warnaKategori(item.kategori)"
              >
                {{ item.kategori }}
              </span>

              <h3>{{ item.judul }}</h3>

              <p class="pengumuman-ringkasan">
                {{ item.ringkasan }}
              </p>

              <div class="pengumuman-meta">
                <span class="meta-item">
                  <span>▦</span>
                  {{ item.tanggal }}
                </span>
              </div>
            </div>

            <!-- Tombol detail -->
            <div class="pengumuman-action">
              <button
                type="button"
                class="btn-detail"
                @click="bukaDetail(item)"
              >
                Baca Selengkapnya
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </article>

          <!-- Jika kategori tidak memiliki pengumuman -->
          <div
            v-if="pengumumanTampil.length === 0"
            class="kosong-state"
          >
            <h3>Belum Ada Pengumuman</h3>
            <p>
              Belum ada pengumuman dalam kategori ini.
            </p>

            <button
              type="button"
              class="btn-kembali"
              @click="kategoriAktif = 'Semua'"
            >
              Lihat Semua Pengumuman
            </button>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="pengumuman-footer">
        <p>
          © {{ new Date().getFullYear() }} {{ sekolah.nama }}
          <span>·</span>
          NPSN {{ sekolah.npsn }}
          <span>·</span>
          Informasi Sekolah
        </p>
      </footer>
    </main>

    <!-- Modal detail pengumuman -->
    <Transition name="modal-fade">
      <div
        v-if="pengumumanTerpilih"
        class="modal-overlay"
        @click.self="tutupDetail"
      >
        <section
          class="modal-detail"
          role="dialog"
          aria-modal="true"
          aria-labelledby="judul-detail"
        >
          <!-- Tombol tutup -->
          <button
            type="button"
            class="modal-close"
            aria-label="Tutup detail pengumuman"
            @click="tutupDetail"
          >
            ×
          </button>

          <!-- Foto atau ilustrasi modal -->
              <div
                  v-if="pengumumanTerpilih.foto"
                  class="modal-foto"
                >
                <img
                  :src="pengumumanTerpilih.foto"
                  :alt="pengumumanTerpilih.judul"
                  />
              </div>

              <div
                  v-else
                  class="modal-ilustrasi"
                  :class="warnaKategori(pengumumanTerpilih.kategori)"
                  >
                  <span>{{ pengumumanTerpilih.ikon }}</span>
              </div>

          <!-- Detail isi -->
          <span
            class="kategori-label"
            :class="warnaKategori(pengumumanTerpilih.kategori)"
          >
            {{ pengumumanTerpilih.kategori }}
          </span>

          <h2 id="judul-detail">
            {{ pengumumanTerpilih.judul }}
          </h2>

          <div class="modal-meta">
            <span>
              <span class="meta-symbol">▦</span>
              {{ pengumumanTerpilih.tanggal }}
            </span>

            <span>
              <span class="meta-symbol">⌖</span>
              {{ pengumumanTerpilih.lokasi }}
            </span>
          </div>

          <div class="modal-isi">
            <p
              v-for="(paragraf, index) in pengumumanTerpilih.isi"
              :key="index"
            >
              {{ paragraf }}
            </p>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn-tutup"
              @click="tutupDetail"
            >
              Tutup
            </button>
          </div>
        </section>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* ========================================
   DASAR HALAMAN
======================================== */

.pengumuman-shell {
  min-height: 100vh;
  background: var(--cream, #f4f5f0);
}

.pengumuman-main {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 100vh;
  padding: 0;
  color: var(--text, #2e3136);
  background: var(--cream, #f4f5f0);
}

/* ========================================
   HEADER
======================================== */

.pengumuman-header {
  position: relative;
  overflow: hidden;
  padding: 25px 28px;
  background: #f4f5f0;
  border-radius: 0 0 10px 10px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 17px;
  min-width: 0;
}

.header-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 55px;
  height: 55px;
  border-radius: 12px;
  background: rgba(245, 158, 11, 0.12);
  font-size: 30px;
}

.eyebrow {
  color: var(--muted, #747a80);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.5px;
}

.pengumuman-header h1 {
  margin: 7px 0;
  color: #000000;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(24px, 2.5vw, 34px);
  line-height: 1.3;
}

.pengumuman-header p {
  max-width: 650px;
  margin: 0;
  color: var(--muted, #747a80);
  font-size: 13px;
  line-height: 1.8;
}

/* ========================================
   KONTEN UTAMA
======================================== */

.pengumuman-content {
  flex: 1;
  min-width: 0;
  padding: 8px 24px 24px;
}

/* ========================================
   FILTER KATEGORI
======================================== */

.filter-kategori {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 7px 0 21px;
  overflow-x: auto;
  scrollbar-width: thin;
}

.filter-button {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 39px;
  padding: 9px 13px;
  border: 1px solid var(--border, #dfe2dc);
  border-radius: 9px;
  background: #fff;
  color: var(--navy, #1e3a5f);
  font-family: inherit;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.filter-button:hover {
  border-color: var(--navy, #1e3a5f);
  transform: translateY(-1px);
}

.filter-button.filter-active {
  border-color: var(--navy, #1e3a5f);
  background: var(--navy, #1e3a5f);
  color: #fff;
}

.filter-icon {
  font-size: 14px;
}

/* ========================================
   JUDUL DAFTAR
======================================== */

.daftar-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.daftar-heading h2 {
  margin: 0;
  color: #000000;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 19px;
}

.daftar-heading p {
  margin: 6px 0 0;
  color: var(--muted, #747a80);
  font-size: 11px;
  line-height: 1.6;
}

.jumlah-pengumuman {
  flex-shrink: 0;
  padding: 7px 10px;
  border: 1px solid var(--border, #dfe2dc);
  border-radius: 20px;
  background: #fff;
  color: #000000;
  font-size: 10px;
}

/* ========================================
   KARTU PENGUMUMAN
======================================== */

.daftar-pengumuman {
  display: grid;
  align-content: start;
  gap: 13px;
}

.pengumuman-card {
  display: grid;
  grid-template-columns: 105px minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
  min-width: 0;
  padding: 16px;
  border: 1px solid var(--border, #dfe2dc);
  border-radius: 11px;
  background: #fff;
  box-shadow: 0 2px 7px rgba(30, 58, 95, 0.05);
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.pengumuman-card:hover {
  box-shadow: 0 5px 16px rgba(30, 58, 95, 0.09);
  transform: translateY(-2px);
}

.pengumuman-ilustrasi {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 105px;
  height: 105px;
  border-radius: 10px;
  font-size: 45px;
}

.pengumuman-info {
  min-width: 0;
}

.kategori-label {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 5px 10px;
  border-radius: 20px;
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  line-height: 1.2;
}

.pengumuman-info h3 {
  margin: 8px 0 6px;
  color: #000000;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 16px;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.pengumuman-ringkasan {
  display: -webkit-box;
  overflow: hidden;
  margin: 0;
  color: var(--text, #2e3136);
  font-size: 11px;
  line-height: 1.75;
  overflow-wrap: anywhere;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.pengumuman-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 11px;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--muted, #747a80);
  font-size: 10px;
}

.meta-item > span {
  color: #000000;
  font-size: 15px;
}

.pengumuman-action {
  display: flex;
  justify-content: flex-end;
}

.btn-detail,
.btn-tutup,
.btn-kembali {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 37px;
  padding: 10px 13px;
  border: 1px solid var(--navy, #1e3a5f);
  border-radius: 8px;
  background: var(--navy, #1e3a5f);
  color: #fff;
  font-family: inherit;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.2s ease,
    transform 0.2s ease;
}

.btn-detail:hover,
.btn-tutup:hover,
.btn-kembali:hover {
  background: #294d75;
  transform: translateY(-1px);
}

.btn-detail span {
  font-size: 15px;
}

/* ========================================
   WARNA KATEGORI
======================================== */

.kategori-biru {
  background: #e3f0fa;
  color: #315f89;
}

.kategori-merah {
  background: #fbe7e4;
  color: #bd554e;
}

.kategori-oranye {
  background: #fff0d5;
  color: #a86b0c;
}

.kategori-hijau {
  background: #e2f1e7;
  color: #427c59;
}

.kategori-ungu {
  background: #eee7fa;
  color: #7656a3;
}

/* Label kategori pada kartu dan modal */
.kategori-label.kategori-biru {
  background: #527fa9;
  color: #fff;
}

.kategori-label.kategori-merah {
  background: #cf6861;
  color: #fff;
}

.kategori-label.kategori-oranye {
  background: #f2a42d;
  color: #fff;
}

.kategori-label.kategori-hijau {
  background: #589b75;
  color: #fff;
}

.kategori-label.kategori-ungu {
  background: #8769b5;
  color: #fff;
}

/* ========================================
   KEADAAN KOSONG
======================================== */

.kosong-state {
  display: grid;
  justify-items: center;
  gap: 10px;
  padding: 40px 20px;
  border: 1px dashed var(--border, #dfe2dc);
  border-radius: 11px;
  background: #fff;
  text-align: center;
}

.kosong-state > span {
  font-size: 35px;
}

.kosong-state h3 {
  margin: 0;
  color: var(--navy, #1e3a5f);
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 18px;
}

.kosong-state p {
  margin: 0;
  color: var(--muted, #747a80);
  font-size: 12px;
  line-height: 1.7;
}

/* ========================================
   CATATAN PENGUMUMAN
======================================== */

.catatan-pengumuman {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  margin-top: 17px;
  padding: 14px;
  border: 1px solid #cfe2f8;
  border-radius: 9px;
  background: #edf5fd;
}

.catatan-icon {
  flex-shrink: 0;
  color: #427db6;
  font-size: 17px;
  font-weight: 700;
}

.catatan-pengumuman p {
  margin: 0;
  color: #315779;
  font-size: 11px;
  line-height: 1.8;
}

/* ========================================
   FOOTER
======================================== */

.pengumuman-footer {
  margin-top: auto;
  padding: 22px 18px;
  border-top: 1px solid var(--border, #dfe2dc);
  background: #fff;
  color: #000000;
  text-align: center;
}

.pengumuman-footer p {
  margin: 0;
  font-size: 11px;
  line-height: 1.8;
}

.pengumuman-footer span {
  margin: 0 7px;
  opacity: 0.65;
}

/* ========================================
   MODAL DETAIL
======================================== */

.modal-overlay {
  position: fixed;
  z-index: 2000;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  padding: 22px;
  background: rgba(22, 38, 56, 0.45);
  backdrop-filter: blur(3px);
}

.modal-detail {
  position: relative;
  width: min(95vw, 500px);
  max-height: 95vh;
  overflow-y: auto;
  padding: 24px;
  border: 1px solid var(--border, #dfe2dc);
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 15px 45px rgba(15, 35, 55, 0.2);
}

.modal-close {
  position: absolute;
  z-index: 1;
  top: 12px;
  right: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  color: var(--navy, #1e3a5f);
  font-size: 26px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.modal-close:hover {
  background: #edf0f3;
}

.modal-ilustrasi {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100px;
  margin-bottom: 16px;
  border-radius: 9px;
  font-size: 48px;
}

.modal-detail h2 {
  margin: 10px 0;
  color: var(--navy, #1e3a5f);
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 23px;
  line-height: 1.45;
  overflow-wrap: anywhere;
}

.modal-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 18px;
  margin: 14px 0 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border, #dfe2dc);
}

.modal-meta > span {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--muted, #747a80);
  font-size: 11px;
  line-height: 1.6;
}

.meta-symbol {
  color: var(--navy, #1e3a5f);
  font-size: 16px;
}

.modal-isi p {
  margin: 0 0 13px;
  color: var(--text, #2e3136);
  font-size: 12px;
  line-height: 1.9;
  overflow-wrap: anywhere;
}

.modal-catatan {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 19px;
  padding: 13px;
  border: 1px solid #cfe2f8;
  border-radius: 8px;
  background: #edf5fd;
}

.modal-catatan > span {
  flex-shrink: 0;
  color: #427db6;
  font-size: 17px;
}

.modal-catatan p {
  margin: 0;
  color: #315779;
  font-size: 11px;
  line-height: 1.8;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.btn-tutup {
  min-width: 95px;
  font-size: 11px;
}

/* Animasi modal */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.22s ease;
}

.modal-fade-enter-active .modal-detail,
.modal-fade-leave-active .modal-detail {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .modal-detail,
.modal-fade-leave-to .modal-detail {
  opacity: 0;
  transform: translateY(12px) scale(0.98);
}

/* ========================================
   TABLET
======================================== */

@media (max-width: 1050px) {
  .pengumuman-header {
    padding: 22px 20px;
  }

  .pengumuman-content {
    padding: 8px 16px 20px;
  }

  .pengumuman-card {
    grid-template-columns: 85px minmax(0, 1fr);
    gap: 13px;
  }

  .pengumuman-ilustrasi {
    width: 85px;
    height: 85px;
    font-size: 38px;
  }

  .pengumuman-action {
    grid-column: 2;
    justify-content: flex-start;
  }

  .btn-detail {
    min-height: 34px;
  }
}

/* ========================================
   HP
======================================== */

@media (max-width: 700px) {
  .pengumuman-header {
    padding: 21px 16px;
  }

  .header-content {
    align-items: flex-start;
    gap: 11px;
  }

  .header-icon {
    width: 43px;
    height: 43px;
    font-size: 23px;
  }

  .pengumuman-header h1 {
    margin-top: 6px;
    font-size: 24px;
  }

  .pengumuman-header p {
    font-size: 12px;
  }

  .pengumuman-content {
    padding: 7px 11px 19px;
  }

  .filter-kategori {
    gap: 7px;
    padding-bottom: 18px;
  }

  .filter-button {
    min-height: 36px;
    padding: 8px 11px;
    font-size: 10px;
  }

  .daftar-heading {
    align-items: flex-start;
  }

  .daftar-heading h2 {
    font-size: 17px;
  }

  .daftar-heading p {
    font-size: 10px;
  }

  .jumlah-pengumuman {
    padding: 6px 8px;
    font-size: 9px;
  }

  .pengumuman-card {
    grid-template-columns: 68px minmax(0, 1fr);
    gap: 11px;
    padding: 12px;
  }

  .pengumuman-ilustrasi {
    width: 68px;
    height: 68px;
    font-size: 31px;
  }

  .pengumuman-info h3 {
    margin-top: 7px;
    font-size: 14px;
  }

  .pengumuman-ringkasan {
    font-size: 10px;
    line-height: 1.7;
    -webkit-line-clamp: 4;
  }

  .kategori-label {
    padding: 5px 8px;
    font-size: 9px;
  }

  .pengumuman-meta {
    margin-top: 8px;
  }

  .meta-item {
    font-size: 9px;
  }

  .pengumuman-action {
    grid-column: 1 / -1;
    justify-content: flex-start;
  }

  .btn-detail {
    min-height: 35px;
    padding: 9px 11px;
    font-size: 10px;
  }

  .catatan-pengumuman {
    padding: 11px;
  }

  .catatan-pengumuman p {
    font-size: 10px;
  }

  .pengumuman-footer {
    padding: 17px 10px;
  }

  .pengumuman-footer p {
    font-size: 9px;
  }

  .modal-overlay {
    align-items: center;
    padding: 12px;
  }

  .modal-detail {
    max-height: calc(100vh - 24px);
    padding: 17px;
  }

  .modal-ilustrasi {
    height: 85px;
    font-size: 40px;
  }

  .modal-detail h2 {
    font-size: 20px;
  }

  .modal-isi p {
    font-size: 11px;
  }
}

/* Foto pengumuman pada modal */
.modal-foto {
  width: 100%;
  margin-bottom: 16px;
  overflow: hidden;
  border-radius: 9px;
  background: #f4f5f0;
}

.modal-foto img {
  display: block;
  width: 100%;
  height: auto;
  object-fit: contain;
  border-radius: 9px;
}

/* Mengurangi animasi bagi pengguna yang memilih
   pengurangan gerakan pada perangkatnya */
@media (prefers-reduced-motion: reduce) {
  .filter-button,
  .pengumuman-card,
  .btn-detail,
  .modal-fade-enter-active,
  .modal-fade-leave-active {
    transition: none;
  }
}
</style>