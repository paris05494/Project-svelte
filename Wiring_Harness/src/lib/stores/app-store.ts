import { writable } from 'svelte/store';
import type { IHypertacVisualizationData } from '../types/hypertac';

interface AppState {
    isLoading: boolean;
    error: string | null;
    statusMessages: string[];
    visualizationData: IHypertacVisualizationData | null;
    currentFileName: string | null;
}

const initialState: AppState = {
    isLoading: false,
    error: null,
    statusMessages: ['Welcome! Please upload an Excel file.'],
    visualizationData: null,
    currentFileName: null,
};

const { subscribe, set, update } = writable<AppState>(initialState);

const appStore = {
    subscribe,
    /**
     * กำหนดสถานะการโหลดของแอปพลิเคชัน
     * @param loading เป็นจริงหากแอปกำลังโหลด เป็นเท็จในกรณีอื่น
     */
    setLoading: (loading: boolean) => update(state => ({ ...state, isLoading: loading, error: loading ? null : state.error })),
    /**
     * กำหนดข้อความแสดงข้อผิดพลาดสำหรับแอปพลิเคชัน
     * @param errorMessage สตริงข้อความแสดงข้อผิดพลาด หรือ null เพื่อล้าง
     */
    setError: (errorMessage: string | null) => update(state => ({ ...state, error: errorMessage, isLoading: false, statusMessages: [...state.statusMessages, `Error: ${errorMessage}`] })),
    /**
     * เพิ่มข้อความสถานะใหม่ไปยังแผงสถานะ
     * @param message ข้อความสถานะที่จะเพิ่ม
     */
    updateStatus: (message: string) => update(state => ({ ...state, statusMessages: [...state.statusMessages, message].slice(-10)})), // เก็บข้อความ 10 ข้อความล่าสุด

    /**
     * กำหนดข้อมูลการแสดงผล Hypertac หลัก ซึ่งจะแทนที่ข้อมูลที่มีอยู่
     * @param newData ข้อมูลการแสดงผลใหม่ หรือ null เพื่อล้าง
     * @param fileName ชื่อไฟล์ที่สร้างข้อมูลนั้น
     */
    setVisualizationData: (newData: IHypertacVisualizationData | null, fileName: string | null) => {
        update(state => {
            if (newData) {
                return {
                    ...state,
                    visualizationData: newData, // แทนที่ข้อมูลที่มีอยู่ทั้งหมด
                    currentFileName: fileName,
                    error: null, // ล้างข้อผิดพลาดเมื่อโหลดข้อมูลสำเร็จ
                };
            } else {
                // หาก newData เป็น null (เช่น เมื่อล้างไฟล์) ให้รีเซ็ตเป็นสถานะเริ่มต้น
                return { ...initialState, statusMessages: ['File selection cleared.'] };
            }
        });
    },
    reset: () => set(initialState)
};

export { appStore };