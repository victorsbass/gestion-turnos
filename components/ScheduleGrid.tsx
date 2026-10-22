'use client';

import React from 'react';
import { Calendar, AlertTriangle, UserCheck } from 'lucide-react';

export interface ShiftCard {
  date: string;
  title: string;
  type: 'SHOW' | 'SETUP' | 'OVERNIGHT' | 'VACATION';
  assignedWorkers: string[];
  fohName?: string;
  alerts?: string[];
}

interface ScheduleGridProps {
  monthName: string;
  shifts: ShiftCard[];
}

export const ScheduleGrid: React.FC<ScheduleGridProps> = ({ monthName, shifts }) => {
  const getBadgeColor = (type: ShiftCard['type']) => {
    switch (type) {
      case 'SHOW':
        return 'bg-blue-600 text-white';
      case 'SETUP':
        return 'bg-amber-600 text-white';
      case 'OVERNIGHT':
        return 'bg-purple-700 text-white';
      case 'VACATION':
        return 'bg-emerald-600 text-white';
      default:
        return 'bg-slate-700 text-slate-200';
    }
  };

  return (
    <div className="w-full bg-slate-900 text-slate-100 p-6 rounded-xl shadow-2xl border border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="text-blue-400" /> Agenda de Turnos: {monthName}
        </h2>
        <div className="flex flex-wrap gap-3 text-xs">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-600"></span> Show</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-600"></span> Armado</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-purple-700"></span> Overnight</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-600"></span> Vacaciones</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {shifts.map((shift, idx) => (
          <div
            key={idx}
            className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex flex-col justify-between hover:border-slate-500 transition"
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-slate-400">{shift.date}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getBadgeColor(shift.type)}`}>
                  {shift.type}
                </span>
              </div>
              
              <h3 className="font-bold text-base text-white mb-2">{shift.title}</h3>

              {shift.fohName && (
                <div className="text-xs text-blue-300 font-medium flex items-center gap-1 mb-3 bg-blue-950/50 p-1.5 rounded border border-blue-900/50">
                  <UserCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>Encargado (FOH): <strong>{shift.fohName}</strong></span>
                </div>
              )}

              <div className="text-xs text-slate-300 space-y-1">
                <p className="font-medium text-slate-400">Equipo Asignado:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  {shift.assignedWorkers.map((worker, wIdx) => (
                    <li key={wIdx}>{worker}</li>
                  ))}
                </ul>
              </div>
            </div>

            {shift.alerts && shift.alerts.length > 0 && (
              <div className="mt-3 pt-2 border-t border-slate-700/60 text-amber-400 text-xs space-y-1">
                {shift.alerts.map((alert, aIdx) => (
                  <div key={aIdx} className="flex items-start gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{alert}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};