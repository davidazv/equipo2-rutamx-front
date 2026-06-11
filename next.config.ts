import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// mapbox-gl: workers desde blob:, tiles/estilos/telemetría desde *.mapbox.com
// Firebase Auth REST: identitytoolkit / securetoken
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""};
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https://api.dicebear.com;
  font-src 'self';
  connect-src 'self' ${apiUrl} https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://api.mapbox.com https://events.mapbox.com https://*.tiles.mapbox.com;
  worker-src 'self' blob:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`;

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader.replace(/\n/g, "").replace(/\s{2,}/g, " ").trim(),
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
