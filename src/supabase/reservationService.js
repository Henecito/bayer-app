import { supabase } from './supabase';
import { parseISO, isBefore, isAfter, addDays, getDay, startOfWeek } from 'date-fns';
import { createFarmer } from './farmerService';

export const RESERVATION_LIMITS = {
  MAX_STARTS_PER_DAY: 3,
  MAX_STARTS_PER_WEEK: 15,
  MAX_ENDS_PER_DAY: 3,
};

export async function getAllReservations() {
  try {
    const { data, error } = await supabase.from('reservations').select('*');

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error al obtener reservas desde Supabase:', error);
    throw error;
  }
}

export async function validateReservation(newReservation) {
  const all = await getAllReservations();
  const { startDate, endDate } = newReservation;

  const newStart = parseISO(startDate);
  const newEnd = parseISO(endDate);

  const overlapping = all.some((r) => {
    return (
      r.machine.code === newReservation.machine.code &&
      !(parseISO(r.endDate) < newStart || parseISO(r.startDate) > newEnd)
    );
  });

  if (overlapping) {
    throw new Error("Ya existe una reserva que se solapa con las fechas.");
  }

  const sameDayStarts = all.filter((r) => r.startDate === startDate).length;
  if (sameDayStarts >= RESERVATION_LIMITS.MAX_STARTS_PER_DAY) {
    throw new Error(`Ya hay ${sameDayStarts} reservas para el día ${startDate}.`);
  }

  const startWeek = startOfWeek(newStart, { weekStartsOn: 1 })
    .toISOString()
    .split("T")[0];
  const startsInWeek = all.filter((r) => {
    const s = parseISO(r.startDate);
    return (
      startOfWeek(s, { weekStartsOn: 1 }).toISOString().split("T")[0] ===
      startWeek
    );
  }).length;

  if (startsInWeek >= RESERVATION_LIMITS.MAX_STARTS_PER_WEEK) {
    throw new Error(`Límite semanal alcanzado para la semana del ${startWeek}.`);
  }

  const sameDayEnds = all.filter((r) => r.endDate === endDate).length;
  if (sameDayEnds >= RESERVATION_LIMITS.MAX_ENDS_PER_DAY) {
    throw new Error(`Ya hay ${sameDayEnds} entregas para el día ${endDate}.`);
  }

  return true;
}

export async function createReservation(data, userId) {
  try {
    await validateReservation(data);

    // Paso 1: Crear farmer sin validación previa
    const farmerId = await createFarmer(data.farmer, userId);

    // Paso 2: Insertar la reserva asociada al user y al farmer
    const { error } = await supabase.from('reservations').insert({
      user_id: userId,
      farmer_id: farmerId,
      status: 'Pendiente',
      liters: data.liters,
      startDate: data.startDate,
      endDate: data.endDate,
      duration: data.duration,
      machine: data.machine,
      createdAt: new Date().toISOString(),
    });

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error al crear reserva en Supabase:', error);
    throw error;
  }
}

export function isMachineCodeOccupied(code, fechaInicio, fechaFin, reservasActivas) {
  const inicio = parseISO(fechaInicio);
  const fin = parseISO(fechaFin);

  return reservasActivas.some((r) => {
    const machineCode = r.machine?.code || r.machine?.codigo;
    if (!machineCode || machineCode !== code) return false;

    const rStart = parseISO(r.startDate);
    let rEnd = parseISO(r.endDate);

    const diaSiguiente = addDays(rEnd, 1);
    const esDiaHabil = getDay(diaSiguiente) >= 1 && getDay(diaSiguiente) <= 5;

    if (esDiaHabil) {
      rEnd = diaSiguiente;
    }

    return !(isBefore(fin, rStart) || isAfter(inicio, rEnd));
  });
}


export function getCodigosDisponiblesPorModelo(
  maquinasDelModelo,
  fechaInicio,
  fechaFin,
  reservasActivas
) {
  return maquinasDelModelo.filter((maquina) => {
    return !isMachineCodeOccupied(
      maquina.codigo,
      fechaInicio,
      fechaFin,
      reservasActivas
    );
  });
}
