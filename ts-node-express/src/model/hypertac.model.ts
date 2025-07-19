import ExcelJS from 'exceljs';
import type { IHypertacSlot, IHypertacVisualizationData } from '../../../frontend-svelte/src/lib/model/Hypertac';
import { config as backendConfig } from '../../../frontend-svelte/src/backend_config';

export async function processExcelFile(filePath: string): Promise<IHypertacVisualizationData> {
   const workbook = new ExcelJS.Workbook();
   await workbook.xlsx.readFile(filePath);
   const worksheet = workbook.getWorksheet(1);
   if (!worksheet) {
       throw new Error('No worksheet found in the Excel file.');
   }
   const hypertacSlots: IHypertacSlot[] = [];
   const signalUsage: { [signalName: string]: number } = {};
   const signalsFromExcel: Set<string> = new Set();
   const HYPERTAC_ROWS = backendConfig.hypertacConfig.rows;
   const HYPERTAC_COLS = backendConfig.hypertacConfig.cols;
   const TOTAL_CONCEPTUAL_SLOTS = HYPERTAC_ROWS * HYPERTAC_COLS;

   // Helper to get column index by header name (case-insensitive)
   const getColumnIndex = (header: string): number | undefined => {
       let colIndex: number | undefined;
       worksheet.getRow(1).eachCell((cell, colNumber) => {
           if (cell.text.toLowerCase() === header.toLowerCase()) {
               colIndex = colNumber;
               return false; // Stop iterating
           }
       });
       return colIndex;
   };

   const signalNameCol = getColumnIndex('Signalname');
   const ecuNameCol = getColumnIndex('ECU Name');
   const ecuPinCol = getColumnIndex('ECU Pin');
   const heNameCol = getColumnIndex('HE Name');
   const hePinCol = getColumnIndex('HE Pin');

   if (!signalNameCol || !ecuNameCol || !ecuPinCol || !heNameCol || !hePinCol) {
       throw new Error('Missing one or more required columns (Signalname, ECU Name, ECU Pin, HE Name, HE Pin) in the Excel file.');
   }

   // Read data from Excel
   worksheet.eachRow((row, rowNumber) => {
       if (rowNumber === 1) return; // Skip header row

       const signalName = row.getCell(signalNameCol!).text || null;
       const ecuName = row.getCell(ecuNameCol!).text || null;
       const ecuPin = row.getCell(ecuPinCol!).text || null;
       const heName = row.getCell(heNameCol!).text || null;
       const hePin = row.getCell(hePinCol!).text || null;

       if (signalName) {
           signalsFromExcel.add(signalName);
       }

       // Only process rows that have a HE Name and HE Pin, indicating a connection
       if (heName && hePin) {
           const physicalHypertacId = `${heName}-${hePin}`;
           const slotIndex = hypertacSlots.length; // 0-indexed
           const row = Math.floor(slotIndex / HYPERTAC_COLS) + 1; // 1-indexed row
           const col = (slotIndex % HYPERTAC_COLS) + 1; // 1-indexed col

           if (hypertacSlots.length < TOTAL_CONCEPTUAL_SLOTS) {
               const slotId = `R${row}C${col}`;
               const slot: IHypertacSlot = {
                   id: slotId,
                   row: row,
                   col: col,
                   isUsed: true,
                   signalName: signalName,
                   ecuName: ecuName,
                   ecuPin: ecuPin,
                   physicalHypertacId: physicalHypertacId,
                   isReused: false,
                   originalRowIndex: rowNumber - 1, // 0-based index of the original Excel row
               };
               hypertacSlots.push(slot);

               // Track signal usage for reuse detection
               if (signalName) {
                   signalUsage[signalName] = (signalUsage[signalName] || 0) + 1;
               }
           }
       }
   });

   // Post-processing to determine `isReused` and fill empty slots
   const finalHypertacSlots: IHypertacSlot[] = [];
   const usedSignalNames = new Set<string>();

   hypertacSlots.forEach(slot => {
       if (slot.signalName && signalUsage[slot.signalName] > 1) {
           slot.isReused = true;
       }
       if (slot.isUsed && slot.signalName) {
           usedSignalNames.add(slot.signalName);
       }
       finalHypertacSlots.push(slot);
   });

   // Fill remaining conceptual slots as empty
   for (let i = finalHypertacSlots.length; i < TOTAL_CONCEPTUAL_SLOTS; i++) {
       const row = Math.floor(i / HYPERTAC_COLS) + 1;
       const col = (i % HYPERTAC_COLS) + 1;
       finalHypertacSlots.push({
           id: `R${row}C${col}`,
           row: row,
           col: col,
           isUsed: false,
           signalName: null,
           ecuName: null,
           ecuPin: null,
           physicalHypertacId: null,
           isReused: false,
       });
   }

   // Calculate counts
   const signalsUsedCount = usedSignalNames.size;
   const signalsNotUsedCount = signalsFromExcel.size - signalsUsedCount;
   const hypertacEmptySlotsCount = TOTAL_CONCEPTUAL_SLOTS - hypertacSlots.length; // This should be total conceptual - *used* slots, not finalHypertacSlots.length (which includes empty ones)

   return {
       hypertacSlots: finalHypertacSlots,
       signalsUsedCount: signalsUsedCount,
       signalsNotUsedCount: signalsNotUsedCount,
       hypertacEmptySlotsCount: hypertacEmptySlotsCount,
       statusMessage: `Processed Excel file with ${signalsUsedCount} signals used and ${hypertacEmptySlotsCount} empty slots.`,
   };
}