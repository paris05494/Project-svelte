import { Request, Response, NextFunction } from 'express';
import { ExcelHypertacService } from '../../application/excel-hypertac.service';
import { AppError } from '../../utils/app-error';

export class HypertacController {
    private excelHypertacService: ExcelHypertacService;

    constructor() {
        this.excelHypertacService = new ExcelHypertacService();
    }

    /**
     * Handles the Excel file upload and triggers the Hypertac visualization process.
     * @param req Express Request object. Expects an 'excelFile' in req.file.
     * @param res Express Response object.
     * @param next Express NextFunction for error handling.
     */
    public uploadExcelAndVisualize = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.file) {
                return next(new AppError('No Excel file uploaded.', 400));
            }

            const filePath = req.file.path;
            console.log(`Received file: ${filePath}`);

            // มอบหมายให้ service แอปพลิเคชันประมวลผลไฟล์ Excel
            const visualizationData = await this.excelHypertacService.processExcelForHypertac(filePath);

            res.status(200).json({
                status: 'success',
                data: visualizationData,
            });

        } catch (error: any) {
            // ส่งข้อผิดพลาดที่ตรวจพบไปยัง middleware จัดการข้อผิดพลาดทั่วโลก
            next(error);
        }
    };
}
