"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackgroundWorker = BackgroundWorker;
const rabbitmq_1 = __importDefault(require("./rabbitmq"));
const vm_1 = __importDefault(require("vm"));
async function BackgroundWorker() {
    await rabbitmq_1.default.consume("jobs", "CODE_EXECUTION", async (data, msg) => {
        vm_1.default.runInNewContext(data.payload.code, {
            console,
        });
    });
}
//# sourceMappingURL=workers.js.map