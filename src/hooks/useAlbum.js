import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const INITIAL_PHOTOS = [
  { id: 'photo-1', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80', caption: 'Our Ceremony Venue', date: '2027-06-20', wedding_id: 'default' },
  { id: 'photo-2', url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80', caption: 'Reception Dinner Tables', date: '2027-06-20', wedding_id: 'default' },
  { id: 'photo-3', url: 'https://images.unsplash.com/photo-1543157148-f68f2d47a622?auto=format&fit=crop&w=800&q=80', caption: 'Bridal Bouquet Floral Highlights', date: '2027-06-20', wedding_id: 'default' },
  { id: 'photo-4', url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80', caption: 'Intertwined Wedding Rings', date: '2027-06-20', wedding_id: 'default' },
  { id: 'photo-5', url: 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=800&q=80', caption: 'Decadent Wedding Cake & Patisserie', date: '2027-06-20', wedding_id: 'default' },
  { id: 'photo-6', url: 'https://images.unsplash.com/photo-1519225495810-7517c300ea97?auto=format&fit=crop&w=800&q=80', caption: 'Pre-wedding photoshoot portraits', date: '2027-06-19', wedding_id: 'default' },
];

export default function useAlbum(weddingId) {
  const [photos, setPhotos] = useState(INITIAL_PHOTOS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getStoragePublicUrl = (storagePath) => {
    try {
      const { data } = supabase.storage.from('wedding-albums').getPublicUrl(storagePath);
      return data?.publicUrl || '';
    } catch (err) {
      console.error('[Supabase Storage] Public URL fetch failed:', err.message);
      return '';
    }
  };

  const fetchPhotos = async () => {
    if (supabase.supabaseUrl.includes('mock.supabase.co')) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // TODO: Connect to Supabase
      const { data, error: fetchErr } = await supabase
        .from('albums')
        .select('*')
        .eq('wedding_id', weddingId)
        .order('date', { ascending: false });

      if (fetchErr) throw fetchErr;

      if (data) {
        // Map database records and dynamically fetch public URL from Storage if the image url looks like a file path
        const mappedData = data.map((photo) => {
          let resolvedUrl = photo.url;
          
          // Check if url is a storage path instead of a direct HTTP URL
          if (resolvedUrl && !resolvedUrl.startsWith('http')) {
            resolvedUrl = getStoragePublicUrl(resolvedUrl);
          }

          return {
            ...photo,
            url: resolvedUrl,
          };
        });
        
        setPhotos(mappedData);
      }
    } catch (err) {
      console.error('[Supabase] Error fetching album photos:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [weddingId]);

  const addPhoto = async (photoData) => {
    const newEntry = {
      ...photoData,
      wedding_id: weddingId,
    };

    const tempId = `photo-temp-${Date.now()}`;
    const optimisticEntry = { id: tempId, ...newEntry };

    setPhotos((prev) => [optimisticEntry, ...prev]);

    if (supabase.supabaseUrl.includes('mock.supabase.co')) {
      return optimisticEntry;
    }

    try {
      // TODO: Connect to Supabase
      const { data, error: insertErr } = await supabase
        .from('albums')
        .insert([newEntry])
        .select();

      if (insertErr) throw insertErr;
      if (data && data[0]) {
        let resolvedUrl = data[0].url;
        if (resolvedUrl && !resolvedUrl.startsWith('http')) {
          resolvedUrl = getStoragePublicUrl(resolvedUrl);
        }
        
        const finalizedPhoto = { ...data[0], url: resolvedUrl };
        setPhotos((prev) => prev.map((p) => (p.id === tempId ? finalizedPhoto : p)));
        return finalizedPhoto;
      }
    } catch (err) {
      console.error('[Supabase] Error adding photo record:', err.message);
      setError(err.message);
      setPhotos((prev) => prev.filter((p) => p.id !== tempId));
      throw err;
    }
  };

  return {
    photos,
    loading,
    error,
    fetchPhotos,
    addPhoto,
  };
}
