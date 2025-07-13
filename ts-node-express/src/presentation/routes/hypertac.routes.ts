import { Router } from 'express';
import multer from 'multer';
import { HypertacController } from '../controllers/hypertac.controller';
import { config } from '../../config/index';
import path from 'path';
import fs from 'fs';

// ตรวจสอบให้แน่ใจว่า directory สำหรับอัปโหลดมีอยู่
const uploadDir = path.resolve(config.excelUploadPath);
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// กำหนดค่า Multer สำหรับการอัปโหลดไฟล์
const upload = multer({
    dest: uploadDir, // directory ปลายทางสำหรับไฟล์ที่อัปโหลด
    fileFilter: (req, file, cb) => {
        // กรองเพื่อให้เฉพาะไฟล์ Excel เท่านั้น
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || // .xlsx
            file.mimetype === 'application/vnd.ms-excel') { // .xls
            cb(null, true); // ยอมรับไฟล์
        } else {
            cb(null, false);// ปฏิเสธไฟล์
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024, // จำกัดขนาดไฟล์ที่ 5MB
    },
});

const router = Router();
const hypertacController = new HypertacController();

// กำหนดเส้นทางสำหรับการอัปโหลดไฟล์ Excel
router.post(
    '/upload-excel',
    upload.single('excelFile'), // 'excelFile' คือชื่อของฟิลด์ฟอร์มที่ส่งไฟล์มา
    hypertacController.uploadExcelAndVisualize
);

export default router;