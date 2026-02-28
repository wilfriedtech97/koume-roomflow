import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, X } from 'lucide-react';
import GlassButton from './GlassButton';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';

// Column label overrides (snake_case → readable)
function prettify(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

// Clean a single row for export (skip internal/id fields)
const SKIP_KEYS = ['id', 'created_by', '_existingOccupant', '_selectedRoom'];
function cleanRow(row, columns) {
  const keys = columns || Object.keys(row).filter(k => !SKIP_KEYS.includes(k));
  const out = {};
  keys.forEach(k => {
    const val = row[k];
    if (val === null || val === undefined) out[prettify(k)] = '';
    else if (typeof val === 'boolean') out[prettify(k)] = val ? 'Oui' : 'Non';
    else out[prettify(k)] = val;
  });
  return out;
}

export default function ExportButton({ data = [], filename = 'export', columns, title }) {
  const [open, setOpen] = useState(false);

  const exportTitle = title || prettify(filename);
  const exportDate = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

  // ── EXCEL ──
  const exportExcel = () => {
    if (!data.length) return;
    const rows = data.map(r => cleanRow(r, columns));
    const ws = XLSX.utils.json_to_sheet(rows);

    // Column widths
    const headers = Object.keys(rows[0]);
    ws['!cols'] = headers.map(h => ({ wch: Math.max(h.length + 2, 16) }));

    // Header row styling (xlsx community edition supports limited styles)
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cell = ws[XLSX.utils.encode_cell({ r: 0, c: C })];
      if (cell) {
        cell.s = {
          font: { bold: true, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: '0891B2' } },  // cyan-600
          alignment: { horizontal: 'center' },
          border: {
            bottom: { style: 'medium', color: { rgb: '06B6D4' } }
          }
        };
      }
    }

    // Alternating row colors
    for (let R = 1; R <= range.e.r; R++) {
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
        if (cell) {
          cell.s = {
            fill: { fgColor: { rgb: R % 2 === 0 ? 'E0F7FA' : 'FFFFFF' } },
            alignment: { horizontal: 'left' },
            border: {
              bottom: { style: 'thin', color: { rgb: 'CCCCCC' } },
              right: { style: 'thin', color: { rgb: 'CCCCCC' } },
            }
          };
        }
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, exportTitle.slice(0, 31));
    XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
    setOpen(false);
  };

  // ── PDF ──
  const exportPDF = () => {
    if (!data.length) return;
    const rows = data.map(r => cleanRow(r, columns));
    const headers = Object.keys(rows[0]);
    const doc = new jsPDF({ orientation: headers.length > 6 ? 'landscape' : 'portrait', unit: 'mm', format: 'a4' });

    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 14;

    // ── Header band ──
    doc.setFillColor(8, 145, 178); // cyan-600
    doc.rect(0, 0, pageW, 22, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text(exportTitle, margin, 14);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Exporté le ${exportDate}`, pageW - margin, 14, { align: 'right' });
    doc.setTextColor(0, 0, 0);

    // ── Sub-info line ──
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`${rows.length} enregistrement(s)  ·  Koume RoomFlow`, margin, 30);

    // ── Table ──
    const colW = Math.floor((pageW - margin * 2) / headers.length);
    const cellH = 8;
    const tableTop = 34;

    // Table header
    doc.setFillColor(15, 23, 42);
    doc.rect(margin, tableTop, pageW - margin * 2, cellH, 'F');
    doc.setTextColor(6, 182, 212);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    headers.forEach((h, i) => {
      doc.text(h, margin + i * colW + 3, tableTop + 5.5, { maxWidth: colW - 4 });
    });

    // Table rows
    doc.setFont('helvetica', 'normal');
    let y = tableTop + cellH;
    rows.forEach((row, ri) => {
      if (y + cellH > pageH - 15) {
        doc.addPage();
        y = 20;
        // Re-draw header on new page
        doc.setFillColor(15, 23, 42);
        doc.rect(margin, y - cellH, pageW - margin * 2, cellH, 'F');
        doc.setTextColor(6, 182, 212);
        doc.setFont('helvetica', 'bold');
        headers.forEach((h, i) => doc.text(h, margin + i * colW + 3, y - 2.5, { maxWidth: colW - 4 }));
        doc.setFont('helvetica', 'normal');
      }

      // Alternating bg
      if (ri % 2 === 0) {
        doc.setFillColor(240, 253, 254);
        doc.rect(margin, y, pageW - margin * 2, cellH, 'F');
      }

      // Row border
      doc.setDrawColor(220, 220, 220);
      doc.rect(margin, y, pageW - margin * 2, cellH, 'S');

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(7);
      headers.forEach((h, i) => {
        const val = String(row[h] ?? '');
        doc.text(val, margin + i * colW + 3, y + 5.5, { maxWidth: colW - 4 });
      });
      y += cellH;
    });

    // ── Footer ──
    const totalPages = doc.internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setFillColor(8, 145, 178);
      doc.rect(0, pageH - 10, pageW, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.text('Koume RoomFlow — Système de Gestion', margin, pageH - 3.5);
      doc.text(`Page ${p} / ${totalPages}`, pageW - margin, pageH - 3.5, { align: 'right' });
    }

    doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
    setOpen(false);
  };

  return (
    <div className="relative">
      <GlassButton variant="secondary" onClick={() => setOpen(!open)}>
        <Download className="w-4 h-4" /> Export
      </GlassButton>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-30 glass-card p-3 min-w-[200px] shadow-2xl">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Exporter comme</span>
              <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white"><X className="w-3.5 h-3.5" /></button>
            </div>
            <button onClick={exportExcel}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-400 rounded-lg transition-colors group">
              <FileSpreadsheet className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <p className="font-medium">Excel (.xlsx)</p>
                <p className="text-xs text-slate-500">Tableau formaté coloré</p>
              </div>
            </button>
            <button onClick={exportPDF}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-200 hover:bg-rose-500/10 hover:text-rose-400 rounded-lg transition-colors group">
              <FileText className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <p className="font-medium">PDF (.pdf)</p>
                <p className="text-xs text-slate-500">Document imprimable</p>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}