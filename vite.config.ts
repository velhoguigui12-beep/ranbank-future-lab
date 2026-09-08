import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite";

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === "seatbelt";
const isCloudflareDeploy = process.env.RANBANK_DEPLOY_TARGET === "cloudflare";
export default defineConfig(({ command }) => ({
  server: isCodexSeatbeltSandbox
    ? { watch: { useFsEvents: false, usePolling: true } }
    : undefined,
  plugins: [
    vinext(),
    ...(isCloudflareDeploy || command === "build"
      ? [cloudflare({ viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] } })]
      : []),
  ],
}));
