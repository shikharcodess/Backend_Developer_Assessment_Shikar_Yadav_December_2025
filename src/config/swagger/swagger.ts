import swaggerJsdoc, { Options } from "swagger-jsdoc";
import path from "path";

const isProd = process.env.NODE_ENV === "production";

// In production, use compiled JS files from dist folder
// In development, use TypeScript files from src folder
const apiPaths = isProd
  ? [
      path.join(__dirname, "../../modules/api/**/*.js"),
      path.join(__dirname, "../../app.js"),
    ]
  : ["./src/modules/api/**/*.ts", "./src/app.ts"];

const options: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "PurpleMerit Backend Developer Assessment API Docs",
      version: "1.0.0",
      description: "",
    },
    servers: [
      {
        url: "http://localhost:8888/api/v1",
      },
      {
        url: "https://pm-assessment.shikharcodes.com/api/v1",
      },
    ],
  },
  apis: apiPaths,
};

export const swaggerSpec = swaggerJsdoc(options);
