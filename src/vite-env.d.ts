/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_YANDEX_CLIENT_ID: string
  readonly VITE_YANDEX_CLIENT_SECRET: string
  readonly VITE_YANDEX_REDIRECT_URI: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
