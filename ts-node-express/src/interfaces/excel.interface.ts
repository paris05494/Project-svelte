export interface IExcelSignalRow {
    signalName: string;
    ecuName: string;
    ecuPin?: string | null; // ใหม่: จากคอลัมน์ "ECU Pin"
    heName?: string | null; // ใหม่: จากคอลัมน์ "HE Name"
    hePin?: string | null;  // ใหม่: จากคอลัมน์ "HE Pin"
    [key: string]: any; // อนุญาตให้มีคอลัมน์อื่นๆ ที่อาจมีอยู่
}