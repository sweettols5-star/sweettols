/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pure static export: `out/` goes to any static host (Hostinger, Vercel…).
  output: 'export',
  // Pin the workspace root: a stray package-lock.json higher up the tree makes
  // Turbopack treat the whole home directory as the project.
  turbopack: { root: import.meta.dirname },
  images: { unoptimized: true },
  // Several root layouts ((fr), [lang], (admin)): the 404 brings its own <html>
  // from app/global-not-found.tsx.
  experimental: { globalNotFound: true },
  // Apache serves /boutique/ -> /boutique/index.html
  trailingSlash: true,
};
export default nextConfig;
