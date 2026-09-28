"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controller/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const response_1 = require("../utils/response");
const router = (0, express_1.Router)();
// Endpoint Public (Login)
router.post('/login', authController_1.login);
// Endpoint Protected (Cek Profile / Me)
router.get('/me', authMiddleware_1.verifyToken, (req, res) => {
    return (0, response_1.sendSuccess)(res, 'Data user aktif', req.user);
});
exports.default = router;
//# sourceMappingURL=authRoutes.js.map