import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "GitNest API",
      version: "1.0.0",
      description: "Interactive API documentation for GitNest backend.",
    },
    servers: [{ url: "http://localhost:5000", description: "Development server" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/*.js", "./docs/schemas/*.js"],
};

export const specs = swaggerJsdoc(options);
