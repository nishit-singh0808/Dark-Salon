/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',   // static export for Firebase
  trailingSlash: true,
  images: {
    unoptimized: true,  // ✅ disable Next.js image optimization
  },
};

export default nextConfig;
