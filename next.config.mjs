/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // زيد هاد الجزء الجديد:
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;