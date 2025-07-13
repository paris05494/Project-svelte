/**
 * Custom error class for operational errors in the application.
 * These errors are expected and can be handled gracefully (e.g., sending specific HTTP status codes).
 */
export class AppError extends Error {
    public statusCode: number;
    public status: string;
    public isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message); // เรียกใช้ constructor ของ Error แม่
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'; // กำหนดสถานะตาม status code
        this.isOperational = true; // ทำเครื่องหมายว่าเป็น operational error

        // เก็บ stack trace เพื่อทราบว่าข้อผิดพลาดเกิดขึ้นที่ใด
        Error.captureStackTrace(this, this.constructor);
    }
}