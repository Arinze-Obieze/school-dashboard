/** @type {import('next').NextConfig} */
const nextConfig =  {
    experimental: {
      turbo: false, // Disable Turbopack, fallback to Webpack
    },
  }

export default nextConfig;
