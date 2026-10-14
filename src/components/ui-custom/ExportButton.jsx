import React, { useState, useEffect } from 'react';
import { Download, FileSpreadsheet, FileText, X } from 'lucide-react';
import GlassButton from './GlassButton';
import { base44 } from '@/api/base44Client';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';

// ── Institutional brand palette (matches the app's Navy & Gold theme) ──
const NAVY = [30, 56, 92];      // #1e385c
const GOLD = [176, 144, 36];    // #b09024
const INK = [22, 38, 59];       // #16263b
const MUTED = [98, 112, 132];   // #627084
const HAIR = [219, 224, 230];   // #dbe0e6
const TINT = [244, 246, 249];   // #f4f6f9
const LOGO_URL = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a0277e13e69f944f28e4fd/c8fdfebab_OIP.jpg';

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

// Brand logo as base64 (cached; PDF renders without it if unavailable)
let logoCache = null;
async function getLogoData() {
  if (logoCache !== null) return logoCache;
  try {
    const res = await fetch(LOGO_URL);
    const buf = await res.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    logoCache = `data:image/jpeg;base64,${btoa(binary)}`;
  } catch (e) {
    logoCache = null;
  }
  return logoCache;
}

export default function ExportButton({ data = [], filename = 'export', columns, title }) {
  const [open, setOpen] = useState(false);
  const [exporter, setExporter] = useState('');

  useEffect(() => {
    base44.auth.me().then((u) => setExporter(u?.full_name || '')).catch(() => {});
  }, []);

  const exportTitle = title || prettify(filename);
  const now = new Date();
  const exportDate = now.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const exportTime = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const fileDate = now.toISOString().split('T')[0];

  // ── EXCEL ──
  const exportExcel = () => {
    if (!data.length) return;
    const rows = data.map(r => cleanRow(r, columns));
    const headers = Object.keys(rows[0]);
    const body = rows.map(r => headers.map(h => String(r[h] ?? '')));

    // Official document layout: brand block, then the table
    const aoa = [
      ['Koume RoomFlow'],
      [exportTitle],
      [`Établi le ${exportDate} à ${exportTime}  ·  ${rows.length} enregistrement(s)${exporter ? `  ·  Par : ${exporter}` : ''}`],
      [],
      headers,
      ...body,
    ];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const lastCol = headers.length - 1;
    const endRow = aoa.length - 1;

    // Merge the header block across the table width
    ws['!merges'] = [0, 1, 2].map(r => ({ s: { r, c: 0 }, e: { r, c: Math.max(lastCol, 0) } }));

    // Auto-fitted column widths (based on real content)
    ws['!cols'] = headers.map((h, i) => {
      const maxLen = Math.max(
        h.length,
        ...rows.map(r => String(r[h] ?? '').length),
        6,
      );
      return { wch: Math.min(Math.max(maxLen + 3, 12), 42) };
    });

    // Frozen title block + filterable table
    ws['!views'] = [{ state: 'frozen', ySplit: 4 }];
    ws['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: 4, c: 0 }, e: { r: endRow, c: lastCol } }) };

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, exportTitle.replace(/[\\/?*[\]:]/g, ' ').slice(0, 31) || 'Export');
    XLSX.writeFile(wb, `${filename}_${fileDate}.xlsx`);
    setOpen(false);
  };

  // ── PDF ──
  const exportPDF = async () => {
    if (!data.length) return;
    const rows = data.map(r => cleanRow(r, columns));
    const headers = Object.keys(rows[0]);
    const doc = new jsPDF({ orientation: headers.length > 6 ? 'landscape' : 'portrait', unit: 'mm', format: 'a4' });

    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 14;
    const contentW = pageW - margin * 2;

    // ── Official header band ──
    doc.setFillColor(...NAVY);
    doc.rect(0, 0, pageW, 26, 'F');
    const logo = await getLogoData();
    if (logo) {
      try { doc.addImage(logo, 'JPEG', margin, 5, 16, 16); } catch (e) { /* no logo */ }
    }
    const textX = logo ? margin + 20 : margin;
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Koume RoomFlow', textX, 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text('Système de Gestion des Résidences', textX, 17);
    // Right side: document title + date
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(exportTitle.toUpperCase(), pageW - margin, 12, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(`Établi le ${exportDate} à ${exportTime}`, pageW - margin, 17, { align: 'right' });

    // Gold institutional rule under the header
    doc.setFillColor(...GOLD);
    doc.rect(0, 26, pageW, 1.5, 'F');

    // ── Meta line ──
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    const metaParts = [`${rows.length} enregistrement(s)`];
    if (exporter) metaParts.push(`Établi par : ${exporter}`);
    metaParts.push('Réf. KRF-' + fileDate.replace(/-/g, ''));
    doc.text(metaParts.join('   ·   '), margin, 33);

    // ── Column widths weighted by content ──
    const weights = headers.map((h, i) => {
      const maxLen = Math.max(h.length, ...rows.map(r => String(r[h] ?? '').length), 4);
      return Math.sqrt(Math.min(maxLen, 42));
    });
    const wSum = weights.reduce((a, b) => a + b, 0);
    const colWs = weights.map(w => (w / wSum) * contentW);

    // ── Table ──
    const lineH = 4.2;
    const pad = 2.5;
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    const measure = (val, w) => Math.max(1, doc.splitTextToSize(String(val ?? ''), w - 4).length);
    const rowHeights = rows.map(row =>
      Math.max(...headers.map((h, i) => measure(row[h], colWs[i])), 1) * lineH + pad * 2,
    );
    const headerH = 8;
    const tableTop = 38;

    const drawTableHeader = (y) => {
      doc.setFillColor(...NAVY);
      doc.rect(margin, y, contentW, headerH, 'F');
      doc.setFillColor(...GOLD);
      doc.rect(margin, y + headerH, contentW, 0.8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      let x = margin;
      headers.forEach((h, i) => {
        doc.text(h, x + 2, y + 5.5, { maxWidth: colWs[i] - 4 });
        x += colWs[i];
      });
      doc.setFont('helvetica', 'normal');
    };

    let y = tableTop;
    drawTableHeader(y);
    y += headerH + 0.8;

    rows.forEach((row, ri) => {
      const rh = rowHeights[ri];
      if (y + rh > pageH - 26) {
        doc.addPage();
        y = 20;
        drawTableHeader(y);
        y += headerH + 0.8;
      }

      // Alternating ivory/white rows with hairline grid
      if (ri % 2 === 0) {
        doc.setFillColor(...TINT);
        doc.rect(margin, y, contentW, rh, 'F');
      }
      doc.setDrawColor(...HAIR);
      doc.setLineWidth(0.2);
      doc.rect(margin, y, contentW, rh, 'S');

      doc.setTextColor(...INK);
      doc.setFontSize(7.5);
      let x = margin;
      headers.forEach((h, i) => {
        const lines = doc.splitTextToSize(String(row[h] ?? ''), colWs[i] - 4);
        doc.text(lines, x + 2, y + pad + 3, { maxWidth: colWs[i] - 4 });
        x += colWs[i];
      });
      y += rh;
    });

    // Outer frame
    doc.setDrawColor(...NAVY);
    doc.setLineWidth(0.4);
    doc.rect(margin, tableTop, contentW, y - tableTop, 'S');

    // ── Signature block (official use) ──
    const sigTop = y + 14;
    const sigY = sigTop > pageH - 30 ? (doc.addPage(), 40) : sigTop;
    doc.setTextColor(...MUTED);
    doc.setFontSize(8);
    doc.text('Fait à  ..........................................', margin, sigY);
    doc.text('Le  ..........................................', margin, sigY + 6);
    doc.text('Signature / Cachet', pageW - margin, sigY + 18, { align: 'right' });
    doc.setDrawColor(...MUTED);
    doc.setLineWidth(0.2);
    doc.line(pageW - margin - 50, sigY + 14, pageW - margin, sigY + 14);

    // ── Footer on every page ──
    const totalPages = doc.internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setFillColor(...GOLD);
      doc.rect(0, pageH - 11.5, pageW, 1.2, 'F');
      doc.setFillColor(...NAVY);
      doc.rect(0, pageH - 10.3, pageW, 10.3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.text('Koume RoomFlow — Système de Gestion des Résidences', margin, pageH - 3.8);
      doc.text(`Page ${p} / ${totalPages}`, pageW - margin, pageH - 3.8, { align: 'right' });
    }

    doc.save(`${filename}_${fileDate}.pdf`);
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
                <p className="text-xs text-slate-500">Tableau structuré avec filtres</p>
              </div>
            </button>
            <button onClick={exportPDF}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-200 hover:bg-rose-500/10 hover:text-rose-400 rounded-lg transition-colors group">
              <FileText className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <p className="font-medium">PDF (.pdf)</p>
                <p className="text-xs text-slate-500">Document officiel signable</p>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}