import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// nonceベースのCSPはページを常に動的レンダリングさせる必要があり(静的な/ページを
// ビルド時に生成する今の構成と相性が悪いため)、Next.js公式が案内している
// 「nonceを使わない」書き方を採用している。script-src 'self'により外部の
// 不正なスクリプト読み込みはブロックしつつ、Next.js自身のインラインスクリプトは
// 'unsafe-inline'で許可する形。
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""};
  style-src 'self' 'unsafe-inline';
  img-src 'self' data:;
  font-src 'self';
  connect-src 'self';
  frame-src https://www.youtube.com;
  worker-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`
  .replace(/\s{2,}/g, " ")
  .trim();

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: cspHeader },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
