import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    // Explicitly anchor the workspace root to this project directory,
    // preventing Next.js from mis-detecting the parent lockfile.
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
