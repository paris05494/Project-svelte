export interface IHypertacSlot {
    id: string; // ID เชิงแนวคิด เช่น "R1C1"
    row: number;
    col: number;
    isUsed: boolean;
    signalName: string | null;
    ecuName: string | null;
    ecuPin: string | null; // ECU Pin ที่เกี่ยวข้องกับสัญญาณใน slot นี้
    physicalHypertacId: string | null; // ได้มาจาก "HE Name" และ "HE Pin" เช่น "HYP01_05_02-A01"
    isReused: boolean; // เป็นจริงหากสัญญาณนี้ถูกใช้ในหลาย slot
    originalRowIndex?: number; // Index 0-based ดั้งเดิมของแถวในข้อมูล Excel
}

export interface IHypertacVisualizationData {
    hypertacSlots: IHypertacSlot[];
    signalsUsedCount: number; // จำนวนสัญญาณที่ไม่ซ้ำกันที่ถูกกำหนดให้กับ slot
    signalsNotUsedCount: number; // จำนวนสัญญาณจาก Excel ที่ไม่ถูกกำหนดให้กับ slot ใดๆ
    hypertacEmptySlotsCount: number; // จำนวน conceptual Hypertac slots ที่ว่างเปล่า
    statusMessage: string;
}