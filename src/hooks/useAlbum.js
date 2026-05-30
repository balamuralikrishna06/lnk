import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

// No mock data stored here

export default function useAlbum(weddingId) {
  const [photos, setPhotos] = useState([]);
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
