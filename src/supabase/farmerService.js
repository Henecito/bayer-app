import { supabase } from './supabase';

export async function createFarmer(farmerData, userId) {
  try {
    const { name, phone, location, email } = farmerData;

    const { data, error } = await supabase
      .from('farmers')
      .insert([{
        user_id: userId,
        name,
        phone,
        location,
        email,
      }])
      .select('id')
      .single();

    if (error) throw error;

    return data.id;
  } catch (error) {
    console.error('Error al crear farmer:', error);
    throw error;
  }
}
