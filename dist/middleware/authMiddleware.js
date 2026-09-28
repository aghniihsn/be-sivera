"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const response_1 = require("../utils/response");
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return (0, response_1.sendError)(res, 'Akses ditolak, token tidak ditemukan', 401);
    }
    const token = authHeader.slice('Bearer '.length).trim();
    if (!token) {
        return (0, response_1.sendError)(res, 'Akses ditolak, token tidak ditemukan', 401);
    }
    try {
        const jwtSecret = process.env.JWT_SECRET || 'sivera_secret_key_2026';
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        req.user = decoded;
        next();
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'Token tidak valid atau sudah kadaluwarsa', 403);
    }
};
exports.verifyToken = verifyToken;
//# sourceMappingURL=authMiddleware.js.map