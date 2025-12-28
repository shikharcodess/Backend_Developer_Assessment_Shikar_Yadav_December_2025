"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
class _Logger {
    info(message, data) {
        console.log(`INFO: ${message}`);
        if (data) {
            console.log(data);
        }
    }
    error(message, data) {
        console.error(message, data);
    }
    warning(message, data) {
        console.log(`WARN: ${message}`);
        if (data) {
            console.log(data);
        }
    }
}
exports.logger = new _Logger();
//# sourceMappingURL=logger.js.map