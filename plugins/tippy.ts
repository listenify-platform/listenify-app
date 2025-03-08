// plugins/tippy.ts

import VueTippy from 'vue-tippy';
import 'tippy.js/dist/tippy.css'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueTippy, {
    defaultProps: {
      directive: 'tippy', // => v-tippy
      placement: 'right',
      arrow: true
    },
    flipDuration: 0,
  })
})