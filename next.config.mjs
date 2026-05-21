/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.CAPACITOR_BUILD === 'true' ? 'export' : 'standalone',
  transpilePackages: ['@ionic/react', '@ionic/core', 'ionicons'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cs-portal-documents.s3.ap-south-1.amazonaws.com',
      },
    ],
  },
};

export default nextConfig;
