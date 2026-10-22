'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Clock, X } from 'lucide-react';

interface AddExtraShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShiftAdded: () => void;
}

export const AddExtraShiftModal: React.FC<AddExtraShiftModalProps> = ({ isOpen, onClose, onShiftAdded }) => {
  const [shiftType, setShiftType] = useState<'SETUP' | 'OVERNIGHT'>('SETUP');
  const [date, setDate] = useState('');
  const [requiredWorkers, setRequiredWorkers] = useState(1);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('extra_shifts').insert([
      {
        shift_type: shiftType,
        date: date,
        required_workers_count: requiredWorkers
      }
    ]);

    setLoading(false);

    if (!error) {
      setDate('');
      setRequiredWorkers(1);
      setShiftType('SETUP');
      onShiftAdded();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 text-slate-100 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-white">
          <Clock className="text-purple-400" /> Nuevo Turno Extra
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Tipo de Turno</label>
            <select
              value={shiftType}
              onChange={e => setShiftType(e.target.value as 'SETUP' | 'OVERNIGHT')}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="SETUP">Día de Armado (Setup)</option>
              <option value="OVERNIGHT">Turno Overnight</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Fecha</label>
            <input
              type="date"
              required
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Cantidad de Técnicos Necesarios</label>
            <input
              type="number"
              min="1"
              max="10"
              value={requiredWorkers}
              onChange={e => setRequiredWorkers(parseInt(e.target.value) || 1)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium py-2 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-1/2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-semibold py-2 rounded-lg transition"
            >
              {loading ? 'Guardando...' : 'Cargar Turno Extra'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};