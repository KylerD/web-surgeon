/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    embeddingTokenLimit: '8191',
    completionTokenLimit: '2048',
    summarisationWordLimit: '300',
    keywordsLimit: '5',
    referencesLimit: '10'
  }
}

module.exports = nextConfig
