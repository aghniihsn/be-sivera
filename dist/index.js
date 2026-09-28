"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/auth.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middlewares
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json());
// Health Check Endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'SEVERA API is running',
    });
});
app.use('/api/v1/auth', authRoutes_1.default);
// App Listener
app.listen(PORT, () => {
    console.log(`SIVERA API Running on Port ${PORT}`);
});
//# sourceMappingURL=index.js.map