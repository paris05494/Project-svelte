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
});

const upload = multer({ dest: 'uploads/' });
restapi.get("/", async (_, res) => {
   const defaultValue = await getDefault();
   res.json(defaultValue).end();
});

restapi.post("/api/v1/hypertac/upload-excel", upload.single('excelFile'), uploadExcel);

export default restapi;
