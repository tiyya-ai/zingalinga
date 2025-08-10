/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    suppressHydrationWarning: true
  },
  images: {
    domains: ['localhost', 'via.placeholder.com'],
    unoptimized: true
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
}

export default nextConfig