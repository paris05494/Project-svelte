import app from './app.js';
import { config } from './config/index.js';
import express from 'express';
import cors from 'cors';
import routes from './presentation/routes/index.js';
import { errorHandler } from './middlewares/error-handler.js';
import { AppError } from './utils/app-error.js';
import path from 'path';
import fs from 'fs';
import { config } from './config/index.js';

const app = express();

// ตรวจสอบและสร้าง directory สำหรับอัปโหลดหากยังไม่มี
const uploadDir = path.resolve(config.excelUploadPath);
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`Created upload directory: ${uploadDir}`);
}

// เปิดใช้งาน CORS สำหรับทุก Origin (สำหรับการพัฒนา)
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parser, อ่านข้อมูลจาก body เข้าสู่ req.body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API routes
app.use('/api/v1', routes);

// จัดการเส้นทางที่ไม่รู้จัก
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Middleware จัดการข้อผิดพลาดทั่วโลก
app.use(errorHandler);

export default app;
