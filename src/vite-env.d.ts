/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DASHBOARD_PASSCODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
