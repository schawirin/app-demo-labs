const tracer = require('dd-trace').init({
    service: 'ecommerce-sanity-stripe',
    // Outras opções de configuração, se necessário
  });
  
  module.exports = tracer;
  