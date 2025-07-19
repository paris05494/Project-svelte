import { appStore } from '../stores/app-store';
import type { IHypertacVisualizationData } from '../model/Hypertac';

const API_BASE_URL = 'http://localhost:5000/api/v1'; // Base URL สำหรับ backend API ของคุณ

export const apiService = {
  /**
   * อัปโหลดไฟล์ Excel ไปยัง backend เพื่อประมวลผลและแสดงผล
   * @param file อ็อบเจกต์ Excel File ที่จะอัปโหลด
   * @returns Promise ที่ resolve เป็นข้อมูลการแสดงผล Hypertac หรือ null หากเกิดข้อผิดพลาด
   */
  async uploadExcelFile(file: File): Promise<IHypertacVisualizationData | null> {
    try {
      const formData = new FormData();
      formData.append('excelFile', file); // 'excelFile' ต้องตรงกับชื่อฟิลด์ใน multer ที่ตั้งค่าไว้ใน backend

      const response = await fetch(`${API_BASE_URL}/hypertac/upload-excel`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      // สมมติว่า backend ส่ง { status: 'success', data: IHypertacVisualizationData }
      return result.data;

    } catch (error: unknown) {
      let errorMessage = 'Unknown error occurred.';

      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error('API Service Error:', error);
      appStore.setError(`Failed to upload or process file: ${errorMessage}`);
      return null;
    }
  },
};
