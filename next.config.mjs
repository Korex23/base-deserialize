/** @type {import('next').NextConfig} */
const nextConfig = {
  // turbopack: {
  //   enabled: true,
  // },
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "assets.coingecko.com",
      },
      {
        protocol: "https",
        hostname: "powpow.app",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "eclipse.invariant.app",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname:
          "bafkreibk3covs5ltyqxa272uodhculbr6kea6betidfwy3ajsav2vjzyum.ipfs.nftstorage.link",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "jaine.app",
        pathname: "/**",
      },
    ],
  },

  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
