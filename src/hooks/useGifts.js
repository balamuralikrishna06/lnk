import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const INITIAL_GIFTS = [
  { id: 'gift-1', donor_name: 'Eleanor & James Wright', gift_type: 'cash', amount: 500, gift_name: '$500', thank_you_status: 'pending', registry_item_name: 'Honeymoon Fund', created_at: '2026-05-30T10:15:00Z', wedding_id: 'default' },
  { id: 'gift-2', donor_name: 'The Smith Family', gift_type: 'physical', amount: null, gift_name: 'Espresso Machine', thank_you_status: 'pending', registry_item_name: 'Registry Item', created_at: '2026-05-29T16:45:00Z', wedding_id: 'default' },
  { id: 'gift-3', donor_name: 'Aunt Martha', gift_type: 'cash', amount: 250, gift_name: '$250', thank_you_status: 'sent', registry_item_name: 'Honeymoon Fund', created_at: '2026-05-28T09:30:00Z', wedding_id: 'default' },
  { id: 'gift-4', donor_name: 'The Davidson Cousins', gift_type: 'cash', amount: 1200, gift_name: '$1,200', thank_you_status: 'sent', registry_item_name: 'Honeymoon Fund', created_at: '2026-05-27T14:20:00Z', wedding_id: 'default' },
  { id: 'gift-5', donor_name: 'Parents of the Bride', gift_type: 'cash', amount: 10000, gift_name: '$10,000', thank_you_status: 'pending', registry_item_name: 'Honeymoon Fund', created_at: '2026-05-26T11:05:00Z', wedding_id: 'default' },
  { id: 'gift-6', donor_name: 'Sarah & Michael Green', gift_type: 'physical', amount: null, gift_name: 'KitchenAid Stand Mixer', thank_you_status: 'sent', registry_item_name: 'Kitchen Registry', created_at: '2026-05-25T18:00:00Z', wedding_id: 'default' }
];

export default function useGifts(weddingId) {
  const [gifts, setGifts] = useState(INITIAL_GIFTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchGifts = async () => {
    if (supabase.supabaseUrl.includes('mock.supabase.co')) {
      return;
    }

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

    if (supabase.supabaseUrl.includes('mock.supabase.co')) {
      return optimisticEntry;
    }

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

    if (supabase.supabaseUrl.includes('mock.supabase.co')) {
      return;
    }

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
