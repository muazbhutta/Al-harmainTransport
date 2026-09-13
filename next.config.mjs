/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Nothing on the site needs a server: every route is statically generated and
  // the only runtime behaviour is the original's client-side scripts.
  output: 'export',
  // Assets are served byte-for-byte from /public at the original paths, so the
  // image optimizer is deliberately not in the way — the replica must ship the
  // same files at the same sizes as the original.
  images: { unoptimized: true },
};
export default nextConfig;
