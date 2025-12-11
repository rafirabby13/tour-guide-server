import express from 'express';
import cors from "cors";
import { config } from './config/index.env';
import router from './app/routes';
import globalErrorHandler from './app/middlewares/globalErrorHandlers';
import cookieParser from 'cookie-parser';
import { PaymentController } from './app/modules/payment/payment.controller';
const app = express();
app.post('/api/v1/payment/webhook', express.raw({ type: 'application/json' }), // Parses raw body for signature verification
PaymentController.handleWebhook);
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
//parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/v1", router);
app.get('/', (req, res) => {
    res.send({
        message: "Server is running..",
        environment: config.node_env,
        uptime: process.uptime().toFixed(2) + " sec",
        timeStamp: new Date().toISOString()
    });
});
app.use(globalErrorHandler);
export default app;
