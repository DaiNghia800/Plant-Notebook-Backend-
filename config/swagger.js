const swaggerJsdoc = require("swagger-jsdoc");
require("dotenv").config();
const port = process.env.PORT;

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Plant Notebook API",
      version: "1.0.0",
      description: "API documentation",
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: "Local Server",
      },
      {
        url: "https://plant-notebook.id.vn",
        description: "Production Server (Online)",
      },
      {
        url: "https://plant-notebook.id.vn/admin",
        description: "Admin Server (Online)",
      }
    ],
  },
  apis: ["./routes/*.js", "./routes/**/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;