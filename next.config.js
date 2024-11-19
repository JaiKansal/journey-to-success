/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/journey-to-success',
  assetPrefix: '/journey-to-success/',
  trailingSlash: true,
}

module.exports = nextConfig 
