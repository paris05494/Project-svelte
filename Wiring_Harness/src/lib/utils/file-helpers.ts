/**
 * กรองรายการไฟล์ใหม่เพื่อรวมเฉพาะไฟล์ที่ยังไม่ได้อยู่ในอาร์เรย์ไฟล์ที่มีอยู่
 * ไฟล์จะถือว่าเป็นไฟล์ซ้ำหากมีชื่อและขนาดเดียวกันกับไฟล์ที่มีอยู่
 * @param existingFiles อาร์เรย์ของอ็อบเจกต์ File ที่เลือกไว้แล้ว
 * @param newFiles อ็อบเจกต์ FileList ที่มีไฟล์ที่เลือกใหม่จาก input
 * @returns อาร์เรย์ของอ็อบเจกต์ File ใหม่ที่ไม่ซ้ำกัน
 */
export function getUniqueNewFiles(existingFiles: File[], newFiles: FileList | null): File[] {
    if (!newFiles) {
        return [];
    }
    const newFilesArray = Array.from(newFiles);
    const uniqueNewFiles = newFilesArray.filter(
        newFile => !existingFiles.some(existingFile => existingFile.name === newFile.name && existingFile.size === newFile.size)
    );
    return uniqueNewFiles;
}