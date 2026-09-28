"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = void 0;
const sendSuccess = (res, message, data = null, code = 200) => {
    return res.status(code).json({
        status: 'success',
        message,
        data
    });
};
exports.sendSuccess = sendSuccess;
const sendError = (res, message, code = 400, errors = null) => {
    return res.status(code).json({
        status: 'error',
        message,
        errors
    });
};
exports.sendError = sendError;
//# sourceMappingURL=response.js.map