"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const index_env_1 = require("./config/index.env");
const routes_1 = __importDefault(require("./app/routes"));
const globalErrorHandlers_1 = __importDefault(require("./app/middlewares/globalErrorHandlers"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const payment_controller_1 = require("./app/modules/payment/payment.controller");
const app = (0, express_1.default)();
app.post('/webhook', express_1.default.raw({ type: 'application/json' }), payment_controller_1.PaymentController.handleWebhook);
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'https://tour-guide-client-lake.vercel.app'],
    credentials: true
}));
//parser
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use("/api/v1", routes_1.default);
app.get('/', (req, res) => {
    res.send({
        message: "Server is running..",
        environment: index_env_1.config.node_env,
        uptime: process.uptime().toFixed(2) + " sec",
        timeStamp: new Date().toISOString()
    });
});
app.use(globalErrorHandlers_1.default);
exports.default = app;
