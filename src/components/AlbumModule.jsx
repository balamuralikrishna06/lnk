import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabase';

const INITIAL_PHOTOS = [
  {
    id: 'photo-1',
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    caption: 'Our Ceremony Venue',
    date: '2027-06-20',
  },
  {
    id: 'photo-2',
    url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
    caption: 'Reception Dinner Tables',
    date: '2027-06-20',
  },
  {
    id: 'photo-3',
    url: 'https://images.unsplash.com/photo-1543157148-f68f2d47a622?auto=format&fit=crop&w=800&q=80',
    caption: 'Bridal Bouquet Floral Highlights',
    date: '2027-06-20',
  },
  {
    id: 'photo-4',
    url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80',
    caption: 'Intertwined Wedding Rings',
    date: '2027-06-20',
  },
  {
    id: 'photo-5',
    url: 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=800&q=80',
    caption: 'Decadent Wedding Cake & Patisserie',
    date: '2027-06-20',
  },
  {
    id: 'photo-6',
    url: 'https://images.unsplash.com/photo-1519225495810-7517c300ea97?auto=format&fit=crop&w=800&q=80',
    caption: 'Pre-wedding photoshoot portraits',
    date: '2027-06-19',
  },
];

const MOCK_PRESET_IMAGES = [
  'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1520854221256-17451cc35953?auto=format&fit=crop&w=800&q=80',
];

export default function AlbumModule({ photos, setPhotos, isAddPhotoOpen, setIsAddPhotoOpen }) {
  const [photoUrl, setPhotoUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // TODO: Connect to Supabase
  // Uncomment lines below to query photos table from Supabase
  /*
  useEffect(() => {
    async function fetchPhotos() {
      try {
        const { data, error } = await supabase
          .from('photos')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        if (data && data.length > 0) {
          setPhotos(data);
        }
      } catch (err) {
        console.error('Error fetching photos from Supabase:', err.message);
      }
    }
    fetchPhotos();
  }, []);
  */

  const handleAddPhoto = async (e) => {
    e.preventDefault();

    // Default to a gorgeous preset image if none is provided
    const finalUrl = photoUrl.trim() || MOCK_PRESET_IMAGES[Math.floor(Math.random() * MOCK_PRESET_IMAGES.length)];

    const newPhoto = {
      url: finalUrl,
      caption: caption || 'Wedding Moment',
      date,
    };

    const localPhoto = {
      id: `photo-${Date.now()}`,
      ...newPhoto,
    };

    // Optimistic Update
    setPhotos((prev) => [localPhoto, ...prev]);

    // Reset Form
    setPhotoUrl('');
    setCaption('');
    setIsAddPhotoOpen(false);

    // TODO: Connect to Supabase
    // Uncomment lines below to upload new photos details to Supabase table
    /*
    try {
      const { data, error } = await supabase
        .from('photos')
        .insert([newPhoto])
        .select();
      if (error) throw error;
      if (data && data[0]) {
        setPhotos((prev) => prev.map((p) => (p.id === localPhoto.id ? data[0] : p)));
      }
    } catch (err) {
      console.error('Error uploading photo to Supabase:', err.message);
      setPhotos((prev) => prev.filter((p) => p.id !== localPhoto.id));
    }
    */
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
      >
        <div>
          <h2 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-2">
            Wedding Album
          </h2>
          <p className="font-body-lg text-body-lg text-secondary max-w-2xl">
            Save and share snapshot highlights of your wedding ceremonies, decorations, and parties.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsAddPhotoOpen(true)}
          className="w-full md:w-auto px-6 py-3 bg-[#2D2D2D] text-white rounded-lg font-label-md text-label-md hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span>
          Add Photo
        </motion.button>
      </motion.div>

      {/* Masonry Image Gallery Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4"
      >
        <AnimatePresence mode="popLayout">
          {photos.map((photo) => (
            <motion.div
              key={photo.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              whileHover={{ scale: 1.02 }}
              className="break-inside-avoid bg-white border border-[#2d2d2d]/10 rounded-xl overflow-hidden shadow-sm hover:card-shadow transition-shadow duration-300 relative group"
            >
              <img
                src={photo.url}
                alt={photo.caption}
                loading="lazy"
                className="w-full object-cover max-h-[460px] select-none"
              />
              <div className="p-4 bg-white/90 backdrop-blur-xs border-t border-on-surface/5 flex flex-col justify-between">
                <p className="font-body-md text-body-md font-semibold text-[#2d2d2d] leading-tight">
                  {photo.caption}
                </p>
                <div className="flex justify-between items-center mt-2 text-caption text-secondary">
                  <span>{photo.date}</span>
                  <span className="material-symbols-outlined text-[16px] text-primary">favorite</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Add Photo Modal overlay */}
      <AnimatePresence>
        {isAddPhotoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddPhotoOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="relative w-full max-w-md bg-background border border-on-surface/10 rounded-xl p-8 card-shadow z-10 text-on-surface"
            >
              <button
                onClick={() => setIsAddPhotoOpen(false)}
                className="absolute top-4 right-4 text-secondary hover:text-on-surface transition-colors"
                aria-label="Close"
              >
                <span className="material-symbols-outlined">close</span>
              </button>

              <h3 className="font-headline-md text-headline-md mb-6">Add Photo to Gallery</h3>

              <form onSubmit={handleAddPhoto} className="space-y-5">
                <div>
                  <label className="block font-label-md text-label-md uppercase tracking-wider text-secondary mb-2">
                    Image URL (Leave empty for a random wedding image)
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="w-full bg-white border border-on-surface/10 rounded-lg px-4 py-3 text-body-md focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-label-md text-label-md uppercase tracking-wider text-secondary mb-2">
                    Caption Description
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Wedding Cake Cutting"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full bg-white border border-on-surface/10 rounded-lg px-4 py-3 text-body-md focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-label-md text-label-md uppercase tracking-wider text-secondary mb-2">
                    Date Capture
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-white border border-on-surface/10 rounded-lg px-4 py-3 text-body-md focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="flex gap-4 pt-4 border-t border-on-surface/5">
                  <button
                    type="button"
                    onClick={() => setIsAddPhotoOpen(false)}
                    className="flex-1 py-3 border border-[#2D2D2D]/20 rounded-lg font-label-md text-label-md text-[#2D2D2D] hover:bg-surface-variant transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex-1 py-3 bg-[#2D2D2D] text-white rounded-lg font-label-md text-label-md hover:bg-opacity-90 transition-opacity"
                  >
                    Upload Image
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
