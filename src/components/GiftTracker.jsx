import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabase';
import GiftFormModal from './GiftFormModal';

// Mock Payload matching original HTML designs with precise numbers
const INITIAL_GIFTS = [
  {
    id: 'gift-1',
    donor_name: 'Eleanor & James Wright',
    gift_type: 'cash',
    amount: 500,
    gift_name: '$500',
    thank_you_status: 'pending',
    registry_item_name: 'Honeymoon Fund',
    created_at: '2026-05-30T10:15:00Z',
  },
  {
    id: 'gift-2',
    donor_name: 'The Smith Family',
    gift_type: 'physical',
    amount: null,
    gift_name: 'Espresso Machine',
    thank_you_status: 'pending',
    registry_item_name: 'Registry Item',
    created_at: '2026-05-29T16:45:00Z',
  },
  {
    id: 'gift-3',
    donor_name: 'Aunt Martha',
    gift_type: 'cash',
    amount: 250,
    gift_name: '$250',
    thank_you_status: 'sent',
    registry_item_name: 'Honeymoon Fund',
    created_at: '2026-05-28T09:30:00Z',
  },
  {
    id: 'gift-4',
    donor_name: 'The Davidson Cousins',
    gift_type: 'cash',
    amount: 1200,
    gift_name: '$1,200',
    thank_you_status: 'sent',
    registry_item_name: 'Honeymoon Fund',
    created_at: '2026-05-27T14:20:00Z',
  },
  {
    id: 'gift-5',
    donor_name: 'Parents of the Bride',
    gift_type: 'cash',
    amount: 10000,
    gift_name: '$10,000',
    thank_you_status: 'pending',
    registry_item_name: 'Honeymoon Fund',
    created_at: '2026-05-26T11:05:00Z',
  },
  {
    id: 'gift-6',
    donor_name: 'Sarah & Michael Green',
    gift_type: 'physical',
    amount: null,
    gift_name: 'KitchenAid Stand Mixer',
    thank_you_status: 'sent',
    registry_item_name: 'Kitchen Registry',
    created_at: '2026-05-25T18:00:00Z',
  }
];

export default function GiftTracker({ isAddModalOpen, setIsAddModalOpen, gifts: propGifts, setGifts: propSetGifts }) {
  // State Management
  const [localGifts, setLocalGifts] = useState(INITIAL_GIFTS);
  const gifts = propGifts || localGifts;
  const setGifts = propSetGifts || setLocalGifts;
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'cash' | 'physical'
  const [filterThankYou, setFilterThankYou] = useState('all'); // 'all' | 'pending' | 'sent'

  // Configurable Goals
  const HONEYMOON_GOAL_AMOUNT = 15000;

  // Supabase Integration Hook
  useEffect(() => {
    async function fetchGifts() {
      // TODO: Connect to Supabase
      // Uncomment the lines below once you set up your Supabase project credentials in your .env file
      /*
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('gifts')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data && data.length > 0) {
          setGifts(data);
        }
      } catch (error) {
        console.error('Error fetching gifts from Supabase:', error.message);
      } finally {
        setLoading(false);
      }
      */
    }

    fetchGifts();
  }, []);

  // Handlers
  const handleAddGift = async (newGift) => {
    // Generate temporary local ID
    const localGift = {
      id: `gift-${Date.now()}`,
      ...newGift,
    };

    // Optimistic Update
    setGifts((prev) => [localGift, ...prev]);

    // TODO: Connect to Supabase
    // Uncomment the lines below to insert new entries into your Supabase database table
    /*
    try {
      const { data, error } = await supabase
        .from('gifts')
        .insert([newGift])
        .select();

      if (error) throw error;
      
      // Update local state with the actual returned Supabase database record (containing DB UUID)
      if (data && data[0]) {
        setGifts((prev) => prev.map((g) => (g.id === localGift.id ? data[0] : g)));
      }
    } catch (error) {
      console.error('Error adding gift to Supabase:', error.message);
      // Rollback optimistic update on error
      setGifts((prev) => prev.filter((g) => g.id !== localGift.id));
    }
    */
  };

  const toggleThankYouStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'pending' ? 'sent' : 'pending';

    // Optimistic Update
    setGifts((prev) =>
      prev.map((g) => (g.id === id ? { ...g, thank_you_status: nextStatus } : g))
    );

    // TODO: Connect to Supabase
    // Uncomment the lines below to sync thank you status with Supabase
    /*
    try {
      const { error } = await supabase
        .from('gifts')
        .update({ thank_you_status: nextStatus })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating thank you status in Supabase:', error.message);
      // Rollback optimistic update on error
      setGifts((prev) =>
        prev.map((g) => (g.id === id ? { ...g, thank_you_status: currentStatus } : g))
      );
    }
    */
  };

  // Dynamic Computations
  // 1. Honeymoon Fund Contributions Sum
  const honeymoonReceived = gifts
    .filter((g) => g.registry_item_name === 'Honeymoon Fund' && g.gift_type === 'cash')
    .reduce((sum, g) => sum + (g.amount || 0), 0);

  const honeymoonPercentage = Math.min(
    Math.round((honeymoonReceived / HONEYMOON_GOAL_AMOUNT) * 100),
    100
  );

  // 2. Summary stats
  const totalGiftsCount = gifts.length;
  const pendingThanksCount = gifts.filter((g) => g.thank_you_status === 'pending').length;
  const physicalGiftsCount = gifts.filter((g) => g.gift_type === 'physical').length;

  // Filtered List
  const filteredGifts = gifts.filter((gift) => {
    const matchesType =
      filterType === 'all' || gift.gift_type === filterType;
    const matchesThankYou =
      filterThankYou === 'all' || gift.thank_you_status === filterThankYou;
    return matchesType && matchesThankYou;
  });

  // Framer Motion Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <h2 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-2">
            Gift Registry
          </h2>
          <p className="font-body-lg text-body-lg text-secondary max-w-2xl">
            Track contributions and manage thank-you notes for your special day.
          </p>
        </div>
        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 border border-[#2D2D2D]/20 rounded-lg font-label-md text-label-md text-[#2D2D2D] hover:bg-surface-variant transition-colors flex items-center bg-white shadow-sm"
          >
            <span className="material-symbols-outlined mr-2 text-[18px]">ios_share</span>
            Share Registry
          </motion.button>
        </div>
      </motion.div>

      {/* Bento Grid Layout (Progress & Stats) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-[#FAF9F6] border border-[#2D2D2D]/10 rounded-xl p-8 hover:card-shadow transition-shadow duration-300"
        >
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface">Fund Goal</h3>
              <p className="font-body-md text-body-md text-secondary mt-1">Honeymoon to Amalfi Coast</p>
            </div>
            <div className="text-right">
              <span className="font-headline-lg text-headline-lg text-primary block">
                ${honeymoonReceived.toLocaleString()}
              </span>
              <span className="font-label-md text-label-md text-secondary">
                of ${HONEYMOON_GOAL_AMOUNT.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden mb-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${honeymoonPercentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-primary rounded-full relative"
            >
              <div className="absolute inset-0 bg-white/20 w-full overflow-hidden"></div>
            </motion.div>
          </div>
          <div className="flex justify-between font-caption text-caption text-secondary">
            <span>{honeymoonPercentage}% Funded</span>
            <span>14 Days Left</span>
          </div>
        </motion.div>

        {/* Quick Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#2D2D2D] text-white rounded-xl p-8 flex flex-col justify-center relative overflow-hidden card-shadow"
        >
          <div className="absolute -top-4 -right-4 p-4 opacity-10">
            <span className="material-symbols-outlined text-[140px]">redeem</span>
          </div>
          <div className="relative z-10">
            <p className="font-label-md text-label-md uppercase tracking-wider text-white/70 mb-2">Total Gifts</p>
            <h3 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg mb-6">
              {totalGiftsCount}
            </h3>
            <div className="flex gap-6 border-t border-white/10 pt-6">
              <div>
                <p className="font-caption text-caption text-white/70">Pending Thanks</p>
                <p className="font-body-lg text-body-lg font-semibold text-primary-fixed">{pendingThanksCount}</p>
              </div>
              <div className="w-px bg-white/10"></div>
              <div>
                <p className="font-caption text-caption text-white/70">Physical Gifts</p>
                <p className="font-body-lg text-body-lg font-semibold">{physicalGiftsCount}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filter and List Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[#FAF9F6] border border-[#2D2D2D]/10 rounded-xl p-8"
      >
        {/* List Header & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-[#2D2D2D]/10 pb-6">
          <h3 className="font-headline-md text-headline-md text-on-surface">Recent Contributions</h3>
          
          <div className="flex flex-wrap gap-4 items-center">
            {/* Filter by Type */}
            <div className="flex bg-surface-container rounded-lg p-1 text-caption font-semibold">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  filterType === 'all' ? 'bg-white text-on-surface shadow-sm' : 'text-secondary hover:text-on-surface'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('cash')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  filterType === 'cash' ? 'bg-white text-on-surface shadow-sm' : 'text-secondary hover:text-on-surface'
                }`}
              >
                Cash
              </button>
              <button
                onClick={() => setFilterType('physical')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  filterType === 'physical' ? 'bg-white text-on-surface shadow-sm' : 'text-secondary hover:text-on-surface'
                }`}
              >
                Physical
              </button>
            </div>

            {/* Filter by Thank You Status */}
            <div className="flex bg-surface-container rounded-lg p-1 text-caption font-semibold">
              <button
                onClick={() => setFilterThankYou('all')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  filterThankYou === 'all' ? 'bg-white text-on-surface shadow-sm' : 'text-secondary hover:text-on-surface'
                }`}
              >
                All Thanks
              </button>
              <button
                onClick={() => setFilterThankYou('pending')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  filterThankYou === 'pending' ? 'bg-white text-on-surface shadow-sm' : 'text-secondary hover:text-on-surface'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilterThankYou('sent')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  filterThankYou === 'sent' ? 'bg-white text-on-surface shadow-sm' : 'text-secondary hover:text-on-surface'
                }`}
              >
                Sent
              </button>
            </div>
          </div>
        </div>

        {/* Contributors List */}
        {loading ? (
          <div className="text-center py-12 text-secondary">Loading contributions...</div>
        ) : filteredGifts.length === 0 ? (
          <div className="text-center py-12 text-secondary font-body-md">
            No gifts match the current filters.
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredGifts.map((gift) => (
                <motion.div
                  key={gift.id}
                  variants={itemVariants}
                  layout
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center justify-between pb-6 border-b border-[#2D2D2D]/5 last:border-0 last:pb-0"
                >
                  {/* Left Side: Avatar & Donor Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-[#2D2D2D] font-headline-md text-headline-md select-none">
                      {gift.donor_name ? gift.donor_name.charAt(0) : 'G'}
                    </div>
                    <div>
                      <p className="font-body-lg text-body-lg text-[#2D2D2D] font-medium">
                        {gift.donor_name}
                      </p>
                      
                      {/* Thank You Note Interactive Button */}
                      <button
                        onClick={() => toggleThankYouStatus(gift.id, gift.thank_you_status)}
                        className={`font-caption text-caption flex items-center mt-1 transition-colors ${
                          gift.thank_you_status === 'sent'
                            ? 'text-primary'
                            : 'text-secondary hover:text-on-surface'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px] mr-1">
                          {gift.thank_you_status === 'sent' ? 'mark_email_read' : 'mail'}
                        </span>
                        {gift.thank_you_status === 'sent' ? 'Thank you sent' : 'Thank you note pending (click to toggle)'}
                      </button>
                    </div>
                  </div>

                  {/* Right Side: Gift Value & Category */}
                  <div className="text-right flex items-center gap-6">
                    <div>
                      <p className="font-body-lg text-body-lg text-[#2D2D2D] font-semibold">
                        {gift.gift_name}
                      </p>
                      <p className="font-caption text-caption text-secondary">
                        {gift.registry_item_name}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`px-3 py-1 rounded-full border font-caption text-caption ${
                        gift.gift_type === 'cash'
                          ? 'border-primary text-primary bg-primary/5'
                          : 'border-secondary text-secondary bg-surface-variant'
                      }`}
                    >
                      {gift.gift_type === 'cash' ? 'Received' : 'Pending Delivery'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>

      {/* Gift Modal Registration form */}
      <GiftFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddGift={handleAddGift}
      />
    </div>
  );
}
