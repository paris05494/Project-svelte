import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { upload } from './utils/multer';
import { uploadExcel } from './controller/excel.controller';

dotenv.config();

const restapi = express();

restapi.use(cors());
restapi.use(express.json());

restapi.get('/', async (_, res) => {
});

restapi.post('/upload', upload.single('file'), uploadExcel);

export default restapi;
