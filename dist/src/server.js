"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const seedSuperAdmin_1 = require("./app/shared/seedSuperAdmin");
async function bootstrap() {
    // This variable will hold our server instance
    let server;
    try {
        // Start the server
        server = app_1.default.listen(5000, () => {
            console.log(`🚀 Tour Guide.. Server is running on http://localhost:5000`);
        });
        // Function to gracefully shut down the server
        const exitHandler = () => {
            if (server) {
                server.close(() => {
                    console.log('Server closed gracefully.');
                    process.exit(1); // Exit with a failure code
                });
            }
            else {
                process.exit(1);
            }
        };
        // Handle unhandled promise rejections
        process.on('unhandledRejection', (error) => {
            console.log('Unhandled Rejection is detected, we are closing our server...');
            if (server) {
                server.close(() => {
                    console.log(error);
                    process.exit(1);
                });
            }
            else {
                process.exit(1);
            }
        });
    }
    catch (error) {
        console.error('Error during server startup:', error);
        process.exit(1);
    }
}
(async () => {
    await bootstrap();
    await (0, seedSuperAdmin_1.seedSuperAdmin)();
})();
