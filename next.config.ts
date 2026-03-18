import type { NextConfig } from "next";
 
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'znrczlcacsnfeeljvyfo.supabase.co', // Replace with your actual project ID
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;


