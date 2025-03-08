// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],
  plugins: ['~/plugins/init-auth.ts'],

  // Disable SSR for faster development
  ssr: false,

  // Modules configuration
  pinia: {
    storesDirs: ['./stores/**']
  },

  tailwindcss: {
    viewer: true,
    cssPath: ['~/assets/css/tailwind.css', { injectPosition: "first" }],
    editorSupport: true
  }
})