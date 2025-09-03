// supabase/reservasData.js
import { supabase } from './supabase';

export async function getMODELOS_MAQUINAS() {
  try {
    const { data, error } = await supabase
      .from('machines')
      .select('model, description');

    if (error) throw error;

    const modelosMap = new Map();

    data.forEach((row) => {
      const modelId = row.model;
      if (!modelosMap.has(modelId)) {
        modelosMap.set(modelId, {
          id: modelId,
          nombre: modelId,
          descripcion: row.description || 'Sin descripción',
          icono: 'construct-outline',
        });
      }
    });

    return Array.from(modelosMap.values());
  } catch (error) {
    console.error('Error al obtener modelos desde Supabase:', error);
    return [];
  }
}

export async function getMAQUINAS_DISPONIBLES() {
  try {
    const { data, error } = await supabase
      .from('machines')
      .select('model, code, status');

    if (error) throw error;

    const grouped = {};

    data
    .filter((item) => item.status !== false)
    .forEach((item) => {
      const modeloId = item.model;
      if (!grouped[modeloId]) grouped[modeloId] = [];

      grouped[modeloId].push({
        codigo: item.code,
        estado: 'Disponible',
      });
    });

    return grouped;
  } catch (error) {
    console.error('Error al obtener máquinas desde Supabase:', error);
    return {};
  }
}
