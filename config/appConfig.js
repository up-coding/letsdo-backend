let appConfig = {
  port: "3000",
  allowedCorsOrigin: "*",
  environment: "dev",
  baseUrl: "http://localhost:3000",
  appUrl: "http://localhost:4200",
  apiVersion: "/api/v1",
  key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXNzIjoiYTJhczJzNTU2NiJ9.57GQDC9qff0a2wMnS9C2gHbz5-63XMe7KBVfKVqk11Y`,
  dbUri: `mongodb://node-shop:node-shop@cluster0-shard-00-00-zvxva.mongodb.net:27017,
       cluster0-shard-00-01-zvxva.mongodb.net:27017,cluster0-shard-00-02-zvxva.
        mongodb.net:27017/letsdoaadppa?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true`
};

module.exports = appConfig;
