<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const role = ref('guru')
const email = ref('')
const password = ref('')
const remember = ref(true)
const error = ref('')

// Data akun
const accounts = {
  guru: {
    username: 'mantosimatupang@gmail.com',
    password: 'manto123'
  },

  'orang-tua': {
    username: 'ratnawijaya@gmail.com',
    password: 'ratna123'
  }
}

function login() {
  // Cek input kosong
  if (!email.value || !password.value) {
    alert('Username dan password wajib diisi!')
    error.value = 'Username dan password wajib diisi.'
    return
  }

  const account = accounts[role.value]

  // Cek username dan password
  if (
    email.value !== account.username ||
    password.value !== account.password
  ) {
    alert('Username atau password salah!')
    error.value = 'Username atau password salah.'
    return
  }

  // Login berhasil
  error.value = ''

  localStorage.setItem('absen-role', role.value)

  localStorage.setItem(
    'absen-user',
    JSON.stringify({
      username: email.value,
      remember: remember.value
    })
  )

  alert('Login berhasil!')

  // Redirect berdasarkan role
  if (role.value === 'guru') {
    router.push('/guru/dashboard')
  } else {
    router.push('/orang-tua/dashboard')
  }
}

function switchRole(value) {
  role.value = value
  password.value = ''
  error.value = ''

  // Username otomatis berubah sesuai role
  if (value === 'guru') {
    email.value = ''
  } else {
    email.value = ''
  }
}
</script>

<template>
  <div class="login-page">

    <section class="login-form-wrap">
      <form class="login-form" @submit.prevent="login">

        <h2>Login</h2>

        <p>
          Pilih peran Anda, masuk menggunakan akun yang diberikan sekolah.
        </p>

        <!-- PILIH ROLE -->
        <div class="role-tabs">

          <button
            type="button"
            class="role-tab"
            :class="{ active: role === 'guru' }"
            @click="switchRole('guru')"
          >
            Guru
          </button>

          <button
            type="button"
            class="role-tab"
            :class="{ active: role === 'orang-tua' }"
            @click="switchRole('orang-tua')"
          >
            Orang Tua
          </button>

        </div>

        <!-- USERNAME -->
        <div class="form-group">

          <label>Username</label>

          <input
            v-model="email"
            type="text"
            placeholder="Masukkan username"
          />

        </div>

        <!-- PASSWORD -->
        <div class="form-group">

          <label>Kata sandi</label>

          <input
            v-model="password"
            type="password"
            placeholder="Masukkan kata sandi"
          />

        </div>

        <!-- REMEMBER -->
        <div class="form-row">

          <label>
            <input
              v-model="remember"
              type="checkbox"
            >
            Ingat saya
          </label>

          <a
            href="#"
            @click.prevent="
              error = 'Fitur reset kata sandi siap dihubungkan ke email sekolah.'
            "
          >
            Lupa kata sandi?
          </a>

        </div>

        <!-- LOGIN -->
        <button
          class="btn primary login-btn"
          type="submit"
        >
          Masuk
        </button>

        <!-- ERROR -->
        <p
          v-if="error"
          style="color:#bd554e;margin-top:10px"
        >
          {{ error }}
        </p>

        <div class="login-help">

          Belum punya akun?
          Akun guru dan orang tua dibuat oleh admin sekolah.

          <br>

          Hubungi bagian Tata Usaha bila Anda belum menerima email aktivasi.

        </div>

      </form>
    </section>

  </div>
</template>