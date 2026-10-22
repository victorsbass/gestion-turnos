'use client';

import React, { useState } from 'react';
import { Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function WorkerRequestsPage() {
  const [selectedDate, setSelectedDate] = useState('');
  const [requestType, setRequestType] = useState<'DAY_OFF' | 'VACATION'>('DAY_OFF');
  const [submitted, setSubmitted] = useState(false);

  // Validación de la ventana temporal (-10 a -5 días previos al inicio de mes)
  const checkWindowActive = () => {
    const today = new Date();
    const currentDay = today.getDate();
    // Ventana permitida: del día 21 al día 26 del mes
    return currentDay >= 21 && currentDay <= 26;
  };

  const isWindowActive = checkWindowActive();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 max-w-md mx-auto">
      <header className="mb-6 border-b border-slate-800 pb-4 mt-2">
        <h1 className="text-xl font-bold flex items-center gap-2 text-white">
          <Calendar className="text-blue-500" /> Solicitud de Días Libres
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Carga tus días pedidos antes del cierre de ventana
        </p>
      </header>

      {/* Estado de la Ventana */}
      <div className={`p-3.5 rounded-xl border mb-6 flex items-start gap-2.5 text-xs ${
        isWindowActive 
          ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' 
          : 'bg-amber-950/40 border-amber-800 text-amber-300'
      }`}>
        {isWindowActive ? (
          <>
            <Clock className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Ventana de Solicitudes Abierta</p>
              <p className="opacity-90">Puedes cargar o editar tus días seleccionados.</p>
            </div>
          </>
        ) : (
          <>
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Ventana Cerrada</p>
              <p className="opacity-90">Las solicitudes se habilitan del 21 al 26 de cada mes. Para cambios fuera de término contacta al administrador.</p>
            </div>
          </>
        )}
      </div>

      {submitted ? (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl text-center space-y-3">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
          <h2 className="text-lg font-bold text-white">¡Solicitud Registrada!</h2>
          <p className="text-xs text-slate-400">
            Tu día solicitado fue enviado al sistema para el cálculo de la grilla mensual.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="w-full bg-slate-800 hover:bg-slate-700 text-xs py-2 rounded-lg font-medium transition"
          >
            Cargar otra fecha
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Seleccionar Fecha
            </label>
            <input
              type="date"
              disabled={!isWindowActive}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Tipo de Solicitud
            </label>
            <select
              disabled={!isWindowActive}
              value={requestType}
              onChange={(e) => setRequestType(e.target.value as 'DAY_OFF' | 'VACATION')}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
            >
              <option value="DAY_OFF">Día Libre Puntual</option>
              <option value="VACATION">Período de Vacaciones</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={!isWindowActive}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold text-sm py-2.5 rounded-lg transition"
          >
            Guardar Solicitud
          </button>
        </form>
      )}
    </main>
  );
}