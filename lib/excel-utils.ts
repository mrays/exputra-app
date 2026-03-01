import * as XLSX from 'xlsx';

export interface ExcelExportOptions {
    fileName: string;
    sheetName?: string;
    columns?: string[];
}

export interface ExcelImportOptions {
    sheetName?: number | string;
}

/**
 * Export data to XLSX file
 */
export function exportToExcel(data: any[], options: ExcelExportOptions) {
    const {
        fileName,
        sheetName = 'Data',
        columns = data.length > 0 ? Object.keys(data[0]) : []
    } = options;

    // Format data for export
    const formattedData = data.map(row => {
        const newRow: any = {};
        columns.forEach(col => {
            let value = row[col];
            // Format dates
            if (value instanceof Date) {
                value = value.toLocaleDateString('id-ID');
            } else if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
                // Format ISO date strings
                try {
                    value = new Date(value).toLocaleDateString('id-ID');
                } catch (e) {
                    // Keep original value if date parsing fails
                }
            }
            newRow[col] = value || '';
        });
        return newRow;
    });

    // Create workbook
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Style header row
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!worksheet[cellAddress]) continue;
        worksheet[cellAddress].s = {
            font: { bold: true, color: { rgb: 'FFFFFF' } },
            fill: { fgColor: { rgb: '4472C4' } },
            alignment: { horizontal: 'center', vertical: 'center' }
        };
    }

    // Auto-fit columns
    const colWidths = columns.map(col => ({
        wch: Math.max(col.length, 12)
    }));
    worksheet['!cols'] = colWidths;

    // Save file
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
}

/**
 * Import data from XLSX file
 */
export function importFromExcel(file: File, options?: ExcelImportOptions): Promise<any[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                
                // Get sheet name
                const sheetName = options?.sheetName || workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                
                // Convert to JSON
                const jsonData = XLSX.utils.sheet_to_json(worksheet);
                
                resolve(jsonData);
            } catch (error) {
                reject(new Error(`Failed to parse Excel file: ${error}`));
            }
        };

        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };

        reader.readAsArrayBuffer(file);
    });
}

/**
 * Get Excel file from input element
 */
export function getExcelFileFromInput(inputElement: HTMLInputElement): File | null {
    const files = inputElement.files;
    if (!files || files.length === 0) return null;
    return files[0];
}

/**
 * Validate Excel file format
 */
export function validateExcelFile(file: File): { valid: boolean; error?: string } {
    const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'application/x-xlsx'
    ];

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        return { valid: false, error: 'File harus format .xlsx atau .xls' };
    }

    if (file.size > 5 * 1024 * 1024) {
        return { valid: false, error: 'File tidak boleh lebih dari 5 MB' };
    }

    return { valid: true };
}
