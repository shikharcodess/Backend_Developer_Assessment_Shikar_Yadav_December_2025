"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const options = {
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
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
//# sourceMappingURL=swagger.js.map