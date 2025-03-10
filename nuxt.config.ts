// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['nuxt3-notifications', '@nuxtjs/tailwindcss', '@pinia/nuxt'],
  plugins: ['~/plugins/init-auth.ts', '~/plugins/fontawesome.ts', '~/plugins/tippy.ts', '~/plugins/moment.ts'],

  hooks: {
    "prerender:routes"({ routes }) {
      routes.clear() // Do not generate any routes (except the defaults)
    }
  },

  build: {
    transpile: ['@fortawesome/vue-fontawesome']
  },

  css: [
    '@fortawesome/fontawesome-svg-core/styles.css'
  ],

  // Disable SSR for faster development
  ssr: false,
  app: {
    head: {
      title: 'Listenify',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    },
    baseURL: '/',
    buildAssetsDir: '/assets/',
  },

  // Dev
  devServer: {
    host: '0.0.0.0'
  },

  // Modules configuration
  pinia: {
    storesDirs: ['./stores/**']
  },

  tailwindcss: {
    viewer: true,
    cssPath: ['~/assets/css/tailwind.css', { injectPosition: "first" }],
    editorSupport: true
  },

  nuxtNotifications: {
    componentName: 'AppNotifications' // 'foo-bar' or 'FooBar' for components of two or more words
  },
})