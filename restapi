restapi/package.json
{
  "name": "restapi-backend",
  "version": "1.0.0",
  "description": "REST API Backend for Hypertac visualization processing",
  "main": "dist/index.js",
  "scripts": {
    "start": "node dist/index.js",
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix"
  },
  "keywords": [],
  "author": "Senior Engineer",
  "license": "MIT",
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/node": "^20.14.9",
    "@typescript-eslint/eslint-plugin": "^7.15.0",
    "@typescript-eslint/parser": "^7.15.0",
    "eslint": "^8.57.0",
    "nodemon": "^3.1.4",
    "ts-node": "^10.9.2",
    "typescript": "^5.5.3"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.19.2",
    "dotenv": "^16.4.5"
  }
}

restapi/tsconfig.json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "CommonJS",
    "lib": ["es2022", "dom"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "noEmitOnError": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules"]
}

restapi/.env
PORT=5000
NODE_ENV=development

restapi/src/index.ts
const app = require('./restapi');
const config = require('./config');

const port = config.port;

const server = app.listen(port, () => {
  console.log(`REST API Server running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
});

// จัดการ Unhandled Promise Rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// จัดการ Uncaught Exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

restapi/src/restapi.ts
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { errorHandler } = require('./middlewares/error-handler');
const { AppError } = require('./utils/app-error');

const app = express();

// เปิดใช้งาน CORS สำหรับทุก Origin (สำหรับการพัฒนา)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parser, อ่านข้อมูลจาก body เข้าสู่ req.body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API routes
app.use('/api/v1', routes);

// จัดการเส้นทางที่ไม่รู้จัก
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Middleware จัดการข้อผิดพลาดทั่วโลก
app.use(errorHandler);

module.exports = app;

restapi/src/application/excel-hypertac.service.ts
const { HypertacService } = require('../domain/hypertac.service');
const { AppError } = require('../utils/app-error');

class ExcelHypertacService {
  constructor() {
    this.hypertacService = new HypertacService();
  }

  /**
   * Processes parsed Excel data to generate Hypertac visualization data.
   * This method orchestrates the Hypertac simulation.
   * @param excelData The parsed Excel data (array of IExcelSignalRow).
   * @returns A promise that resolves to the Hypertac visualization data.
   * @throws AppError if processing fails or no valid signals are mapped.
   */
  async processParsedExcelData(excelData) {
    try {
      // Simulate mapping
      const visualizationData = this.hypertacService.generateHypertacVisualization(excelData);

      // ตรวจสอบความสมเหตุสมผลของโปรแกรม
      if (excelData.length > 0 && visualizationData.signalsUsedCount === 0) {
          throw new AppError('No signals could be successfully mapped to Hypertac slots from the provided Excel data. Please check Excel format and data.', 400);
      }

      return visualizationData;

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Error in ExcelHypertacService:', error);
      throw new AppError(`Failed to process parsed Excel data for Hypertac visualization: ${error.message || 'Unknown error'}`, 500);
    }
  }
}

module.exports = { ExcelHypertacService };

restapi/src/config/index.ts
require('dotenv').config();

const config = {
  port: process.env.PORT || 5000,
  hypertacConfig: {
    rows: 5, // จำนวนแถวใน Hypertac grid เชิงแนวคิด (อัปเดตเป็น 5)
    cols: 18, // จำนวนคอลัมน์ใน Hypertac grid เชิงแนวคิด (อัปเดตเป็น 18)
    totalSlots: 90 // rows * cols (อัปเดตเป็น 5 * 18 = 90)
  }
};

module.exports = config;

restapi/src/domain/hypertac.service.ts
const config = require('../config');
const { AppError } = require('../utils/app-error');

class HypertacService {
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
  generateHypertacVisualization(
    excelDataRows
  ) {
    const hypertacSlots = [];
    const signalUsageCount = new Map(); // Stores SignalName -> count of times used
    const assignedSignalNames = new Set(); // Stores names of signals successfully assigned to a slot

    // 1. Initialize all conceptual Hypertac slots (R#C#) as empty
    for (let r = 1; r <= this.rows; r++) {
      for (let c = 1; c <= this.cols; c++) {
        hypertacSlots.push({
          id: `R${r}C${c}`, // Conceptual ID
          row: r,
          col: c,
          isUsed: false,
          signalName: null,
          ecuName: null,
          ecuPin: null, // Initialize ECU Pin
          physicalHypertacId: null, // Initialize Physical Hypertac ID (HE Name-HE Pin)
          isReused: false,
          originalRowIndex: undefined,
        });
      }
    }

    let currentSequentialSlotIndex = 0; // Used for sequential slot assignment if no direct mapping

    // 2. Process signals from Excel data and assign them to conceptual slots
    for (const [index, signalRow] of excelDataRows.entries()) {
      const signalName = signalRow.signalName ? signalRow.signalName.trim() : null;
      const ecuName = signalRow.ecuName ? signalRow.ecuName.trim() : null;
      const ecuPin = signalRow.ecuPin ? signalRow.ecuPin.trim() : null;
      const heName = signalRow.heName ? signalRow.heName.trim() : null;
      const hePin = signalRow.hePin ? signalRow.hePin.trim() : null;

      // Basic validation for essential signal data
      if (!signalName || !ecuName) {
        console.warn(`Skipping row ${index + 2} due to missing Signalname or ECU Name.`); // +2 for 1-based index and header row
        continue;
      }

      let physicalHypertacId = null;
      // Construct physical Hypertac ID if HE Name and HE Pin are present
      if (heName && hePin) {
          // Treat "spare" as a valid physical designation for a pin
          physicalHypertacId = `${heName}-${hePin}`;
      }

      let targetConceptualSlot;

      // Find the next available conceptual slot (R#C#)
      // In this version, we are not directly mapping physical IDs to specific R#C# conceptual slots.
      // Instead, each signal from Excel (with or without physical ID) gets the next available R#C# slot.
      // The physical ID is stored as metadata within that conceptual slot.
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
          continue; // No more empty conceptual slots
      }

      // Assign the signal data to the found conceptual slot
      targetConceptualSlot.isUsed = true;
      targetConceptualSlot.signalName = signalName;
      targetConceptualSlot.ecuName = ecuName;
      targetConceptualSlot.ecuPin = ecuPin; // Assign ECU Pin
      targetConceptualSlot.physicalHypertacId = physicalHypertacId; // Assign Physical Hypertac ID
      targetConceptualSlot.originalRowIndex = index;

      // Update signal usage counts
      signalUsageCount.set(signalName, (signalUsageCount.get(signalName) || 0) + 1);
      assignedSignalNames.add(signalName); // Mark signal as assigned
    }

    // 3. Identify reused signals and calculate summary counts
    let signalsUsedCount = 0;
    let hypertacEmptySlotsCount = 0;

    for (const slot of hypertacSlots) {
      if (slot.isUsed && slot.signalName) {
        // Mark slot as reused if the signal is used more than once across all assignments
        if (signalUsageCount.get(slot.signalName) > 1) {
          slot.isReused = true;
        }
        signalsUsedCount++;
      } else {
        hypertacEmptySlotsCount++;
      }
    }

    // Count signals from Excel that were not assigned to any Hypertac slot
    const signalsNotUsedCount = excelDataRows.filter(row => {
        const signalName = row.signalName ? row.signalName.trim() : null;
        return signalName && !assignedSignalNames.has(signalName);
    }).length;


    // Basic sanity check
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

module.exports = { HypertacService };

restapi/src/model/excel.interface.ts
// This file defines the structure of a row parsed from the Excel file.
// In CommonJS, we define interfaces as JSDoc or simply rely on runtime object shapes.
// For TypeScript compilation, we can still use interfaces, but they won't exist at runtime.

/**
 * @typedef {object} IExcelSignalRow
 * @property {string} signalName - The name of the signal.
 * @property {string} ecuName - The name of the ECU.
 * @property {string | null} [ecuPin] - The pin on the ECU, optional.
 * @property {string | null} [heName] - The Hypertac Element name, optional.
 * @property {string | null} [hePin] - The Hypertac Element pin, optional.
 */

restapi/src/model/hypertac.interface.ts
// This file defines the data structures for Hypertac visualization.
// In CommonJS, we define interfaces as JSDoc or simply rely on runtime object shapes.

/**
 * @typedef {object} IHypertacSlot
 * @property {string} id - Conceptual ID (e.g., "R1C1").
 * @property {number} row - Row number.
 * @property {number} col - Column number.
 * @property {boolean} isUsed - True if the slot is used.
 * @property {string | null} signalName - The signal name assigned to this slot.
 * @property {string | null} ecuName - The ECU name associated with the signal.
 * @property {string | null} ecuPin - The ECU pin associated with the signal.
 * @property {string | null} physicalHypertacId - Physical Hypertac ID (e.g., "HYP01_05_02-A01").
 * @property {boolean} isReused - True if the signal in this slot is reused across multiple slots.
 * @property {number | undefined} [originalRowIndex] - Original 0-based row index from Excel data.
 */

/**
 * @typedef {object} IHypertacVisualizationData
 * @property {IHypertacSlot[]} hypertacSlots - Array of all Hypertac slots.
 * @property {number} signalsUsedCount - Count of unique signals assigned to slots.
 * @property {number} signalsNotUsedCount - Count of signals from Excel not assigned to any slot.
 * @property {number} hypertacEmptySlotsCount - Count of empty conceptual Hypertac slots.
 * @property {string} statusMessage - A status message regarding the simulation.
 */

restapi/src/middlewares/error-handler.ts
const { AppError } = require('../utils/app-error');

/**
 * Custom error class for operational errors in the application.
 * These errors are expected and can be handled gracefully (e.g., sending specific HTTP status codes).
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    console.error('ERROR 💥', err);
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  } else {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      console.error('ERROR 💥', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went very wrong!',
      });
    }
  }
};

module.exports = { errorHandler };

restapi/src/controller/hypertac.controller.ts
const { ExcelHypertacService } = require('../application/excel-hypertac.service');
const { AppError } = require('../utils/app-error');

class HypertacController {
  constructor() {
    this.excelHypertacService = new ExcelHypertacService();
  }

  /**
   * Handles the request to visualize Hypertac data.
   * Expects parsed Excel data in req.body.
   * @param req Express Request object. Expects 'excelData' in req.body.
   * @param res Express Response object.
   * @param next Express NextFunction for error handling.
   */
  processHypertacData = async (req, res, next) => {
    try {
      const { excelData } = req.body;

      if (!excelData || !Array.isArray(excelData)) {
        return next(new AppError('Invalid or missing Excel data in request body.', 400));
      }

      // มอบหมายให้ service แอปพลิเคชันประมวลผลข้อมูล Excel ที่ถูก parse แล้ว
      const visualizationData = await this.excelHypertacService.processParsedExcelData(excelData);

      res.status(200).json({
        status: 'success',
        data: visualizationData,
      });

    } catch (error) {
      // ส่งข้อผิดพลาดที่ตรวจพบไปยัง middleware จัดการข้อผิดพลาดทั่วโลก
      next(error);
    }
  };
}

module.exports = { HypertacController };

restapi/src/routes/hypertac.routes.ts
const express = require('express');
const { HypertacController } = require('../controller/hypertac.controller');

const router = express.Router();
const hypertacController = new HypertacController();

// กำหนดเส้นทางสำหรับการประมวลผลข้อมูล Hypertac ที่ถูก parse แล้ว
router.post(
  '/process-data',
  hypertacController.processHypertacData
);

module.exports = router;

restapi/src/routes/index.ts
const express = require('express');
const hypertacRoutes = require('./hypertac.routes');

const router = express.Router();

// เมาท์เส้นทางที่เกี่ยวข้องกับ Hypertac ภายใต้พาธ '/hypertac'
router.use('/hypertac', hypertacRoutes);

module.exports = router;

restapi/src/utils/app-error.ts
/**
 * Custom error class for operational errors in the application.
 * These errors are expected and can be handled gracefully (e.g., sending specific HTTP status codes).
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // เรียกใช้ constructor ของ Error แม่
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'; // กำหนดสถานะตาม status code
    this.isOperational = true; // ทำเครื่องหมายว่าเป็น operational error

    // เก็บ stack trace เพื่อทราบว่าข้อผิดพลาดเกิดขึ้นที่ใด
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { AppError };

restapi/docs/
(สร้างโฟลเดอร์นี้ไว้สำหรับเก็บเอกสารประกอบ Endpoint APIs)

ส่วนที่ 2: Backend - File Server (fileserver/)
หน้าที่: รับไฟล์ Excel ที่อัปโหลด, Parse ไฟล์, และส่งข้อมูลที่ Parse แล้วไปยัง restapi/ เพื่อประมวลผลต่อ

fileserver/package.json
{
  "name": "fileserver-backend",
  "version": "1.0.0",
  "description": "File Server Backend for Excel uploads and processing",
  "main": "dist/index.js",
  "scripts": {
    "start": "node dist/index.js",
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix"
  },
  "keywords": [],
  "author": "Senior Engineer",
  "license": "MIT",
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/multer": "^1.4.11",
    "@types/node": "^20.14.9",
    "@typescript-eslint/eslint-plugin": "^7.15.0",
    "@typescript-eslint/parser": "^7.15.0",
    "eslint": "^8.57.0",
    "nodemon": "^3.1.4",
    "ts-node": "^10.9.2",
    "typescript": "^5.5.3"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "exceljs": "^4.4.0",
    "express": "^4.19.2",
    "multer": "^1.4.5-lts.1",
    "dotenv": "^16.4.5",
    "node-fetch": "^2.6.1"
  }
}

fileserver/tsconfig.json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "CommonJS",
    "lib": ["es2022", "dom"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "noEmitOnError": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules"]
}

fileserver/.env
PORT=5001
EXCEL_UPLOAD_PATH=./uploads
RESTAPI_BASE_URL=http://localhost:5000/api/v1
NODE_ENV=development

fileserver/src/index.ts
const app = require('./fileserver');
const config = require('./config');
const path = require('path');
const fs = require('fs');

const port = config.port;
const uploadDir = path.resolve(config.excelUploadPath);

// ตรวจสอบและสร้าง directory สำหรับอัปโหลดหากยังไม่มี
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Created upload directory: ${uploadDir}`);
}

const server = app.listen(port, () => {
  console.log(`File Server running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
});

// จัดการ Unhandled Promise Rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// จัดการ Uncaught Exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

fileserver/src/fileserver.ts
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { errorHandler } = require('./middlewares/error-handler');
const { AppError } = require('./utils/app-error');

const app = express();

// เปิดใช้งาน CORS สำหรับทุก Origin (สำหรับการพัฒนา)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parser, อ่านข้อมูลจาก body เข้าสู่ req.body (สำหรับ JSON payload ที่อาจมี)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API routes
app.use('/api/v1', routes);

// จัดการเส้นทางที่ไม่รู้จัก
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Middleware จัดการข้อผิดพลาดทั่วโลก
app.use(errorHandler);

module.exports = app;

fileserver/src/controller/file.controller.ts
const fetch = require('node-fetch'); // สำหรับการเรียก REST API
const { ExcelParser } = require('../infrastructure/file-processing/excel-parser');
const { AppError } = require('../utils/app-error');
const config = require('../config');
const fs = require('fs/promises');

class FileController {
  constructor() {
    this.excelParser = new ExcelParser();
    this.restApiBaseUrl = config.restApiBaseUrl;
  }

  /**
   * Handles Excel file upload, parses it, and sends the parsed data to the REST API for visualization.
   * @param req Express Request object. Expects an 'excelFile' in req.file.
   * @param res Express Response object.
   * @param next Express NextFunction for error handling.
   */
  uploadExcelAndProcess = async (req, res, next) => {
    let filePath = null;
    try {
      if (!req.file) {
        return next(new AppError('No Excel file uploaded.', 400));
      }

      filePath = req.file.path;
      console.log(`File Server: Received file: ${filePath}`);

      // 1. Parse Excel data
      const excelData = await this.excelParser.parse(filePath);
      console.log(`File Server: Successfully parsed Excel file. Rows: ${excelData.length}`);

      // 2. Send parsed data to REST API for processing
      const response = await fetch(`${this.restApiBaseUrl}/hypertac/process-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ excelData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new AppError(errorData.message || `REST API error! Status: ${response.status}`, response.status);
      }

      const result = await response.json();
      console.log('File Server: Received visualization data from REST API.');

      res.status(200).json({
        status: 'success',
        data: result.data, // ส่งข้อมูล visualization กลับไปให้ frontend
      });

    } catch (error) {
      console.error('File Server Error:', error);
      next(error);
    } finally {
      // Clean up the uploaded file
      if (filePath) {
        try {
          await fs.unlink(filePath);
          console.log(`File Server: Cleaned up uploaded file: ${filePath}`);
        } catch (unlinkError) {
          console.error(`File Server: Failed to delete temporary file ${filePath}:`, unlinkError);
        }
      }
    }
  };
}

module.exports = { FileController };

fileserver/src/config/index.ts
require('dotenv').config();

const config = {
  port: process.env.PORT || 5001, // Port for the file server
  excelUploadPath: process.env.EXCEL_UPLOAD_PATH || './uploads', // Directory for uploaded files
  restApiBaseUrl: process.env.RESTAPI_BASE_URL || 'http://localhost:5000/api/v1', // URL of the REST API
};

module.exports = config;

fileserver/src/infrastructure/file-processing/excel-parser.ts
const ExcelJS = require('exceljs');
const { AppError } = require('../../utils/app-error');

class ExcelParser {
  /**
   * Parses an Excel file to extract signal data.
   * It expects specific column headers: 'Signalname', 'ECU Name', 'ECU Pin', 'HE Name', 'HE Pin'.
   * @param filePath The path to the Excel file.
   * @returns A promise that resolves to an array of IExcelSignalRow.
   * @throws AppError if the file is invalid, empty, or missing required headers.
   */
  async parse(filePath) {
    const workbook = new ExcelJS.Workbook();
    try {
      await workbook.xlsx.readFile(filePath);
      const worksheet = workbook.getWorksheet(1); // อ่าน worksheet แรก

      if (!worksheet) {
        throw new AppError('No worksheet found in the Excel file.', 400);
      }

      const rows = [];
      const headerRow = worksheet.getRow(1);
      if (!headerRow || !headerRow.values || headerRow.values.length === 0) {
        throw new AppError('Excel file is empty or has no headers.', 400);
      }

      // แมปชื่อหัวข้อคอลัมน์กับชื่อ property ภายในสำหรับ IExcelSignalRow
      const headerMap = {
        'Signalname': 'signalName',
        'ECU Name': 'ecuName',
        'ECU Pin': 'ecuPin',
        'HE Name': 'heName',
        'HE Pin': 'hePin',
      };

      // รับหัวข้อจริงจากไฟล์ Excel และแมป
      const actualHeaders = headerRow.values.map(v => {
        if (typeof v === 'object' && 'text' in v) return String(v.text).trim();
        return String(v).trim();
      });

      const mappedColumnIndices = {};
      actualHeaders.forEach((header, index) => {
        const mappedKey = headerMap[header];
        if (mappedKey) {
          mappedColumnIndices[mappedKey] = index + 1; // คอลัมน์ ExcelJS เป็น 1-indexed
        }
      });

      // ตรวจสอบคอลัมน์ที่บังคับ
      const mandatoryHeaders = ['signalName', 'ecuName'];
      for (const mandatoryHeader of mandatoryHeaders) {
        if (mappedColumnIndices[mandatoryHeader] === undefined) {
          throw new AppError(`Missing mandatory column: "${Object.keys(headerMap).find(key => headerMap[key] === mandatoryHeader)}" in Excel file.`, 400);
        }
      }

      // วนซ้ำแถว โดยเริ่มจากแถวที่สอง (หลังจากหัวข้อ)
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // ข้ามแถวหัวข้อ

        const rowData = {};
        let hasSignalName = false;
        let hasEcuName = false;

        for (const key in mappedColumnIndices) {
          if (Object.prototype.hasOwnProperty.call(mappedColumnIndices, key)) {
            const colIndex = mappedColumnIndices[key];
            if (colIndex !== undefined) {
              const cellValue = row.getCell(colIndex).value;
              const stringValue = cellValue ? String(cellValue).trim() : null;
              rowData[key] = stringValue;

              if (key === 'signalName' && stringValue) hasSignalName = true;
              if (key === 'ecuName' && stringValue) hasEcuName = true;
            }
          }
        }

        // เพิ่มแถวเฉพาะเมื่อมีฟิลด์ที่บังคับครบ
        if (hasSignalName && hasEcuName) {
          rows.push(rowData);
        } else {
          console.warn(`Skipping row ${rowNumber} due to missing mandatory data (Signalname or ECU Name).`);
        }
      });

      if (rows.length === 0) {
        throw new AppError('No valid signal data found in the Excel file after parsing. Ensure required columns are present and data is not empty.', 400);
      }

      return rows;

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Error parsing Excel file:', error);
      throw new AppError(`Failed to parse Excel file: ${error.message || 'Unknown error'}`, 500);
    }
  }
}

module.exports = { ExcelParser };

fileserver/src/model/excel.interface.ts
// This file defines the structure of a row parsed from the Excel file.
// In CommonJS, we define interfaces as JSDoc or simply rely on runtime object shapes.

/**
 * @typedef {object} IExcelSignalRow
 * @property {string} signalName - The name of the signal.
 * @property {string} ecuName - The name of the ECU.
 * @property {string | null} [ecuPin] - The pin on the ECU, optional.
 * @property {string | null} [heName] - The Hypertac Element name, optional.
 * @property {string | null} [hePin] - The Hypertac Element pin, optional.
 */

fileserver/src/model/hypertac.interface.ts
// This file defines the data structures for Hypertac visualization.
// In CommonJS, we define interfaces as JSDoc or simply rely on runtime object shapes.
// This is a copy from restapi/src/model/hypertac.interface.ts for type consistency.

/**
 * @typedef {object} IHypertacSlot
 * @property {string} id - Conceptual ID (e.g., "R1C1").
 * @property {number} row - Row number.
 * @property {number} col - Column number.
 * @property {boolean} isUsed - True if the slot is used.
 * @property {string | null} signalName - The signal name assigned to this slot.
 * @property {string | null} ecuName - The ECU name associated with the signal.
 * @property {string | null} ecuPin - The ECU pin associated with the signal.
 * @property {string | null} physicalHypertacId - Physical Hypertac ID (e.g., "HYP01_05_02-A01").
 * @property {boolean} isReused - True if the signal in this slot is reused across multiple slots.
 * @property {number | undefined} [originalRowIndex] - Original 0-based row index from Excel data.
 */

/**
 * @typedef {object} IHypertacVisualizationData
 * @property {IHypertacSlot[]} hypertacSlots - Array of all Hypertac slots.
 * @property {number} signalsUsedCount - Count of unique signals assigned to slots.
 * @property {number} signalsNotUsedCount - Count of signals from Excel not assigned to any slot.
 * @property {number} hypertacEmptySlotsCount - Count of empty conceptual Hypertac slots.
 * @property {string} statusMessage - A status message regarding the simulation.
 */

fileserver/src/middlewares/error-handler.ts
const { AppError } = require('../utils/app-error');

/**
 * Custom error class for operational errors in the application.
 * These errors are expected and can be handled gracefully (e.g., sending specific HTTP status codes).
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    console.error('ERROR 💥', err);
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  } else {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      console.error('ERROR 💥', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went very wrong!',
      });
    }
  }
};

module.exports = { errorHandler };

fileserver/src/routes/file.routes.ts
const express = require('express');
const multer = require('multer');
const { FileController } = require('../controller/file.controller');
const config = require('../config');
const path = require('path');
const fs = require('fs');

// ตรวจสอบให้แน่ใจว่า directory สำหรับอัปโหลดมีอยู่
const uploadDir = path.resolve(config.excelUploadPath);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// กำหนดค่า Multer สำหรับการอัปโหลดไฟล์
const upload = multer({
  dest: uploadDir, // directory ปลายทางสำหรับไฟล์ที่อัปโหลด
  fileFilter: (req, file, cb) => {
    // กรองเพื่อให้เฉพาะไฟล์ Excel เท่านั้น
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || // .xlsx
        file.mimetype === 'application/vnd.ms-excel') { // .xls
      cb(null, true); // ยอมรับไฟล์
    } else {
      cb(new Error('Invalid file type, only Excel files (xlsx, xls) are allowed!'), false); // ปฏิเสธไฟล์
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // จำกัดขนาดไฟล์ที่ 5MB
  },
});

const router = express.Router();
const fileController = new FileController();

// กำหนดเส้นทางสำหรับการอัปโหลดไฟล์ Excel
router.post(
  '/upload-excel',
  upload.single('excelFile'), // 'excelFile' คือชื่อของฟิลด์ฟอร์มที่ส่งไฟล์มา
  fileController.uploadExcelAndProcess
);

module.exports = router;

fileserver/src/routes/index.ts
const express = require('express');
const fileRoutes = require('./file.routes');

const router = express.Router();

// เมาท์เส้นทางที่เกี่ยวข้องกับไฟล์ภายใต้พาธ '/files'
router.use('/files', fileRoutes);

module.exports = router;

fileserver/src/utils/app-error.ts
/**
 * Custom error class for operational errors in the application.
 * These errors are expected and can be handled gracefully (e.g., sending specific HTTP status codes).
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // เรียกใช้ constructor ของ Error แม่
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'; // กำหนดสถานะตาม status code
    this.isOperational = true; // ทำเครื่องหมายว่าเป็น operational error

    // เก็บ stack trace เพื่อทราบว่าข้อผิดพลาดเกิดขึ้นที่ใด
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { AppError };

ส่วนที่ 3: Frontend (hypertac-frontend)
hypertac-frontend/package.json
{
  "name": "hypertac-frontend",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
    "check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
    "lint": "prettier --check . && eslint .",
    "format": "prettier --write ."
  },
  "devDependencies": {
    "@sveltejs/adapter-auto": "^3.0.0",
    "@sveltejs/kit": "^2.0.0",
    "@sveltejs/vite-plugin-svelte": "^3.0.0",
    "@types/eslint": "^8.56.7",
    "@typescript-eslint/eslint-plugin": "^7.15.0",
    "@typescript-eslint/parser": "^7.15.0",
    "autoprefixer": "^10.4.19",
    "eslint": "^8.57.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-svelte": "^2.36.0",
    "postcss": "^8.4.38",
    "prettier": "^3.2.5",
    "prettier-plugin-svelte": "^3.1.2",
    "svelte": "^4.2.17",
    "svelte-check": "^3.6.0",
    "tailwindcss": "^3.4.4",
    "tslib": "^2.4.1",
    "typescript": "^5.0.0",
    "vite": "^5.0.11"
  },
  "type": "module",
  "dependencies": {
    "flowbite-svelte": "^0.46.1",
    "flowbite": "^2.4.1"
  }
}

hypertac-frontend/tsconfig.json
{
	"extends": "./.svelte-kit/tsconfig.json",
	"compilerOptions": {
		"allowJs": true,
		"checkJs": true,
		"esModuleInterop": true,
		"forceConsistentCasingInFileNames": true,
		"resolveJsonModule": true,
		"skipLibCheck": true,
		"sourceMap": true,
		"strict": true,
		"paths": {
			"$lib": ["./src/lib"],
			"$lib/*": ["./src/lib/*"]
		}
	}
}

hypertac-frontend/svelte.config.js
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto attempts to integrate with your deployment environment.
		// If you're not using a platform from the list below, remove this line and
		// install an adapter suitable for your deployment environment.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter()
	}
};

export default config;

hypertac-frontend/tailwind.config.cjs
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,js,svelte,ts}',
    './node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}'
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('flowbite/plugin')
  ],
};

hypertac-frontend/backend_config.ts
// hypertac-frontend/backend_config.ts
// นี่คือการกำหนดค่าจำลองสำหรับ frontend
// ในแอปพลิเคชันจริง ขนาด Hypertac อาจถูกดึงมาจาก API ของ backend
export const config = {
    hypertacConfig: {
      rows: 5, // อัปเดตเป็น 5
      cols: 18, // อัปเดตเป็น 18
      totalSlots: 90 // rows * cols (อัปเดตเป็น 5 * 18 = 90)
    },
    fileServerBaseUrl: 'http://localhost:5001/api/v1' // เพิ่ม URL ของ File Server
  };

hypertac-frontend/src/app.css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* กำหนดตัวแปร CSS ที่กำหนดเองสำหรับสีธีม */
:root {
  --color-primary-green: #059669; /* Emerald 600 */
  --color-primary-green-light: #D1FAE5; /* Emerald 100 */
  --color-secondary-purple: #7C3AED; /* Violet 600 */
  --color-secondary-purple-light: #EDE9FE; /* Violet 100 */
  --color-neutral-white: #FFFFFF;
  --color-neutral-light-gray: #F3F4F6; /* Gray 100 */
  --color-text-dark: #1F2937; /* Gray 800 */
  --color-text-light: #FFFFFF;
  --color-slot-used: #D1FAE5; /* Emerald 100 */
  --color-slot-used-text: #065F46; /* Emerald 900 */
  --color-slot-empty: #E5E7EB; /* Gray 200 */
  --color-slot-empty-text: #6B7280; /* Gray 500 */
  --color-slot-reused: #FCA5A5; /* Red 300 */
  --color-slot-reused-text: #7F1D1D; /* Red 900 */
}

body {
  @apply bg-[var(--color-neutral-light-gray)] text-[var(--color-text-dark)] font-sans;
}

/* สไตล์แผงทั่วไป */
.panel {
  @apply bg-[var(--color-neutral-white)] p-4 rounded-lg shadow-md h-full flex flex-col;
}

.scrollable-content {
  @apply overflow-y-auto;
}

/* สไตล์เฉพาะ Hypertac grid */
.hypertac-grid {
  display: grid;
  /* ใช้ CSS Custom Properties สำหรับจำนวนคอลัมน์และแถวแบบไดนามิก */
  grid-template-columns: repeat(var(--hypertac-cols), minmax(0, 1fr));
  grid-template-rows: repeat(var(--hypertac-rows), minmax(0, 1fr));
  gap: 2px;
  border: 1px solid #ccc;
  padding: 5px;
  background-color: #f0f0f0;
  flex-grow: 1; /* อนุญาตให้ grid เติมเต็มพื้นที่ว่าง */
}

.hypertac-slot {
  @apply flex items-center justify-center p-1 border text-xs font-mono rounded-sm;
  aspect-ratio: 1 / 1; /* ตรวจสอบให้แน่ใจว่า slot เป็นสี่เหลี่ยมจัตุรัส */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  background-color: var(--color-slot-empty); /* พื้นหลัง slot ว่างเริ่มต้น */
  color: var(--color-slot-empty-text); /* ข้อความ slot ว่างเริ่มต้น */
  border-color: #D1D5DB; /* Gray 300 */
  cursor: help; /* ระบุว่ามีข้อมูลเพิ่มเติมเมื่อวางเมาส์เหนือ */
}

.hypertac-slot.used {
  background-color: var(--color-slot-used);
  color: var(--color-slot-used-text);
  border-color: var(--color-primary-green);
}

.hypertac-slot.empty {
  background-color: var(--color-slot-empty);
  color: var(--color-slot-empty-text);
  border-color: #D1D5DB; /* Gray 300 */
}

.hypertac-slot.reused {
  background-color: var(--color-slot-reused);
  color: var(--color-slot-reused-text);
  border-color: var(--color-slot-reused-text);
  animation: pulse-red 1.5s infinite; /* แอนิเมชันกระพริบสำหรับสัญญาณที่ใช้ซ้ำ */
}

@keyframes pulse-red {
  0% { box-shadow: 0 0 0 0 rgba(252, 165, 165, 0.7); } /* Red 300 พร้อมความทึบ */
  70% { box-shadow: 0 0 0 5px rgba(252, 165, 165, 0); }
  100% { box-shadow: 0 0 0 0 rgba(252, 165, 165, 0); }
}

/* การปรับแต่ง Responsive */
@media (max-width: 767px) { /* สำหรับหน้าจอที่เล็กกว่า md (768px) */
  .md\:grid {
    display: flex; /* ซ้อนคอลัมน์ในแนวตั้ง */
    flex-direction: column;
  }
  .md\:col-span-3, .md\:col-span-6 {
    width: 100%; /* ความกว้างเต็มสำหรับทุกคอลัมน์ */
  }
  .min-h-\[calc\(100vh-120px\)\] {
    min-height: auto; /* ลบ min-height ที่กำหนดไว้สำหรับหน้าจอขนาดเล็ก */
  }
}

hypertac-frontend/src/lib/components/ExcelFileSelector.svelte
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { appStore, updateStatus, setLoading, setError, setVisualizationData } from '../stores/app-store';
  import { apiService } from '../services/api.service';
  import { Button } from 'flowbite-svelte';
  import { getUniqueNewFiles } from '../utils/file-helpers'; // Import the helper function

  const dispatch = createEventDispatcher();

  let fileInputRef: HTMLInputElement | null = null; // อ้างอิงถึง input ไฟล์ที่ซ่อนอยู่จริง
  let selectedFiles: File[] = []; // อาร์เรย์สำหรับเก็บไฟล์ที่เลือกทั้งหมด
  let fileToVisualize: File | null = null; // ไฟล์เดียวที่เลือกเพื่อแสดงผล

  /**
   * จัดการเหตุการณ์การเปลี่ยนแปลงจาก input ไฟล์ที่ซ่อนอยู่
   * เพิ่มไฟล์ที่เลือกใหม่ลงในอาร์เรย์ `selectedFiles` โดยหลีกเลี่ยงไฟล์ซ้ำ
   * @param event เหตุการณ์การเปลี่ยนแปลงจาก input ไฟล์
   */
  function handleFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const uniqueNewFiles = getUniqueNewFiles(selectedFiles, input.files); // ใช้ฟังก์ชัน helper
    
    if (uniqueNewFiles.length > 0) {
      selectedFiles = [...selectedFiles, ...uniqueNewFiles];
      updateStatus(`Added ${uniqueNewFiles.length} new file(s) to selection.`);
    }
    // รีเซ็ตค่าของ input เพื่อให้สามารถเลือกไฟล์เดิมซ้ำได้หากจำเป็น
    input.value = '';
  }

  /**
   * กำหนดไฟล์ที่ระบุให้เป็นไฟล์ที่จะแสดงผล
   * @param file อ็อบเจกต์ File ที่จะกำหนดสำหรับการแสดงผล
   */
  function selectFileForVisualization(file: File) {
    console.log('File selected for visualization:', file.name); // บันทึกการดีบัก
    fileToVisualize = file;
    updateStatus(`Selected file for visualization: ${file.name}`);
    setError(null); // ล้างข้อผิดพลาดก่อนหน้าเมื่อเลือกไฟล์ใหม่
  }

  /**
   * จัดการกระบวนการแสดงผลสำหรับไฟล์ที่เลือกในปัจจุบัน
   * อัปโหลดไฟล์ไปยัง backend และอัปเดตข้อมูลการแสดงผลใน store
   */
  async function handleVisualizeSelectedFile() {
    if (!fileToVisualize) {
      setError('Please select a file from the list to visualize.');
      return;
    }

    setLoading(true);
    updateStatus(`Visualizing file: ${fileToVisualize.name}...`);
    setError(null); // ล้างข้อผิดพลาดก่อนหน้า

    // เรียกใช้ apiService เพื่ออัปโหลดไฟล์ไปยัง File Server
    const data = await apiService.uploadExcelFile(fileToVisualize);

    if (data) {
      setVisualizationData(data, fileToVisualize.name);
      updateStatus(`Successfully visualized: ${fileToVisualize.name}`);
    } else {
      updateStatus(`Failed to visualize ${fileToVisualize.name}. Please check errors.`);
    }
    setLoading(false);
  }

  /**
   * ล้างไฟล์ที่เลือกทั้งหมดและรีเซ็ตข้อมูลการแสดงผล
   */
  function clearAllFiles() {
    selectedFiles = [];
    fileToVisualize = null; // ล้างไฟล์ที่เลือกเพื่อแสดงผลด้วย
    if (fileInputRef) fileInputRef.value = ''; // รีเซ็ต input ไฟล์ที่ซ่อนอยู่
    setVisualizationData(null, null); // ล้างข้อมูลการแสดงผลใน store ด้วย
    updateStatus('All file selections cleared.');
  }

  /**
   * ทริกเกอร์เหตุการณ์คลิกบน input ไฟล์ที่ซ่อนอยู่เพื่อเปิดกล่องโต้ตอบการเลือกไฟล์
   */
  function triggerFileInput() {
    fileInputRef?.click();
  }
</script>

<div class="panel">
  <h2 class="text-lg font-semibold mb-2 text-[var(--color-primary-green)]">Excel File Selection</h2>

  <div class="flex-grow flex flex-col gap-3">
    <!-- องค์ประกอบ input ไฟล์ HTML ดั้งเดิมที่ซ่อนอยู่ -->
    <input
      type="file"
      accept=".xlsx, .xls"
      multiple
      class="hidden"
      bind:this={fileInputRef}
      on:change={handleFileChange}
    />

    <!-- ปุ่มที่กำหนดเองเพื่อทริกเกอร์ input ไฟล์ด้วยสายตา -->
    <Button on:click={triggerFileInput} class="w-full bg-[var(--color-secondary-purple)] hover:bg-violet-700 text-[var(--color-text-light)]">
      Open Folder & Select Excel Files
    </Button>

    <!-- แสดงไฟล์ที่เลือกโดยใช้ UL/LI ดั้งเดิมเพื่อการจัดการเหตุการณ์และการควบคุมที่ดีขึ้น -->
    <h3 class="text-md font-medium mt-2 text-[var(--color-text-dark)]">Selected Files ({selectedFiles.length}):</h3>
    {#if selectedFiles.length > 0}
      <ul class="w-full max-h-40 overflow-y-auto border border-gray-200 rounded-md bg-white">
        {#each selectedFiles as file (file.name + file.size)}
          <li
            class="flex items-center justify-between text-sm py-2 px-4 cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0
            {file === fileToVisualize ? 'bg-emerald-100 border-l-4 border-emerald-500 font-semibold' : ''}"
            on:click={() => selectFileForVisualization(file)}
          >
            <span class="truncate pr-2" title={file.name}>{file.name}</span>
            <span class="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
          </li>
        {/each}
      </ul>
    {:else}
      <p class="text-sm text-gray-500 italic">No files selected yet.</p>
    {/if}

    <div class="mt-2">
      <p class="text-sm text-[var(--color-text-dark)]">File to Visualize:
        <span class="font-semibold">
          {#if fileToVisualize}
            {fileToVisualize.name}
          {:else}
            No file selected for visualization.
          {/if}
        </span>
      </p>
    </div>

    <Button on:click={handleVisualizeSelectedFile} disabled={!fileToVisualize || $appStore.isLoading} class="w-full bg-[var(--color-primary-green)] hover:bg-emerald-700 text-[var(--color-text-light)]">
      {#if $appStore.isLoading}
        Visualizing...
      {:else}
        Visualize Selected File
      {/if}
    </Button>
    <Button on:click={clearAllFiles} disabled={selectedFiles.length === 0} color="light" class="w-full border border-gray-300 text-[var(--color-text-dark)] hover:bg-gray-100">Clear All Files</Button>

    {#if $appStore.error}
      <p class="text-red-600 text-sm mt-2">Error: {$appStore.error}</p>
    {/if}
  </div>
</div>

hypertac-frontend/src/lib/components/HypertacVisualizer.svelte
<script lang="ts">
  import { appStore } from '../stores/app-store';
  import type { IHypertacSlot } from '../types/hypertac';
  import { config as frontendConfig } from '../../backend_config'; // Mock config from backend
  import { Button } from 'flowbite-svelte';

  // ค่าเหล่านี้ควรมาจาก frontend config หรือการเรียก API ที่เหมาะสมในการผลิต
  const HYPERTAC_ROWS = frontendConfig.hypertacConfig.rows;
  const HYPERTAC_COLS = frontendConfig.hypertacConfig.cols;

  let isCollapsed: boolean = false; // สถานะเพื่อควบคุมการยุบ/ขยาย

  $: hypertacSlots = $appStore.visualizationData?.hypertacSlots || [];

  // จัดเรียง slot ตามแถวแล้วตามคอลัมน์เพื่อให้แสดงผลถูกต้อง
  // นี่คือ reactive declaration ซึ่งเป็นวิธีของ Svelte ในการจัดการสถานะที่ได้มาอย่างมีประสิทธิภาพ
  // การแยกสิ่งนี้ออกไปเป็นฟังก์ชันแยกต่างหากนอกคอมโพเนนต์โดยทั่วไปจะหมายถึง
  // การสร้าง store ที่ได้มาซึ่งเพิ่มความซับซ้อนมากกว่าที่จำเป็นสำหรับการจัดเรียงง่ายๆ นี้
  // การเก็บไว้ในคอมโพเนนต์ยังคงอ่านง่ายและ Svelte จัดการ Reactivity ได้อย่างมีประสิทธิภาพ
  $: sortedSlots = [...hypertacSlots].sort((a, b) => {
    if (a.row === b.row) {
      return a.col - b.col;
    }
    return a.row - b.row;
  });

  /**
   * สลับสถานะที่ยุบของ Hypertac visualization
   */
  function toggleCollapse() {
    isCollapsed = !isCollapsed;
  }
</script>

<div class="panel">
  <div class="flex justify-between items-center mb-4">
    <h2 class="text-lg font-semibold text-[var(--color-primary-green)]">GUI จำลองการใช้ Hypertac</h2>
    <Button on:click={toggleCollapse} color="light" size="sm" class="p-1.5 border border-gray-300 hover:bg-gray-100">
      {#if isCollapsed}
        <!-- Inline SVG สำหรับ Chevron Down -->
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 9l6 6 6-6"/>
        </svg>
        <span class="ml-1 hidden sm:inline">Expand</span>
      {:else}
        <!-- Inline SVG สำหรับ Chevron Up -->
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 15l-6-6-6 6"/>
        </svg>
        <span class="ml-1 hidden sm:inline">Collapse</span>
      {/if}
    </Button>
  </div>

  {#if $appStore.isLoading}
    <div class="flex-grow flex items-center justify-center">
      <p class="text-lg text-gray-500">Loading Hypertac data...</p>
    </div>
  {:else if $appStore.error}
    <div class="flex-grow flex items-center justify-center">
      <p class="text-lg text-red-600">Error loading data: {$appStore.error}</p>
    </div>
  {:else if isCollapsed}
    <div class="flex-grow flex items-center justify-center text-gray-500 italic">
      <p>Hypertac visualization is collapsed. Click 'Expand' to view.</p>
    </div>
  {:else if hypertacSlots.length > 0}
    <div class="flex-grow overflow-auto p-2">
      <div
        class="hypertac-grid w-full h-full"
        style="--hypertac-rows: {HYPERTAC_ROWS}; --hypertac-cols: {HYPERTAC_COLS};"
      >
        {#each sortedSlots as slot (slot.id)}
          <div
            class="hypertac-slot {slot.isUsed ? 'used' : 'empty'} {slot.isReused ? 'reused' : ''}"
            title="{slot.signalName ? `Signal: ${slot.signalName}\nECU: ${slot.ecuName}${slot.ecuPin ? ` (Pin: ${slot.ecuPin})` : ''}\nHypertac Slot: ${slot.id}${slot.physicalHypertacId ? ` (Physical: ${slot.physicalHypertacId})` : ''}\n${slot.isReused ? ' (REUSED)' : ''}` : `Empty Slot: ${slot.id}`}"
          >
            {#if slot.isUsed}
              <span class="truncate">{slot.signalName}</span>
              {#if slot.isReused}
                <span class="ml-1 text-[var(--color-slot-reused-text)]"> (R)</span>
              {/if}
            {:else}
              <span class="text-[var(--color-slot-empty-text)] opacity-75">{slot.id}</span>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {:else}
    <div class="flex-grow flex items-center justify-center">
      <p class="text-lg text-gray-500">Upload an Excel file to visualize Hypertac data.</p>
    </div>
  {/if}
</div>

<style>
  /* สไตล์เฉพาะ Hypertac grid */
  .hypertac-grid {
    grid-template-columns: var(--hypertac-cols);
    grid-template-rows: var(--hypertac-rows);
  }
</style>

hypertac-frontend/src/lib/components/SignalInfoPanel.svelte
<script lang="ts">
  import { appStore } from '../stores/app-store';
  import { getUniqueSignalEcuConnections } from '../utils/signal-helpers'; // Import the helper function

  $: uniqueConnections = $appStore.visualizationData ? getUniqueSignalEcuConnections($appStore.visualizationData.hypertacSlots) : [];
</script>

<div class="panel">
  <h2 class="text-lg font-semibold mb-2 text-[var(--color-primary-green)]">Signal Information</h2>

  <div class="mb-4">
    <p class="text-sm">
      Signal used: <span class="font-bold text-[var(--color-primary-green)]">{$appStore.visualizationData?.signalsUsedCount || 0}</span>
      <span class="inline-block w-3 h-3 bg-[var(--color-slot-used)] border border-[var(--color-primary-green)] rounded-full ml-2"></span> (status)
    </p>
    <p class="text-sm">
      Signal not used (from Excel): <span class="font-bold text-[var(--color-text-dark)]">{$appStore.visualizationData?.signalsNotUsedCount || 0}</span>
      <span class="inline-block w-3 h-3 bg-[var(--color-slot-empty)] border border-gray-400 rounded-full ml-2"></span> (status)
    </p>
    <p class="text-sm">
      Hypertac Empty Slots: <span class="font-bold text-gray-500">{$appStore.visualizationData?.hypertacEmptySlotsCount || 0}</span>
    </p>
  </div>

  <hr class="my-2 border-gray-200">

  <h3 class="text-md font-semibold mb-2 text-[var(--color-secondary-purple)]">Reuse Status:</h3>
  <div class="flex items-center text-sm">
    <div class="w-4 h-4 bg-[var(--color-slot-reused)] border border-[var(--color-slot-reused-text)] rounded-full mr-2 animate-pulse-red"></div>
    <span>Highlighted for signals used in multiple Hypertac slots.</span>
  </div>

  <h3 class="text-md font-semibold mt-4 mb-2 text-[var(--color-secondary-purple)]">Signal to ECU connection:</h3>
  <div class="scrollable-content flex-grow">
    {#if $appStore.visualizationData && $appStore.visualizationData.hypertacSlots.length > 0}
      {#each uniqueConnections as connectionString (connectionString)}
        <p class="text-xs text-[var(--color-text-dark)] mb-1 leading-tight">
          {connectionString}
        </p>
      {/each}
      {#if uniqueConnections.length === 0}
        <p class="text-gray-500 text-sm">No signals connected to ECUs.</p>
      {/if}
    {:else}
      <p class="text-gray-500 text-sm">Upload Excel to see signal-ECU connections.</p>
    {/if}
  </div>
</div>

hypertac-frontend/src/lib/components/StatusPanel.svelte
<script lang="ts">
  import { appStore } from '../stores/app-store';
</script>

<div class="panel">
  <h2 class="text-lg font-semibold mb-2 text-[var(--color-primary-green)]">Status</h2>
  <div class="scrollable-content flex-grow bg-[var(--color-neutral-light-gray)] p-2 rounded-md border border-gray-200">
    {#each $appStore.statusMessages as message, i (i)}
      <p class="text-xs text-[var(--color-text-dark)] leading-tight mb-1">{message}</p>
    {/each}
  </div>
</div>

hypertac-frontend/src/lib/services/api.service.ts
import { appStore, setError } from '../stores/app-store';
import type { IHypertacVisualizationData } from '../types/hypertac';
import { config as frontendConfig } from '../../backend_config';

const FILE_SERVER_BASE_URL = frontendConfig.fileServerBaseUrl; // URL ของ File Server

export const apiService = {
  /**
   * อัปโหลดไฟล์ Excel ไปยัง File Server เพื่อประมวลผลและแสดงผล
   * File Server จะส่งข้อมูลที่ประมวลผลแล้วไปยัง REST API และส่งผลลัพธ์กลับมา
   * @param file อ็อบเจกต์ Excel File ที่จะอัปโหลด
   * @returns Promise ที่ resolve เป็นข้อมูลการแสดงผล Hypertac หรือ null หากเกิดข้อผิดพลาด
   */
  async uploadExcelFile(file: File): Promise<IHypertacVisualizationData | null> {
    try {
      const formData = new FormData();
      formData.append('excelFile', file); // 'excelFile' ต้องตรงกับชื่อฟิลด์ใน multer ที่ตั้งค่าไว้ใน fileserver

      const response = await fetch(`${FILE_SERVER_BASE_URL}/files/upload-excel`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      // สมมติว่า fileserver ส่ง { status: 'success', data: IHypertacVisualizationData }
      return result.data;

    } catch (error: any) {
      console.error('API Service Error:', error);
      setError(`Failed to upload or process file: ${error.message}`);
      return null;
    }
  },
};

hypertac-frontend/src/lib/stores/app-store.ts
import { writable } from 'svelte/store';
import type { IHypertacVisualizationData, IHypertacSlot } from '../types/hypertac';

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
  updateStatus: (message: string) => update(state => ({ ...state, statusMessages: [...state.statusMessages, message].slice(-10) })), // เก็บข้อความ 10 ข้อความล่าสุด
  
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
  /**
   * รีเซ็ตสถานะแอปพลิเคชันทั้งหมดเป็นค่าเริ่มต้น
   */
  reset: () => set(initialState)
};

export { appStore };

hypertac-frontend/src/lib/types/hypertac.ts
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

hypertac-frontend/src/lib/utils/file-helpers.ts
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

hypertac-frontend/src/lib/utils/signal-helpers.ts
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

hypertac-frontend/src/routes/+layout.svelte
<script>
  import '../app.css';
  import { Button, Navbar, NavLi, NavUl, NavBrand } from 'flowbite-svelte';
</script>

<div class="min-h-screen flex flex-col">
  <Navbar class="w-full border-b border-gray-200 bg-[var(--color-neutral-white)]">
    <NavBrand href="/">
      <!-- สมมติว่า hypertac-logo.svg อยู่ในโฟลเดอร์ static/ -->
      <!-- คุณอาจต้องวางไฟล์ hypertac-logo.svg ในโฟลเดอร์ static/ ของคุณ
           หรือแทนที่ด้วยโลโก้ข้อความหรือพาธรูปภาพอื่น -->
      <img src="/hypertac-logo.svg" class="mr-3 h-6 sm:h-9" alt="Hypertac Logo" />
      <span class="self-center whitespace-nowrap text-xl font-semibold text-[var(--color-primary-green)]">Hypertac Visualizer</span>
    </NavBrand>
    <NavUl>
      <NavLi href="/" active={true} class="text-[var(--color-primary-green)] hover:text-emerald-700">Home</NavLi>
    </NavUl>
  </Navbar>

  <main class="flex-grow">
    <slot />
  </main>

  <footer class="p-4 text-center text-gray-600 text-sm border-t border-gray-200 bg-[var(--color-neutral-white)]">
    © {new Date().getFullYear()} Hypertac Visualizer. All rights reserved. Developed by Senior Engineer.
  </footer>
</div>

hypertac-frontend/src/routes/+page.svelte
<script lang="ts">
  import StatusPanel from '$lib/components/StatusPanel.svelte';
  import ExcelFileSelector from '$lib/components/ExcelFileSelector.svelte';
  import HypertacVisualizer from '$lib/components/HypertacVisualizer.svelte';
  import SignalInfoPanel from '$lib/components/SignalInfoPanel.svelte';
</script>

<!--
  เค้าโครงหลักโดยใช้ Tailwind CSS Grid สำหรับการตอบสนอง
  บนหน้าจอขนาดใหญ่ (md: ขึ้นไป) จะเป็นเค้าโครง 3 คอลัมน์ (อัตราส่วน 3:6:3)
  บนหน้าจอขนาดเล็ก จะซ้อนกันในแนวตั้ง
-->
<div class="min-h-[calc(100vh-120px)] flex flex-col md:grid md:grid-cols-12 md:gap-4 p-4">
  <!-- คอลัมน์ซ้าย: สถานะและตัวเลือกไฟล์ Excel -->
  <div class="md:col-span-3 flex flex-col gap-4 mb-4 md:mb-0">
    <!-- แผงสถานะ - ใช้พื้นที่ 1/3 ของความสูงในคอลัมน์นี้ -->
    <div class="h-1/3 min-h-[150px] md:min-h-0">
      <StatusPanel />
    </div>
    <!-- ตัวเลือกไฟล์ Excel - ใช้พื้นที่ 2/3 ของความสูงในคอลัมน์นี้ -->
    <div class="h-2/3 min-h-[300px] md:min-h-0">
      <ExcelFileSelector />
    </div>
  </div>

  <!-- คอลัมน์กลาง: การแสดงผล Hypertac หลัก -->
  <div class="md:col-span-6 mb-4 md:mb-0">
    <HypertacVisualizer />
  </div>

  <!-- คอลัมน์ขวา: ข้อมูลสัญญาณ -->
  <div class="md:col-span-3">
    <SignalInfoPanel />
  </div>
</div>
