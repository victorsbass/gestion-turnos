'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { CalendarPlus, X } from 'lucide-react';

interface AddShowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowAdded: () => void;
}

export const AddShowModal: React.FC<AddShowModalProps> = ({ isOpen, onClose, onShowAdded }) => {
  const [title, setTitle] = useState('');
  const [artistName, setArtistName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isInternational, setIsInternational] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('shows').insert([
      {
        title: title || artistName,
        artist_name: artistName,
        start_date: startDate,
        end_date: endDate || startDate,
        is_international: isInternational
      }
    ]);

    setLoading(false);

    if (!error) {
      setTitle('');
      setArtistName('');
      setStartDate('');
      setEndDate('');
      setIsInternational(false);
      onShowAdded();
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
          <CalendarPlus className="text-amber-500" /> Nuevo Show en Agenda
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Nombre del Artista / Producción</label>
            <input
              type="text"
              required
              value={artistName}
              onChange={e => setArtistName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              placeholder="Ej: Fuerza Bruta"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Fecha Inicio</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Fecha Fin</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="intl"
              checked={isInternational}
              onChange={e => setIsInternational(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-0"
            />
            <label htmlFor="intl" className="text-xs text-slate-300 font-medium">
              Show Internacional (Requiere FOH bilingüe)
            </label>
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
              className="w-1/2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-sm font-semibold py-2 rounded-lg transition"
            >
              {loading ? 'Guardando...' : 'Cargar Show'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};