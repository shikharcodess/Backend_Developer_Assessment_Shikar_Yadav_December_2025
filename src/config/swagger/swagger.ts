import swaggerJsdoc, { Options } from "swagger-jsdoc";

const options: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TrialCheckout Core API Docs",
      version: "1.0.0",
      description: "API documentation for merchant dashboard of trialcheckout",
    },
    servers: [
      {
        url: "http://localhost:8888", // replace with your server’s url
      },
      {
        url: "https://dev.api.trialcheckouts.com",
      },
      {
        url: "https://api.trialcheckouts.com",
      },
    ],
  },
  apis: ["./src/api/**/*.ts", "./src/app.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
