/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', process.env.SUPABASE_URL?.replace('https://', '')].filter(Boolean),
  },
}

module.exports = nextConfig
