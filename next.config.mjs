/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.ctfassets.net',
        port: '',
        pathname: '/p79kctcd7ahy/**',
      },
      ...[1, 2, 3, 4, 5].map((i) => ({
        protocol: 'https',
        hostname: `images${i}.bamboohr.com`,
        port: '',
      })),
      {
        protocol: 'https',
        hostname: 'resources.bamboohr.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: '**.netlify.app',
        port: '',
      },
    ],
  },
}

export default nextConfig
