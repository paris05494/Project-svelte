import ExcelJS from 'exceljs';

export async function parseExcel(path: string) {
	const workbook = new ExcelJS.Workbook();
	await workbook.xlsx.readFile(path);

	const sheet = workbook.worksheets[0];

	const data: {
		signal: string;
		status: 'used' | 'unused' | 'duplicated';
		row: number;
		col: number;
		ecu?: string;
	}[] = [];

	const signalMap = new Map<string, number>();

	// ดึงข้อมูลจาก Sheet ตาม format ที่กำหนด
	sheet.eachRow((row, rowIndex) => {
		const signal = row.getCell(1).value?.toString().trim();
		const ecu = row.getCell(2).value?.toString().trim();
		const pin = parseInt(row.getCell(3).value?.toString() || '');

		if (!signal || isNaN(pin)) return;

		// Map signal usage
		const usageCount = (signalMap.get(signal) || 0) + 1;
		signalMap.set(signal, usageCount);

		data.push({
			signal,
			status: usageCount > 1 ? 'duplicated' : 'used',
			row: Math.floor(pin / 5),
			col: pin % 5,
			ecu,
		});
	});

	// Fill unused
	for (let i = 0; i < 90; i++) {
		const row = Math.floor(i / 5);
		const col = i % 5;
		if (!data.find(d => d.row === row && d.col === col)) {
			data.push({ signal: '', status: 'unused', row, col });
		}
	}

	return data;
}
