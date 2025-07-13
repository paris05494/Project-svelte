import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port: process.env.PORT || 5000,
    excelUploadPath: process.env.EXCEL_UPLOAD_PATH || './uploads', // ตรวจสอบให้แน่ใจว่า directory นี้มีอยู่
    hypertacConfig: {
        rows: 18,
        cols: 5,
        totalSlots: 90
    }
};