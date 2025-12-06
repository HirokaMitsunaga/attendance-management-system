import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  webpack: (config, { isServer }) => {
    // クライアントサイドでのNode.jsモジュールのフォールバック設定
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }
    return config;
  },
  // Turbopack用の空設定（webpack設定がある場合にエラーを回避するため）
  turbopack: {},
};

export default nextConfig;
