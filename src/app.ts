import express, { Request, Response } from "express";
import cors from "cors";
import { ENV } from "./config/env/env";
import { setupV1ApiRoutes, setupErrorHandling } from "./modules/api/api";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger/swagger";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static("src/public"));

// CORS configuration
if (ENV.CORS_ENABLED) {
  app.use(
    cors({
      origin: ENV.CORS_ALLOWED_ORIGIN?.split(",") || "*",
      methods: ENV.CORS_ALLOWED_METHODS?.split(",") || [
        "GET",
        "POST",
        "PUT",
        "DELETE",
      ],
      allowedHeaders: ENV.CORS_ALLOWED_HEADERS?.split(",") || [
        "Content-Type",
        "Authorization",
      ],
      credentials: ENV.CORS_ALLOW_CREDENTIALS === true,
    })
  );
}

setupV1ApiRoutes(app);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {}));

/**
 * @openapi
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Server Health Check
 *     responses:
 *       200:
 *         description: Server Is Healthy
 */
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "OK" });
  return;
});

setupErrorHandling(app);

export default app;
