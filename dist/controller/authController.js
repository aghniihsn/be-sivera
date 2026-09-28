"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../config/database"));
const response_1 = require("../utils/response");
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        // 1. Validasi Input
        if (!username || !password) {
            return (0, response_1.sendError)(res, 'Username dan password wajib diisi', 400);
        }
        const db = await database_1.default;
        // 2. Cari user berdasarkan username
        const [rows] = await db.query('SELECT * FROM inv_users WHERE username = ? LIMIT 1', [username]);
        if (rows.length === 0) {
            return (0, response_1.sendError)(res, 'Username atau password salah', 401);
        }
        const user = rows[0];
        // 3. Verifikasi Password (Cek Hash bcrypt / plain text fallback)
        let isPasswordValid = false;
        // Cek apakah password di DB sudah ter-hash bcrypt
        if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
            isPasswordValid = await bcrypt_1.default.compare(password, user.password);
        }
        else {
            // Fallback jika password di DB masih plain text
            isPasswordValid = password === user.password;
        }
        if (!isPasswordValid) {
            return (0, response_1.sendError)(res, 'Username atau password salah', 401);
        }
        // 4. Generate JWT Token
        const jwtSecret = process.env.JWT_SECRET || 'sivera_secret_key_2026';
        const payload = {
            id: user.user_id || user.id,
            username: user.username,
            nama: user.nama || user.nama_user,
            role: user.role
        };
        const token = jsonwebtoken_1.default.sign(payload, jwtSecret, { expiresIn: '1d' });
        // 5. Response Data (Sesuai ekspektasi Ecme Template)
        const responseData = {
            user: payload,
            token
        };
        return (0, response_1.sendSuccess)(res, 'Login berhasil', responseData, 200);
    }
    catch (error) {
        console.error('Login Error:', error);
        return (0, response_1.sendError)(res, 'Terjadi kesalahan pada server', 500, error.message);
    }
};
exports.login = login;
//# sourceMappingURL=authController.js.map