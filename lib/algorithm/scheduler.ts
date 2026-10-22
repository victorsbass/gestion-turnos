export interface WorkerProfile {
  id: string;
  fullName: string;
  technicalRole: 'MAIN' | 'GENERAL';
  speaksEnglish: boolean;
  totalMonthlyDaysWorked: number;
}

export interface ShowDay {
  id: string;
  artistName: string;
  date: string; // Formato YYYY-MM-DD
  isInternational: boolean;
  isConsecutiveSeries?: boolean;
  isIntermediateDay?: boolean;
}

export interface ExtraShift {
  id: string;
  shiftType: 'SETUP' | 'OVERNIGHT';
  date: string;
  requiredWorkersCount: number;
}

export interface ScheduledAssignment {
  date: string;
  showId?: string;
  extraShiftId?: string;
  type: 'SHOW' | 'SETUP' | 'OVERNIGHT';
  title: string;
  assignedWorkerIds: string[];
  fohWorkerId?: string;
  alerts: string[];
}

export function calculateMonthlyAssignments(
  workers: WorkerProfile[],
  shows: ShowDay[],
  extraShifts: ExtraShift[],
  approvedTimeOff: Record<string, string[]>
): { assignments: ScheduledAssignment[]; globalAlerts: string[] } {
  const globalAlerts: string[] = [];
  const assignments: ScheduledAssignment[] = [];
  
  // Seguimiento de días trabajados en el mes
  const monthlyWorkload: Record<string, number> = {};
  // Seguimiento del tipo de turno trabajado por fecha (para reglas de descanso)
  const workerDailyShift: Record<string, Record<string, 'SHOW' | 'SETUP' | 'OVERNIGHT'>> = {};

  workers.forEach(w => {
    monthlyWorkload[w.id] = 0;
    workerDailyShift[w.id] = {};
  });

  // Helper para calcular el día anterior (YYYY-MM-DD)
  const getPreviousDateStr = (dateStr: string) => {
    const d = new Date(dateStr);
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  };

  // 1. Procesar Shows
  const sortedShows = [...shows].sort((a, b) => a.date.localeCompare(b.date));

  for (const show of sortedShows) {
    const dayAlerts: string[] = [];
    const prevDateStr = getPreviousDateStr(show.date);
    const targetCount = show.isIntermediateDay ? 3 : 4;

    const availableWorkers = workers.filter(w => {
      const hasTimeOff = approvedTimeOff[w.id]?.includes(show.date);
      const isOverLimit = (monthlyWorkload[w.id] || 0) >= 15;
      
      // Regla: No se puede hacer Overnight el día anterior y Show al día siguiente
      const workedOvernightYesterday = workerDailyShift[w.id]?.[prevDateStr] === 'OVERNIGHT';

      return !hasTimeOff && !isOverLimit && !workedOvernightYesterday;
    });

    if (availableWorkers.length < targetCount) {
      dayAlerts.push(
        `Falta personal (${availableWorkers.length}/${targetCount}). Asignar técnico externo.`
      );
    }

    // Selección de FOH
    let fohCandidates = availableWorkers.filter(w => w.technicalRole === 'MAIN');
    if (show.isInternational) {
      const englishFOH = fohCandidates.filter(w => w.speaksEnglish);
      if (englishFOH.length > 0) fohCandidates = englishFOH;
      else dayAlerts.push(`Show internacional: FOH sin inglés.`);
    }

    fohCandidates.sort((a, b) => (monthlyWorkload[a.id] || 0) - (monthlyWorkload[b.id] || 0));
    const selectedFOH = fohCandidates[0] || availableWorkers[0];

    // Selección del resto
    const generalCandidates = availableWorkers
      .filter(w => w.id !== selectedFOH?.id)
      .sort((a, b) => (monthlyWorkload[a.id] || 0) - (monthlyWorkload[b.id] || 0));

    const selectedGeneral = generalCandidates.slice(0, targetCount - 1);
    const totalAssigned = selectedFOH ? [selectedFOH, ...selectedGeneral] : selectedGeneral;

    totalAssigned.forEach(w => {
      monthlyWorkload[w.id] = (monthlyWorkload[w.id] || 0) + 1;
      workerDailyShift[w.id][show.date] = 'SHOW';
    });

    assignments.push({
      date: show.date,
      showId: show.id,
      type: 'SHOW',
      title: show.artistName,
      assignedWorkerIds: totalAssigned.map(w => w.id),
      fohWorkerId: selectedFOH?.id,
      alerts: dayAlerts
    });
  }

  // 2. Procesar Turnos Extras (Armados / Overnights)
  const sortedExtraShifts = [...extraShifts].sort((a, b) => a.date.localeCompare(b.date));

  for (const extra of sortedExtraShifts) {
    const dayAlerts: string[] = [];

    const availableWorkers = workers
      .filter(w => {
        const hasTimeOff = approvedTimeOff[w.id]?.includes(extra.date);
        const isOverLimit = (monthlyWorkload[w.id] || 0) >= 15;
        // No asignar si ya trabaja en un show ese mismo día
        const alreadyWorkingToday = !!workerDailyShift[w.id]?.[extra.date];
        return !hasTimeOff && !isOverLimit && !alreadyWorkingToday;
      })
      .sort((a, b) => (monthlyWorkload[a.id] || 0) - (monthlyWorkload[b.id] || 0));

    const assigned = availableWorkers.slice(0, extra.requiredWorkersCount);

    if (assigned.length < extra.requiredWorkersCount) {
      dayAlerts.push(`Turno Extra en ${extra.date}: Falta personal requerido.`);
    }

    assigned.forEach(w => {
      monthlyWorkload[w.id] = (monthlyWorkload[w.id] || 0) + 1;
      workerDailyShift[w.id][extra.date] = extra.shiftType;
    });

    assignments.push({
      date: extra.date,
      extraShiftId: extra.id,
      type: extra.shiftType,
      title: extra.shiftType === 'SETUP' ? 'Armado / Setup' : 'Turno Overnight',
      assignedWorkerIds: assigned.map(w => w.id),
      alerts: dayAlerts
    });
  }

  // Ordenar la grilla final cronológicamente
  assignments.sort((a, b) => a.date.localeCompare(b.date));

  return { assignments, globalAlerts };
}