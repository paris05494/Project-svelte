import ExcelJS from 'exceljs';
import { IExcelSignalRow } from '../../interfaces/excel.interface';
import { AppError } from '../../utils/app-error';

export class ExcelParser {
    /**
     * Parses an Excel file to extract signal data.
     * It expects specific column headers: 'Signalname', 'ECU Name', 'ECU Pin', 'HE Name', 'HE Pin'.
     * @param filePath The path to the Excel file.
     * @returns A promise that resolves to an array of IExcelSignalRow.
     * @throws AppError if the file is invalid, empty, or missing required headers.
     */
    public async parse(filePath: string): Promise<IExcelSignalRow[]> {
        const workbook = new ExcelJS.Workbook();
        try {
            await workbook.xlsx.readFile(filePath);
            const worksheet = workbook.getWorksheet(1); // อ่าน worksheet แรก

            if (!worksheet) {
                throw new AppError('No worksheet found in the Excel file.', 400);
            }

            const rows: IExcelSignalRow[] = [];
            const headerRow = worksheet.getRow(1);
            if (!headerRow || !headerRow.values || headerRow.values.length === 0) {
                throw new AppError('Excel file is empty or has no headers.', 400);
            }

            // แมปชื่อหัวข้อคอลัมน์กับชื่อ property ภายในสำหรับ IExcelSignalRow
            const headerMap: { [key: string]: keyof IExcelSignalRow } = {
                'Signalname': 'signalName',
                'ECU Name': 'ecuName',
                'ECU Pin': 'ecuPin',
                'HE Name': 'heName',
                'HE Pin': 'hePin',
            };

            // รับหัวข้อจริงจากไฟล์ Excel และแมป
            const headerValues = headerRow.values ?? []; // ป้องกัน null/undefined
            const actualHeaders: string[] = (headerValues as Array<string | { text?: string } | null>).map((v): string => {
                if (v && typeof v === 'object' && 'text' in v && typeof v.text === 'string') {
                    return v.text.trim();
                }
                return String(v ?? '').trim(); // fallback ถ้า null/undefined
            });

            const mappedColumnIndices: { [key in keyof IExcelSignalRow]?: number } = {};
            actualHeaders.forEach((header: string, index: number) => {
                const mappedKey = headerMap[header];
                if (mappedKey) {
                    mappedColumnIndices[mappedKey] = index + 1; // ExcelJS เป็น 1-indexed
                }
            });

            // ตรวจสอบคอลัมน์ที่บังคับ
            const mandatoryHeaders: Array<keyof IExcelSignalRow> = ['signalName', 'ecuName'];
            for (const mandatoryHeader of mandatoryHeaders) {
                if (mappedColumnIndices[mandatoryHeader] === undefined) {
                    throw new AppError(`Missing mandatory column: "${Object.keys(headerMap).find(key => headerMap[key] === mandatoryHeader)}" in Excel file.`, 400);
                }
            }

            // วนซ้ำแถว โดยเริ่มจากแถวที่สอง (หลังจากหัวข้อ)
            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return; // ข้ามแถวหัวข้อ

                const rowData: Partial<IExcelSignalRow> = {};
                let hasSignalName = false;
                let hasEcuName = false;

                for (const key in mappedColumnIndices) {
                    if (Object.prototype.hasOwnProperty.call(mappedColumnIndices, key)) {
                        const colIndex = mappedColumnIndices[key as keyof IExcelSignalRow];
                        if (colIndex !== undefined) {
                            const cellValue = row.getCell(colIndex).value;
                            const stringValue = cellValue ? String(cellValue).trim() : null;
                            rowData[key as keyof IExcelSignalRow] = stringValue;

                            if (key === 'signalName' && stringValue) hasSignalName = true;
                            if (key === 'ecuName' && stringValue) hasEcuName = true;
                        }
                    }
                }

                // เพิ่มแถวเฉพาะเมื่อมีฟิลด์ที่บังคับครบ
                if (hasSignalName && hasEcuName) {
                    rows.push(rowData as IExcelSignalRow);
                } else {
                    console.warn(`Skipping row ${rowNumber} due to missing mandatory data (Signalname or ECU Name).`);
                }
            });

            if (rows.length === 0) {
                throw new AppError('No valid signal data found in the Excel file after parsing. Ensure required columns are present and data is not empty.', 400);
            }

            return rows;

        } catch (error: any) {
            if (error instanceof AppError) {
                throw error;
            }
            console.error('Error parsing Excel file:', error);
            throw new AppError(`Failed to parse Excel file: ${error.message || 'Unknown error'}`, 500);
        }
    }
}
