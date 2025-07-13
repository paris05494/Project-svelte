import { ExcelParser } from '../infrastructure/file-processing/excel-parser';
import { HypertacService } from '../domain/hypertac.service';
import { IHypertacVisualizationData } from '../interfaces/hypertac.interface';
import { IExcelSignalRow } from '../interfaces/excel.interface';
import fs from 'fs/promises';
import { AppError } from '../utils/app-error';

export class ExcelHypertacService {
    private excelParser: ExcelParser;
    private hypertacService: HypertacService;

    constructor() {
        this.excelParser = new ExcelParser();
        this.hypertacService = new HypertacService();
    }

    /**
     * Processes an uploaded Excel file to generate Hypertac visualization data.
     * This method orchestrates the parsing of the Excel file and the Hypertac simulation.
     * @param filePath The path to the uploaded Excel file.
     * @returns A promise that resolves to the Hypertac visualization data.
     * @throws AppError if processing fails or no valid signals are mapped.
     */
    public async processExcelForHypertac(filePath: string): Promise<IHypertacVisualizationData> {
        try {
            // 1. อ่านข้อมูล Excel (ตรงกับ 'Read Excel Instructions' ใน flowchart)
            const excelData: IExcelSignalRow[] = await this.excelParser.parse(filePath);

            // 2. จำลองการแมป (ตรงกับ 'Simulate Mapping' ใน Verifying Program)
            const visualizationData = this.hypertacService.generateHypertacVisualization(excelData);

            // 3. ตรวจสอบความสมเหตุสมผลของโปรแกรม (ตรงกับ 'Is the program reasonable?' ใน flowchart)
            // ตัวอย่าง: หากไม่มีสัญญาณใดๆ ถูกแมปแม้จะมีข้อมูลใน Excel
            if (excelData.length > 0 && visualizationData.signalsUsedCount === 0) {
                throw new AppError('No signals could be successfully mapped to Hypertac slots from the provided Excel data. Please check Excel format and data.', 400);
            }

            return visualizationData;

        } catch (error: any) {
            if (error instanceof AppError) {
                throw error;
            }
            console.error('Error in ExcelHypertacService:', error);
            throw new AppError(`Failed to process Excel for Hypertac visualization: ${error.message || 'Unknown error'}`, 500);
        } finally {
            // ทำความสะอาดไฟล์ที่อัปโหลด (สำคัญมากสำหรับความปลอดภัยและพื้นที่ดิสก์)
            try {
                await fs.unlink(filePath);
                console.log(`Cleaned up uploaded file: ${filePath}`);
            } catch (unlinkError) {
                console.error(`Failed to delete temporary file ${filePath}:`, unlinkError);
            }
        }
    }
}