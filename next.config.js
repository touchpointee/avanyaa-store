/** @type {import('next').NextConfig} */
const minioHost = process.env.MINIO_ENDPOINT || ''

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.minio.com',
        pathname: '/**',
      },
      // MinIO: allow your MINIO_ENDPOINT host (required for next/image to load MinIO images)
      ...(minioHost
        ? [
            { protocol: 'https', hostname: minioHost, pathname: '/**' },
            { protocol: 'http', hostname: minioHost, pathname: '/**' },
          ]
        : []),
    ],
  },
}

module.exports = nextConfig
