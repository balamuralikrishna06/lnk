import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

// No mock data stored here

export default function useGifts(weddingId) {
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchGifts = async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Connect to Supabase
      const { data, error: fetchErr } = await supabase
        .from('gifts')
        .select('*')
        .eq('wedding_id', weddingId)
        .order('created_at', { ascending: false });

      if (fetchErr) throw fetchErr;
      if (data) {
        setGifts(data);
      }
    } catch (err) {
      console.error('[Supabase] Error fetching gifts:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGifts();
  }, [weddingId]);

  const addGift = async (giftData) => {
    const newEntry = {
      ...giftData,
      wedding_id: weddingId,
    };

    const tempId = `gift-temp-${Date.now()}`;
    const optimisticEntry = { id: tempId, ...newEntry };

    // Optimistic Update
    setGifts((prev) => [optimisticEntry, ...prev]);



    try {
      // TODO: Connect to Supabase
      const { data, error: insertErr } = await supabase
        .from('gifts')
        .insert([newEntry])
        .select();

      if (insertErr) throw insertErr;
      if (data && data[0]) {
        setGifts((prev) => prev.map((g) => (g.id === tempId ? data[0] : g)));
        return data[0];
      }
    } catch (err) {
      console.error('[Supabase] Error adding gift:', err.message);
      setError(err.message);
      setGifts((prev) => prev.filter((g) => g.id !== tempId));
      throw err;
    }
  };

  const toggleThankYouStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'pending' ? 'sent' : 'pending';

    setGifts((prev) =>
      prev.map((g) => (g.id === id ? { ...g, thank_you_status: nextStatus } : g))
    );



    try {
      // TODO: Connect to Supabase
      const { error: updateErr } = await supabase
        .from('gifts')
        .update({ thank_you_status: nextStatus })
        .eq('id', id)
        .eq('wedding_id', weddingId);

      if (updateErr) throw updateErr;
    } catch (err) {
      console.error('[Supabase] Error updating thank you status:', err.message);
      setError(err.message);
      setGifts((prev) =>
        prev.map((g) => (g.id === id ? { ...g, thank_you_status: currentStatus } : g))
      );
      throw err;
    }
  };

  return {
    gifts,
    loading,
    error,
    fetchGifts,
    addGift,
    toggleThankYouStatus,
  };
}
