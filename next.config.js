/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    embeddingTokenLimit: '8191',
    completionTokenLimit: '2048',
    summarisationWordLimit: '300',
  }
}

module.exports = nextConfig
