import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export default function useMachines() {
  const [maquinas, setMaquinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMaquinas = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('machines').select('*').order('code');
      if (error) setError(error);
      else setMaquinas(data);
      setLoading(false);
    };
    fetchMaquinas();
  }, []);

  return { maquinas, loading, error };
}
