import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";

// Em desenvolvimento, o Next só libera o JavaScript da página para "localhost".
// Liberamos também os IPs desta máquina, para abrir o sistema pelo IP da rede
// (ex.: http://192.168.0.10:3000). Sem isso a página carrega, mas nada responde ao clique.
const ipsDestaMaquina = Object.values(networkInterfaces())
  .flat()
  .filter((i) => i && i.family === "IPv4" && !i.internal)
  .map((i) => i!.address);

const nextConfig: NextConfig = {
  allowedDevOrigins: ipsDestaMaquina,
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
