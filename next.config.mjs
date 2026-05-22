/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.CAPACITOR_BUILD === 'true' ? 'export' : 'standalone',
  images: {
    unoptimized: process.env.CAPACITOR_BUILD === 'true',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cs-portal-documents.s3.ap-south-1.amazonaws.com',
      },
    ],
  },
};

export default nextConfig;
