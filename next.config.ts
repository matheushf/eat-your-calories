import type { NextConfig } from "next";
import withPWA from 'next-pwa'

const nextConfig: NextConfig = {
  /* config options here */
};

const config = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
})(nextConfig)

export default config;
