'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { UserPlus, X } from 'lucide-react';

interface AddWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkerAdded: () => void;
}

export const AddWorkerModal: React.FC<AddWorkerModalProps> = ({ isOpen, onClose, onWorkerAdded }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [technicalRole, setTechnicalRole] = useState<'MAIN' | 'GENERAL'>('GENERAL');
  const [speaksEnglish, setSpeaksEnglish] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    // ID temporal para pruebas o integración con auth
    const fakeAuthId = crypto.randomUUID();

    const { error } = await supabase.from('profiles').insert([
      {
        id: fakeAuthId,
        full_name: fullName,
        email: email,
        technical_role: technicalRole,
        speaks_english: speaksEnglish,
        role_type: 'WORKER',
        is_active: true
      }
    ]);

    setLoading(false);

    if (error) {
      setErrorMsg('Error al guardar el empleado: ' + error.message);
    } else {
      setFullName('');
      setEmail('');
      setTechnicalRole('GENERAL');
      setSpeaksEnglish(false);
      onWorkerAdded();
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
          <UserPlus className="text-blue-500" /> Nuevo Empleado Técnico
        </h2>

        {errorMsg && (
          <div className="mb-4 text-xs bg-rose-950/60 border border-rose-800 text-rose-300 p-2.5 rounded">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Nombre Completo</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              placeholder="Ej: Martín Rodríguez"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Correo Electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              placeholder="martin@ejemplo.com"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Rol Técnico</label>
            <select
              value={technicalRole}
              onChange={e => setTechnicalRole(e.target.value as 'MAIN' | 'GENERAL')}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="GENERAL">Técnico General</option>
              <option value="MAIN">Encargado (FOH / Main)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="english"
              checked={speaksEnglish}
              onChange={e => setSpeaksEnglish(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-0"
            />
            <label htmlFor="english" className="text-xs text-slate-300 font-medium">
              Dominio de Inglés (Apto para shows internacionales)
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
              className="w-1/2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold py-2 rounded-lg transition"
            >
              {loading ? 'Guardando...' : 'Guardar Empleado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};