/**
 * Utility functions for exporting data to Excel (UTF-8 CSV with Arabic support) and PDF/Print
 */

export function exportToCsv(filename: string, headers: string[] = [], rows: (string | number)[][] = []) {
  // UTF-8 BOM for Microsoft Excel Arabic support
  const BOM = '\uFEFF';
  
  const csvContent = [
    (headers || []).map(h => `"${String(h).replace(/"/g, '""')}"`).join(','),
    ...(rows || []).map(row =>
      (row || []).map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')
    )
  ].join('\r\n');

  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printDocument() {
  window.print();
}
