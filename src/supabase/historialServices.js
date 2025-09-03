import { supabase } from "./supabase";

export async function getHistorialReservas(userId) {
  if (!userId)
    throw new Error("El userId es obligatorio para obtener historial");

  // Paso 1: Obtener el perfil del usuario actual para saber su rol
  const { data: perfilActual, error: errorPerfil } = await supabase
    .from("profiles")
    .select("id, rol") 
    .eq("id", userId)
    .single();

  if (errorPerfil) {
    console.error("Error obteniendo perfil usuario actual:", errorPerfil);
    throw errorPerfil;
  }
  console.log("Perfil actual del usuario:", perfilActual);

  let query = supabase
    .from("reservations")
    .select("*, farmer:farmer_id(*)")
    .order("createdAt", { ascending: false });

  // Paso 2: Si no es admin, filtrar solo reservas del usuario
  if (perfilActual.rol === "admin") {
    // Admin ve todo, no filtramos
  } else if (perfilActual.rol === "zonal") {
    // Zonal ve solo sus reservas
    query = query.eq("user_id", userId);
  } else {
    // Otros roles, también solo sus reservas (o lo que decidas)
    query = query.eq("user_id", userId);
  }

  // Paso 3: Obtener reservas filtradas o todas si es admin
  const { data: reservas, error: errorReservas } = await query;

  if (errorReservas) {
    console.error("Error obteniendo historial:", errorReservas);
    throw errorReservas;
  }

  // Paso 4: Extraer user_id únicos para consultar perfiles
  const userIds = [...new Set(reservas.map((r) => r.user_id))];

  // Paso 5: Obtener perfiles de esos user_id para mostrar datos de supervisores
  const { data: perfiles, error: errorPerfiles } = await supabase
    .from("profiles")
    .select("id, nombre, apellido, email, rol")
    .in("id", userIds);

  if (errorPerfiles) {
    console.error("Error obteniendo perfiles:", errorPerfiles);
    throw errorPerfiles;
  }

  // Paso 6: Mapear perfiles por id para acceso rápido
  const perfilesMap = {};
  perfiles.forEach((perfil) => {
    perfilesMap[perfil.id] = perfil;
  });

  // Paso 7: Construir resultado combinando reserva + perfil usuario
  return reservas.map((reserva) => ({
    id: reserva.id,
    estado: reserva.status,
    fechaInicio: reserva.startDate,
    fechaFin: reserva.endDate,
    litros: reserva.liters,
    duracion: reserva.duration,
    maquina: {
      nombre: reserva.machine?.model || "Desconocido",
      codigo: reserva.machine?.code || "-",
      icono: "construct-outline",
    },
    agricultor: {
      nombre: reserva.farmer?.name || "Sin nombre",
      telefono: reserva.farmer?.phone || "Sin teléfono",
      ubicacion: reserva.farmer?.location || "Sin ubicación",
      coordenadas: null,
    },
    supervisor: {
      nombre: perfilesMap[reserva.user_id]
        ? `${perfilesMap[reserva.user_id].nombre} ${
            perfilesMap[reserva.user_id].apellido
          }`
        : "-",
      correo: perfilesMap[reserva.user_id]?.email || "-",
    },
  }));
}

export async function updateEstadoReserva(reservaId, nuevoEstado, userId) {
  // Obtener rol del usuario que quiere actualizar
  const { data: perfilActual, error: errorPerfil } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id", userId)
    .single();

  if (errorPerfil) {
    console.error("Error obteniendo perfil usuario actual:", errorPerfil);
    throw errorPerfil;
  }

  if (perfilActual.rol !== "admin") {
    throw new Error("Solo administradores pueden actualizar el estado de la reserva");
  }

  // Si es admin, permitir actualización
  const { error } = await supabase
    .from("reservations")
    .update({ status: nuevoEstado })
    .eq("id", reservaId);

  if (error) {
    console.error(`Error actualizando estado de reserva ${reservaId}:`, error);
    throw error;
  }

  return true;
}

