'use client';

import React from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FileSpreadsheet, FileText } from 'lucide-react';
import { ShiftCard } from './ScheduleGrid';

interface ExportButtonsProps {
  shifts: ShiftCard[];
  elementIdToExport: string; // ID del contenedor HTML para generar el PDF
  fileName?: string;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({
  shifts,
  elementIdToExport,
  fileName = 'Agenda_Turnos'
}) => {
  // Exportar a Excel (.xlsx)
  const exportToExcel = () => {
    const dataToExport = shifts.map(s => ({
      Fecha: s.date,
      Evento: s.title,
      Tipo: s.type,
      FOH_Encargado: s.fohName || 'N/A',
      Técnicos_Asignados: s.assignedWorkers.join(', '),
      Observaciones: s.alerts ? s.alerts.join(' | ') : ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Agenda');
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  // Exportar a PDF
  const exportToPDF = async () => {
    const element = document.getElementById(elementIdToExport);
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`${fileName}.pdf`);
  };

  return (
    <div className="flex gap-3">
      <button
        onClick={exportToExcel}
        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-3.5 py-2 rounded-lg transition shadow"
      >
        <FileSpreadsheet className="w-4 h-4" /> Exportar Excel
      </button>

      <button
        onClick={exportToPDF}
        className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs px-3.5 py-2 rounded-lg transition shadow"
      >
        <FileText className="w-4 h-4" /> Exportar PDF
      </button>
    </div>
  );
};