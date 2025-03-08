// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],

  // Disable SSR for faster development
  ssr: false,

  // Modules configuration
  tailwindcss: {
    viewer: true,
    cssPath: ['~/assets/css/tailwind.css', { injectPosition: "first" }],
    editorSupport: true
  }
})