// next.config.js
const tracer = require('dd-trace').init({
  service: 'ecommerce-sanity-stripe',
  env: 'production',
  version: '1.0.0',
  // Outras configurações conforme necessário
});

const nextConfig = {
  reactStrictMode: true,
  // Outras configurações do Next.js
};

module.exports = nextConfig;

