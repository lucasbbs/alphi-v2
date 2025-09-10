/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["lh3.googleusercontent.com", "vercel.com"],
  },
  // Configure for Replit environment
  experimental: {
    allowedHosts: true,
  },
  // Use all hosts for dev server in Replit
  ...(process.env.NODE_ENV === 'development' && {
    experimental: {
      allowedHosts: true,
    },
  }),
  async redirects() {
    return [
      {
        source: "/github",
        destination: "https://github.com/steven-tey/precedent",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
