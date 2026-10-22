'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { ScheduleGrid, ShiftCard } from '@/components/ScheduleGrid';
import { ExportButtons } from '@/components/ExportButtons';
import { AddWorkerModal } from '@/components/AddWorkerModal';
import { AddShowModal } from '@/components/AddShowModal';
import { AddExtraShiftModal } from '@/components/AddExtraShiftModal';
import { TimeOffManager, TimeOffRecord } from '@/components/TimeOffManager';
import { calculateMonthlyAssignments, WorkerProfile, ShowDay, ExtraShift } from '@/lib/algorithm/scheduler';
import { Play, Users, CalendarDays, UserPlus, CalendarPlus, Clock } from 'lucide-react';

export default function Home() {
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [shows, setShows] = useState<ShowDay[]>([]);
  const [extraShifts, setExtraShifts] = useState<ExtraShift[]>([]);
  const [timeOffRequests, setTimeOffRequests] = useState<TimeOffRecord[]>([]);
  const [shifts, setShifts] = useState<ShiftCard[]>([]);
  const [isCalculated, setIsCalculated] = useState(false);

  // Modales
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [isShowModalOpen, setIsShowModalOpen] = useState(false);
  const [isExtraModalOpen, setIsExtraModalOpen] = useState(false);

  // Cargar todos los datos desde Supabase
  const fetchData = async () => {
    // 1. Empleados
    const { data: dbProfiles } = await supabase.from('profiles').select('*').eq('is_active', true);
    let mappedWorkers: WorkerProfile[] = [];
    if (dbProfiles) {
      mappedWorkers = dbProfiles.map(p => ({
        id: p.id,
        fullName: p.full_name,
        technicalRole: p.technical_role,
        speaksEnglish: p.speaks_english,
        totalMonthlyDaysWorked: 0
      }));
      setWorkers(mappedWorkers);
    }

    // 2. Shows
    const { data: dbShows } = await supabase.from('shows').select('*');
    if (dbShows) {
      setShows(
        dbShows.map(s => ({
          id: s.id,
          artistName: s.artist_name,
          date: s.start_date,
          isInternational: s.is_international,
          isConsecutiveSeries: false,
          isIntermediateDay: false
        }))
      );
    }

    // 3. Turnos Extras
    const { data: dbExtras } = await supabase.from('extra_shifts').select('*');
    if (dbExtras) {
      setExtraShifts(
        dbExtras.map(e => ({
          id: e.id,
          shiftType: e.shift_type,
          date: e.date,
          requiredWorkersCount: e.required_workers_count
        }))
      );
    }

    // 4. Solicitudes de Días Libres y Vacaciones
    const { data: dbTimeOff } = await supabase.from('time_off_requests').select('*');
    if (dbTimeOff) {
      const mappedTimeOff: TimeOffRecord[] = dbTimeOff.map(t => {
        const worker = mappedWorkers.find(w => w.id === t.worker_id);
        return {
          id: t.id,
          workerId: t.worker_id,
          workerName: worker ? worker.fullName : 'Técnico',
          date: t.date,
          requestType: t.request_type,
          status: t.status
        };
      });
      setTimeOffRequests(mappedTimeOff);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Construir objeto mapeado de días aprobados por trabajador { workerId: ['YYYY-MM-DD', ...] }
  const getApprovedTimeOffMap = (): Record<string, string[]> => {
    const timeOffMap: Record<string, string[]> = {};
    timeOffRequests
      .filter(r => r.status === 'APPROVED')
      .forEach(r => {
        if (!timeOffMap[r.workerId]) {
          timeOffMap[r.workerId] = [];
        }
        timeOffMap[r.workerId].push(r.date);
      });
    return timeOffMap;
  };

  const handleRunAutoAssign = () => {
    if (workers.length === 0) {
      alert('Debes agregar al menos 1 empleado activo.');
      return;
    }

    const approvedTimeOffMap = getApprovedTimeOffMap();
    const { assignments } = calculateMonthlyAssignments(workers, shows, extraShifts, approvedTimeOffMap);

    const formattedShifts: ShiftCard[] = assignments.map(a => {
      const foh = workers.find(w => w.id === a.fohWorkerId);
      const workerNames = a.assignedWorkerIds.map(
        id => workers.find(w => w.id === id)?.fullName || 'Técnico'
      );

      return {
        date: a.date,
        title: a.title,
        type: a.type,
        assignedWorkers: workerNames,
        fohName: foh?.fullName,
        alerts: a.alerts
      };
    });

    setShifts(formattedShifts);
    setIsCalculated(true);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Cabecera Principal */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 p-6 rounded-xl border border-slate-800">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <CalendarDays className="text-blue-500" /> Control de Turnos
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Asignación automatizada de shows, armados y overnights
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsWorkerModalOpen(true)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-2 rounded-lg border border-slate-700 transition"
            >
              <UserPlus className="w-4 h-4 text-blue-400" /> + Técnico
            </button>

            <button
              onClick={() => setIsShowModalOpen(true)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-2 rounded-lg border border-slate-700 transition"
            >
              <CalendarPlus className="w-4 h-4 text-amber-400" /> + Show
            </button>

            <button
              onClick={() => setIsExtraModalOpen(true)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-2 rounded-lg border border-slate-700 transition"
            >
              <Clock className="w-4 h-4 text-purple-400" /> + Turno Extra
            </button>

            <button
              onClick={handleRunAutoAssign}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2 rounded-lg transition shadow-lg"
            >
              <Play className="w-4 h-4 fill-current" /> Calcular Turnos
            </button>

            {isCalculated && (
              <ExportButtons shifts={shifts} elementIdToExport="schedule-container" />
            )}
          </div>
        </header>

        {/* Resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
            <Users className="text-blue-400 w-8 h-8" />
            <div>
              <p className="text-xs text-slate-400">Técnicos Activos</p>
              <p className="text-xl font-bold">{workers.length}</p>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
            <CalendarDays className="text-amber-400 w-8 h-8" />
            <div>
              <p className="text-xs text-slate-400">Eventos en Agenda</p>
              <p className="text-xl font-bold">{shows.length + extraShifts.length}</p>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
            <Clock className="text-purple-400 w-8 h-8" />
            <div>
              <p className="text-xs text-slate-400">Turnos Extras Cargados</p>
              <p className="text-xl font-bold">{extraShifts.length}</p>
            </div>
          </div>
        </div>

        {/* Panel de Solicitudes de Días Libres */}
        <TimeOffManager requests={timeOffRequests} onRequestUpdated={fetchData} />

        {/* Grilla Principal */}
        <div id="schedule-container">
          {shifts.length > 0 ? (
            <ScheduleGrid monthName="Grilla General" shifts={shifts} />
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400 space-y-2">
              <p className="text-base font-medium text-slate-300">No hay turnos calculados en pantalla.</p>
              <p className="text-xs text-slate-500">Agrega técnicos, shows o turnos extras y haz clic en "Calcular Turnos".</p>
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      <AddWorkerModal
        isOpen={isWorkerModalOpen}
        onClose={() => setIsWorkerModalOpen(false)}
        onWorkerAdded={fetchData}
      />
      <AddShowModal
        isOpen={isShowModalOpen}
        onClose={() => setIsShowModalOpen(false)}
        onShowAdded={fetchData}
      />
      <AddExtraShiftModal
        isOpen={isExtraModalOpen}
        onClose={() => setIsExtraModalOpen(false)}
        onShiftAdded={fetchData}
      />
    </main>
  );
}