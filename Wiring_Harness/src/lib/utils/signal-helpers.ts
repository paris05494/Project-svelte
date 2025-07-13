import type { IHypertacSlot } from '../types/hypertac';

/**
 * ดึงการเชื่อมต่อ Signal-to-ECU ที่ไม่ซ้ำกันจากรายการ Hypertac slots
 * การเชื่อมต่อแต่ละรายการจะรวม Signal Name, ECU Name, ECU Pin และ Physical Hypertac ID หากมี
 * @param slots อาร์เรย์ของอ็อบเจกต์ IHypertacSlot
 * @returns อาร์เรย์ของสตริงการเชื่อมต่อที่ไม่ซ้ำกัน
 */
export function getUniqueSignalEcuConnections(slots: IHypertacSlot[]): string[] {
  const uniqueConnections = new Set<string>();
  slots.filter(s => s.isUsed).forEach(slot => {
    const connectionString = `${slot.signalName} ➡️ ${slot.ecuName}${slot.ecuPin ? ` (Pin: ${slot.ecuPin})` : ''}${slot.physicalHypertacId ? ` [Hypertac: ${slot.physicalHypertacId}]` : ''}`;
    uniqueConnections.add(connectionString);
  });
  return Array.from(uniqueConnections);
}