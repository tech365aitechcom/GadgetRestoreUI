/** @type {import('next').NextConfig} */
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  output: process.env.CAPACITOR_BUILD === 'true' ? 'export' : 'standalone',
  allowedDevOrigins: process.env.ALLOWED_DEV_ORIGINS ? process.env.ALLOWED_DEV_ORIGINS.split(',') : [],
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
