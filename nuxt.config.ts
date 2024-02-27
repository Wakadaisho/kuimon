// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    "@nuxt/ui",
    "@nuxtjs/supabase",
    "@pinia/nuxt",
    "@pinia-plugin-persistedstate/nuxt",
    "@nuxtjs/google-fonts",
  ],
  ui: {
    icons: ["heroicons", "mdi", "simple-icons"],
  },
  supabase: {
    redirectOptions: {
      login: "/login",
      callback: "/",
      exclude: ["/login", "/sign-up", "/"],
    },
  },
  piniaPersistedstate: {
    cookieOptions: {
      sameSite: "strict",
    },
    storage: "sessionStorage",
  },
  googleFonts: {
    families: {
      "Rampant+One": true,
      Inter:true,
      
    },
    download: false,
  },
  app: {
    head: {
      title: "Kuimon",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          hid: "description",
          name: "description",
          content: "The Restauranter's Menu",
        },
      ],
    },
  },
});
