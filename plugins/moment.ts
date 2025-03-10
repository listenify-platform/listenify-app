// plugins/moment.ts
import moment from 'moment'

export default defineNuxtPlugin(() => {
  return {
    provide: {
      moment: moment
    }
  }
})

// Add TypeScript type declarations
// types/index.d.ts
declare module '#app' {
  interface NuxtApp {
    $moment: typeof moment
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $moment: typeof moment
  }
}