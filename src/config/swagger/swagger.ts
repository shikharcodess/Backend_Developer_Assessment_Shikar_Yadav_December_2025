import swaggerJsdoc, { Options } from "swagger-jsdoc";

const options: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "PurpleMerit Backend Developer Assessment API Docs",
      version: "1.0.0",
      description: "",
    },
    basePath: "/api/v1",
    servers: [
      {
        url: "http://localhost:8888/api/v1",
      },
      {
        url: "https://pm-assessment.shikharcodes.com/api/v1",
      },
    ],
  },
  apis: ["./src/modules/api/**/*.ts", "./src/app.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
