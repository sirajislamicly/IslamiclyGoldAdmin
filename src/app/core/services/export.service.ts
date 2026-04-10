import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ExportService {

  exportToCSV(data: Record<string, unknown>[], filename: string, columns?: { key: string; label: string }[]): void {
    if (!data.length) return;
    const cols = columns || Object.keys(data[0]).map(k => ({ key: k, label: k }));
    const header = cols.map(c => `"${c.label}"`).join(',');
    const rows = data.map(row =>
      cols.map(c => {
        const val = (row as Record<string, unknown>)[c.key];
        const str = val === null || val === undefined ? '' : String(val);
        return `"${str.replace(/"/g, '""')}"`;
      }).join(',')
    );
    const csv = [header, ...rows].join('\n');
    this.download(csv, `${filename}.csv`, 'text/csv');
  }

  exportToExcel(data: Record<string, unknown>[], filename: string, columns?: { key: string; label: string }[]): void {
    if (!data.length) return;
    const cols = columns || Object.keys(data[0]).map(k => ({ key: k, label: k }));
    let table = '<table><thead><tr>';
    table += cols.map(c => `<th>${this.escapeHtml(c.label)}</th>`).join('');
    table += '</tr></thead><tbody>';
    data.forEach(row => {
      table += '<tr>';
      table += cols.map(c => {
        const val = (row as Record<string, unknown>)[c.key];
        return `<td>${this.escapeHtml(val === null || val === undefined ? '' : String(val))}</td>`;
      }).join('');
      table += '</tr>';
    });
    table += '</tbody></table>';
    const xml = `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Sheet1">${this.htmlTableToExcelXml(data, cols)}</Worksheet></Workbook>`;
    this.download(table, `${filename}.xls`, 'application/vnd.ms-excel');
  }

  exportToPDF(data: Record<string, unknown>[], filename: string, title: string, columns?: { key: string; label: string }[]): void {
    if (!data.length) return;
    const cols = columns || Object.keys(data[0]).map(k => ({ key: k, label: k }));
    let html = `<!DOCTYPE html><html><head><style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      h1 { color: #333; font-size: 18px; margin-bottom: 10px; }
      .meta { color: #666; font-size: 12px; margin-bottom: 20px; }
      table { width: 100%; border-collapse: collapse; font-size: 11px; }
      th { background: #f59e0b; color: white; padding: 8px 6px; text-align: left; }
      td { padding: 6px; border-bottom: 1px solid #eee; }
      tr:nth-child(even) { background: #f9f9f9; }
    </style></head><body>`;
    html += `<h1>${this.escapeHtml(title)}</h1>`;
    html += `<div class="meta">Generated: ${new Date().toLocaleString()} | Records: ${data.length}</div>`;
    html += '<table><thead><tr>';
    html += cols.map(c => `<th>${this.escapeHtml(c.label)}</th>`).join('');
    html += '</tr></thead><tbody>';
    data.forEach(row => {
      html += '<tr>';
      html += cols.map(c => {
        const val = (row as Record<string, unknown>)[c.key];
        return `<td>${this.escapeHtml(val === null || val === undefined ? '' : String(val))}</td>`;
      }).join('');
      html += '</tr>';
    });
    html += '</tbody></table></body></html>';

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
    }
  }

  private htmlTableToExcelXml(data: Record<string, unknown>[], cols: { key: string; label: string }[]): string {
    let xml = '<Table>';
    xml += '<Row>';
    cols.forEach(c => { xml += `<Cell><Data ss:Type="String">${this.escapeHtml(c.label)}</Data></Cell>`; });
    xml += '</Row>';
    data.forEach(row => {
      xml += '<Row>';
      cols.forEach(c => {
        const val = (row as Record<string, unknown>)[c.key];
        const str = val === null || val === undefined ? '' : String(val);
        const type = typeof val === 'number' ? 'Number' : 'String';
        xml += `<Cell><Data ss:Type="${type}">${this.escapeHtml(str)}</Data></Cell>`;
      });
      xml += '</Row>';
    });
    xml += '</Table>';
    return xml;
  }

  private escapeHtml(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  private download(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType + ';charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }
}
