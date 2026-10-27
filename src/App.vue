<template>
  <RouterView v-slot="{ Component, route }">
    <Transition name="smooth-page" mode="out-in" appear>
      <div
        :key="route.fullPath"
        class="smooth-page-wrapper"
      >
        <component :is="Component" />
      </div>
    </Transition>
  </RouterView>
</template>

<style>
/* Pembungkus halaman */
.smooth-page-wrapper {
  width: 100%;
  min-height: 100vh;
  transform-origin: center top;
  backface-visibility: hidden;
}

/* Transisi masuk dan keluar */
.smooth-page-enter-active {
  transition:
    opacity 0.45s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.45s cubic-bezier(0.22, 1, 0.36, 1),
    filter 0.45s ease;
  will-change: opacity, transform;
}

.smooth-page-leave-active {
  transition:
    opacity 0.2s ease-in,
    transform 0.2s ease-in;
  will-change: opacity, transform;
}

/* Halaman baru mulai sedikit bergeser */
.smooth-page-enter-from {
  opacity: 0;
  transform: translate3d(0, 14px, 0);
  filter: blur(2px);
}

/* Halaman baru berada pada posisi normal */
.smooth-page-enter-to {
  opacity: 1;
  transform: translate3d(0, 0, 0);
  filter: blur(0);
}

/* Halaman lama keluar dengan lembut */
.smooth-page-leave-from {
  opacity: 1;
  transform: translate3d(0, 0, 0);
}

/* Halaman lama sedikit bergeser saat keluar */
.smooth-page-leave-to {
  opacity: 0;
  transform: translate3d(0, -6px, 0);
}

/* Mengurangi efek jika pengguna memilih gerakan minimal */
@media (prefers-reduced-motion: reduce) {
  .smooth-page-enter-active,
  .smooth-page-leave-active {
    transition: none;
  }

  .smooth-page-enter-from,
  .smooth-page-enter-to,
  .smooth-page-leave-from,
  .smooth-page-leave-to {
    opacity: 1;
    transform: none;
    filter: none;
  }
}
</style>