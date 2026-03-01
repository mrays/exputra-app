import React, { useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import { exportToExcel, importFromExcel, validateExcelFile } from '@/lib/excel-utils';

interface DataExportImportProps {
    data: any[];
    fileName: string;
    sheetName?: string;
    columns?: string[];
    onImport?: (importedData: any[]) => Promise<void>;
    disabled?: boolean;
}

export function DataExportImport({
    data,
    fileName,
    sheetName = 'Data',
    columns,
    onImport,
    disabled = false
}: DataExportImportProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [importLoading, setImportLoading] = React.useState(false);

    const handleExport = () => {
        if (data.length === 0) {
            alert('Tidak ada data untuk diekspor');
            return;
        }

        try {
            exportToExcel(data, {
                fileName,
                sheetName,
                columns: columns || (data.length > 0 ? Object.keys(data[0]) : [])
            });
        } catch (error) {
            alert('Gagal mengekspor data');
            console.error(error);
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file
        const validation = validateExcelFile(file);
        if (!validation.valid) {
            alert(validation.error);
            return;
        }

        setImportLoading(true);
        try {
            const importedData = await importFromExcel(file);
            
            if (importedData.length === 0) {
                alert('File Excel kosong');
                return;
            }

            if (onImport) {
                await onImport(importedData);
            } else {
                alert('Fungsi import belum dikonfigurasi');
            }
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            alert(`❌ Gagal mengimpor: ${errorMsg}`);
            console.error('Import error:', error);
        } finally {
            setImportLoading(false);
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="flex gap-2">
            <button
                onClick={handleExport}
                disabled={disabled || data.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                title="Export ke Excel"
            >
                <Download className="w-4 h-4" />
                Export
            </button>
            
            <button
                onClick={handleImportClick}
                disabled={disabled || importLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                title="Import dari Excel"
            >
                <Upload className="w-4 h-4" />
                {importLoading ? 'Mengimpor...' : 'Import'}
            </button>

            <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
            />
        </div>
    );
}

export default DataExportImport;
