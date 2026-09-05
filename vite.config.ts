import { createWsRelayServer } from "@trystero-p2p/ws-relay/server";
import { defineConfig, type Plugin } from "vite";

const pagesBase = process.env.PHOSPHENE_BASE ?? "./";
const SIGNAL_PORT = 43148;

function phospheneSignal(): Plugin {
  let relay: ReturnType<typeof createWsRelayServer> | null = null;

  return {
    name: "phosphene-signal",
    configureServer() {
      if (relay) {
        return;
      }
      relay = createWsRelayServer({
        host: "0.0.0.0",
        port: SIGNAL_PORT,
      });
    },
    async closeBundle() {
      await relay?.close();
      relay = null;
    },
  };
}

export default defineConfig({
  base: pagesBase,
  plugins: [phospheneSignal()],
  server: {
    host: true,
    port: 43147,
    strictPort: true,
  },
  preview: {
    host: true,
    port: 43147,
    strictPort: true,
  },
});
