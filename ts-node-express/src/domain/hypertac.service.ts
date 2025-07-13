import { IExcelSignalRow } from '../interfaces/excel.interface';
import { IHypertacSlot, IHypertacVisualizationData } from '../interfaces/hypertac.interface';
import { config } from '../config/index';
import { AppError } from '../utils/app-error';

export class HypertacService {
    private readonly rows: number;
    private readonly cols: number;
    private readonly totalSlots: number;

    constructor() {
        this.rows = config.hypertacConfig.rows;
        this.cols = config.hypertacConfig.cols;
        this.totalSlots = config.hypertacConfig.totalSlots;
    }

    /**
     * Generates the Hypertac visualization data based on parsed Excel signal rows.
     * It simulates slot assignment, detects reused signals, and calculates summary statistics.
     * @param excelDataRows An array of parsed signal data from the Excel file.
     * @returns The visualization data including Hypertac slots and summary counts.
     * @throws AppError if Hypertac initialization fails.
     */
    public generateHypertacVisualization(
        excelDataRows: IExcelSignalRow[]
    ): IHypertacVisualizationData {
        const hypertacSlots: IHypertacSlot[] = [];
        const signalUsageCount = new Map<string, number>(); // เก็บ SignalName -> จำนวนครั้งที่ถูกใช้
        const assignedSignalNames = new Set<string>(); // เก็บชื่อสัญญาณที่ถูกกำหนดให้กับ slot สำเร็จ

        // 1. เริ่มต้น conceptual Hypertac slots (R#C#) ทั้งหมดให้เป็นช่องว่าง
        for (let r = 1; r <= this.rows; r++) {
            for (let c = 1; c <= this.cols; c++) {
                hypertacSlots.push({
                    id: `R${r}C${c}`, // ID เชิงแนวคิด
                    row: r,
                    col: c,
                    isUsed: false,
                    signalName: null,
                    ecuName: null,
                    ecuPin: null, // เริ่มต้น ECU Pin
                    physicalHypertacId: null, // เริ่มต้น Physical Hypertac ID (HE Name-HE Pin)
                    isReused: false,
                    originalRowIndex: undefined,
                });
            }
        }

        let currentSequentialSlotIndex = 0; // ใช้สำหรับการกำหนด slot ตามลำดับหากไม่มีการแมปโดยตรง

        // 2. ประมวลผลสัญญาณจากข้อมูล Excel และกำหนดให้กับ conceptual slots
        for (const [index, signalRow] of excelDataRows.entries()) {
            const signalName = signalRow.signalName?.trim();
            const ecuName = signalRow.ecuName?.trim();
            const ecuPin = signalRow.ecuPin?.trim() || null;
            const heName = signalRow.heName?.trim() || null;
            const hePin = signalRow.hePin?.trim() || null;

            // การตรวจสอบข้อมูลพื้นฐานสำหรับสัญญาณที่จำเป็น
            if (!signalName || !ecuName) {
                console.warn(`Skipping row ${index + 2} due to missing Signalname or ECU Name.`); // +2 สำหรับ index แบบ 1-based และแถวหัวเรื่อง
                continue;
            }

            let physicalHypertacId: string | null = null;
            // สร้าง physical Hypertac ID หากมี HE Name และ HE Pin
            if (heName && hePin) {
                // ถือว่า "spare" เป็นการกำหนด pin ทางกายภาพที่ถูกต้อง
                physicalHypertacId = `${heName}-${hePin}`;
            }

            let targetConceptualSlot: IHypertacSlot | undefined;

            // ค้นหา conceptual slot (R#C#) ที่ว่างถัดไป
            // ในเวอร์ชันนี้ เราไม่ได้แมป physical ID โดยตรงกับ conceptual slot R#C# ที่เฉพาะเจาะจง
            // แต่สัญญาณแต่ละตัวจาก Excel (มีหรือไม่มี physical ID) จะได้รับ conceptual slot R#C# ที่ว่างถัดไป
            // physical ID จะถูกเก็บเป็น metadata ภายใน conceptual slot นั้น
            let foundSequentialSlot = false;
            while (currentSequentialSlotIndex < this.totalSlots) {
                if (!hypertacSlots[currentSequentialSlotIndex].isUsed) {
                    targetConceptualSlot = hypertacSlots[currentSequentialSlotIndex];
                    foundSequentialSlot = true;
                    break;
                }
                currentSequentialSlotIndex++;
            }

            if (!foundSequentialSlot || !targetConceptualSlot) {
                console.warn(`No available conceptual Hypertac slot found for signal "${signalName}". Skipping.`);
                continue; // ไม่มี conceptual slot ว่างเหลือแล้ว
            }

            // กำหนดข้อมูลสัญญาณให้กับ conceptual slot ที่พบ
            targetConceptualSlot.isUsed = true;
            targetConceptualSlot.signalName = signalName;
            targetConceptualSlot.ecuName = ecuName;
            targetConceptualSlot.ecuPin = ecuPin; // กำหนด ECU Pin
            targetConceptualSlot.physicalHypertacId = physicalHypertacId; // กำหนด Physical Hypertac ID
            targetConceptualSlot.originalRowIndex = index;

            // อัปเดตจำนวนการใช้งานสัญญาณ
            signalUsageCount.set(signalName, (signalUsageCount.get(signalName) || 0) + 1);
            assignedSignalNames.add(signalName); // ทำเครื่องหมายสัญญาณว่าถูกกำหนดแล้ว
        }

        // 3. ระบุสัญญาณที่ถูกใช้ซ้ำและคำนวณจำนวนสรุป
        let signalsUsedCount = 0;
        let hypertacEmptySlotsCount = 0;

        for (const slot of hypertacSlots) {
            if (slot.isUsed && slot.signalName) {
                // ทำเครื่องหมาย slot ว่าถูกใช้ซ้ำหากสัญญาณถูกใช้มากกว่าหนึ่งครั้งในการกำหนดทั้งหมด
                if (signalUsageCount.get(slot.signalName)! > 1) {
                    slot.isReused = true;
                }
                signalsUsedCount++;
            } else {
                hypertacEmptySlotsCount++;
            }
        }

        // นับสัญญาณจาก Excel ที่ไม่ถูกกำหนดให้กับ Hypertac slot ใดๆ
        const signalsNotUsedCount = excelDataRows.filter(row => {
            const signalName = row.signalName?.trim();
            return signalName && !assignedSignalNames.has(signalName);
        }).length;


        // ตรวจสอบความสมบูรณ์พื้นฐาน
        if (hypertacSlots.length !== this.totalSlots) {
            throw new AppError('Hypertac slots initialization error. Mismatch in total slots.', 500);
        }

        return {
            hypertacSlots: hypertacSlots,
            signalsUsedCount: signalsUsedCount,
            signalsNotUsedCount: signalsNotUsedCount,
            hypertacEmptySlotsCount: hypertacEmptySlotsCount,
            statusMessage: 'Hypertac simulation complete.',
        };
    }
}
