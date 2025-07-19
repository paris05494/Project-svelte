import { Request, Response } from 'express';
import { processExcelFile } from '../model/hypertac.model';
import fs from 'fs/promises'; // For file system operations (deleting temp file)

export async function uploadExcel(req: Request, res: Response) {
   if (!req.file) {
       return void res.status(400).json({ message: 'No Excel file uploaded.' });
   }
   try {
       const visualizationData = await processExcelFile(req.file.path);
       res.json({ status: 'success', data: visualizationData });
   } catch (error: any) {
       console.error('Error processing Excel file:', error);
       res.status(500).json({ message: `Failed to process Excel file: ${error.message}` });
   } finally {
       // Clean up the uploaded file from the server
       if (req.file) {
           try {
               await fs.unlink(req.file.path);
           } catch (unlinkError) {
               console.error('Error deleting uploaded file:', unlinkError);
           }
       }
   }
}