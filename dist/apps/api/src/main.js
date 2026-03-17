"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = __importDefault(require("helmet"));
const app_module_1 = require("./app.module");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    // Environment validation
    if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
        logger.error('FATAL: JWT_SECRET must be set in production environment');
        process.exit(1);
    }
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { logger: ['error', 'warn', 'log'] });
    // Security
    app.use((0, helmet_1.default)());
    const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
        .split(',')
        .map((o) => o.trim());
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            }
            else {
                callback(new Error(`CORS: origin ${origin} not allowed`));
            }
        },
        credentials: true,
    });
    // Global pipes
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    // Global prefix
    app.setGlobalPrefix('api/v1', { exclude: ['/api/v1/health'] });
    // Health check (used by Docker healthcheck)
    const httpAdapter = app.getHttpAdapter();
    httpAdapter.get('/api/v1/health', (_req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
    // Swagger / OpenAPI
    if (process.env.NODE_ENV !== 'production') {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('BIS ERP API')
            .setDescription('BIS ERP REST API — v1')
            .setVersion('1.0')
            .addBearerAuth()
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api/docs', app, document);
        logger.log('Swagger UI: http://localhost:3001/api/docs');
    }
    const port = process.env.PORT || 3001;
    await app.listen(port);
    logger.log(`API server listening on http://localhost:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map