const { Client } = require("pg");

const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "lab4",
  password: "9909911391",
  port: 5432,
});
client.connect();

module.exports = client;