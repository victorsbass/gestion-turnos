'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { CalendarOff, Check, X, ShieldAlert } from 'lucide-react';

export interface TimeOffRecord {
  id: string;
  workerId: string;
  workerName: string;
  date: string;
  requestType: 'VACATION' | 'DAY_OFF';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface TimeOffManagerProps {
  requests: TimeOffRecord[];
  onRequestUpdated: () => void;
}

export const TimeOffManager: React.FC<TimeOffManagerProps> = ({ requests, onRequestUpdated }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleStatusChange = async (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
    const { error } = await supabase
      .from('time_off_requests')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      onRequestUpdated();
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const approvedRequests = requests.filter(r => r.status === 'APPROVED');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg flex items-center gap-2 text-white">
          <CalendarOff className="text-emerald-400" /> Solicitudes de Días Libres y Vacaciones
        </h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg transition"
        >
          {isOpen ? 'Ocultar Panel' : `Ver Solicitudes (${pendingRequests.length} pendientes)`}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-4 pt-2 border-t border-slate-800">
          {/* Pendientes */}
          <div>
            <p className="text-xs font-bold text-amber-400 mb-2 uppercase tracking-wider">
              Pendientes de Aprobación ({pendingRequests.length})
            </p>
            {pendingRequests.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No hay solicitudes pendientes.</p>
            ) : (
              <div className="space-y-2">
                {pendingRequests.map(req => (
                  <div
                    key={req.id}
                    className="flex items-center justify-between bg-slate-800/80 border border-slate-700/80 p-3 rounded-lg text-xs"
                  >
                    <div>
                      <p className="font-bold text-white">{req.workerName}</p>
                      <p className="text-slate-400">
                        Fecha: <strong className="text-slate-200">{req.date}</strong> | Tipo:{' '}
                        <span className={req.requestType === 'VACATION' ? 'text-emerald-400 font-semibold' : 'text-blue-400'}>
                          {req.requestType === 'VACATION' ? 'Vacaciones' : 'Día Libre'}
                        </span>
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusChange(req.id, 'APPROVED')}
                        className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded transition"
                        title="Aprobar"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleStatusChange(req.id, 'REJECTED')}
                        className="p-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded transition"
                        title="Rechazar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Aprobadas */}
          <div className="pt-2">
            <p className="text-xs font-bold text-emerald-400 mb-2 uppercase tracking-wider">
              Días Libres Aprobados ({approvedRequests.length})
            </p>
            {approvedRequests.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No hay días libres confirmados aún.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {approvedRequests.map(req => (
                  <div
                    key={req.id}
                    className="bg-slate-800 border border-emerald-900/60 px-3 py-1.5 rounded text-xs text-slate-300 flex items-center gap-2"
                  >
                    <span>
                      <strong className="text-white">{req.workerName}</strong>: {req.date} ({req.requestType === 'VACATION' ? 'Vacaciones' : 'Libre'})
                    </span>
                    <button
                      onClick={() => handleStatusChange(req.id, 'REJECTED')}
                      className="text-slate-500 hover:text-rose-400 transition"
                      title="Quitar aprobación"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};