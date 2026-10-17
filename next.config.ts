import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },
    allowedDevOrigins: ["192.168.1.93"],
};

export default nextConfig;
