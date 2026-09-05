import { createWsRelayServer } from "@trystero-p2p/ws-relay/server";
import { defineConfig, type Plugin, type ViteDevServer } from "vite";

const pagesBase = process.env.PHOSPHENE_BASE ?? "./";
const SIGNAL_PATH = "/__phosphene_signal";

function phospheneSignal(): Plugin {
  let relay: ReturnType<typeof createWsRelayServer> | null = null;

  const attach = (server: ViteDevServer): void => {
    const http = server.httpServer;
    if (!http || relay) {
      return;
    }
    relay = createWsRelayServer({
      server: http,
      path: SIGNAL_PATH,
    });
  };

  return {
    name: "phosphene-signal",
    configureServer(server) {
      attach(server);
      server.httpServer?.once("listening", () => attach(server));
    },
    closeBundle() {
      void relay?.close();
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
