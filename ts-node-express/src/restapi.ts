import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { uploadExcel } from "./controller/hypertac.controller";
import multer from 'multer';

dotenv.config();

const restapi = express();

restapi.use(cors());
restapi.use(express.json());

restapi.get('/', async (_, res) => {
    // This route seems to be a placeholder or incomplete in the original snippet.
    // It's not strictly necessary for the Hypertac visualization functionality.
    // If getDefault() is meant to provide some initial data, it should be defined.
    // For now, I'll assume it's not critical for the core functionality.
    res.send('Hypertac Backend API is running!');
});

const upload = multer({ dest: 'uploads/' });
// The duplicate restapi.get("/", ...) should be removed or handled.
// Keeping the one that serves the default response for now, but usually you'd have more meaningful routes.
// restapi.get("/", async (_, res) => {
//    const defaultValue = await getDefault(); // getDefault is not defined
//    res.json(defaultValue).end();
// });


restapi.post("/api/v1/hypertac/upload-excel", upload.single('excelFile'), uploadExcel);

export default restapi;