import { Request, Response } from 'express';
import { parseExcel } from '../model/excel.model';

export const uploadExcel = async (req: Request, res: Response) => {
	try {
		const file = req.file;
		if (!file) return res.status(400).json({ error: 'No file uploaded' });

		const result = await parseExcel(file.path);
		res.json(result);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Parsing failed' });
	}
};
