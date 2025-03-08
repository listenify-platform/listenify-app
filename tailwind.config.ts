import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  theme: {
    extend: {},
  },
  content: {
    files: [
      "./utils/**/*.{js,ts,mjs}",
      "./pages/**/*.{vue,js,jsx,mjs,ts,tsx}",
      "./layouts/**/*.{vue,js,jsx,mjs,ts,tsx}",
      "./plugins/**/*.{js,ts,mjs}",
      "./components/**/*.{vue,js,jsx,mjs,ts,tsx}",
      "./composables/**/*.{js,ts,mjs}",
      "./{A,a}pp.{vue,js,jsx,mjs,ts,tsx}",
      "./{E,e}rror.{vue,js,jsx,mjs,ts,tsx}",
      "./app.config.{js,ts,mjs}"
    ]
  },
  plugins: [],
}