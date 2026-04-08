/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/**",
      },
      // Producción: Cloudflare R2
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
        pathname: "/**",
      },
    ],
  },
  // SEO programático: genera rutas estáticas para cartas, sets y juegos
  async rewrites() {
    return [
      {
        source: "/cartas/:game/:slug",
        destination: "/cartas/[game]/[slug]",
      },
    ];
  },
};

export default nextConfig;
