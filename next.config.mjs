/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/a/**",
      },
      {
        protocol: "https",
        hostname: "cdn-icons-png.freepik.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  webpack: (config) => {
    config.cache = {
      type: "memory", // Stores cache in RAM (faster than disk)
      maxGenerations: 1, // Clears cache after every build
    };
    return config;
  },
};

export default nextConfig;
