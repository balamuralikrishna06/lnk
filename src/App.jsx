import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Dashboard from './components/Dashboard';
import BudgetModule from './components/BudgetModule';
import ExpenseModule from './components/ExpenseModule';
import GiftTracker from './components/GiftTracker';
import AlbumModule from './components/AlbumModule';

const INITIAL_EXPENSES = [
  { id: 'exp-1', name: 'Venue Deposit', amount: 15000, category: 'Venue', status: 'paid', date: '2026-05-10' },
  { id: 'exp-2', name: 'Wedding Rings', amount: 4500, category: 'Attire', status: 'paid', date: '2026-05-15' },
  { id: 'exp-3', name: 'Catering Deposit', amount: 2500, category: 'Catering', status: 'paid', date: '2026-05-18' },
  { id: 'exp-4', name: 'DJ Downpayment', amount: 2000, category: 'Music', status: 'pending', date: '2026-05-20' },
  { id: 'exp-5', name: 'Bridal Bouquet Booking', amount: 3500, category: 'Florals', status: 'paid', date: '2026-05-22' },
  { id: 'exp-6', name: 'Photography Deposit', amount: 6000, category: 'Photography', status: 'paid', date: '2026-05-25' },
  { id: 'exp-7', name: 'Printed Programs', amount: 500, category: 'Miscellaneous', status: 'pending', date: '2026-05-28' },
];

const INITIAL_GIFTS = [
  { id: 'gift-1', donor_name: 'Eleanor & James Wright', gift_type: 'cash', amount: 500, gift_name: '$500', thank_you_status: 'pending', registry_item_name: 'Honeymoon Fund', created_at: '2026-05-30T10:15:00Z' },
  { id: 'gift-2', donor_name: 'The Smith Family', gift_type: 'physical', amount: null, gift_name: 'Espresso Machine', thank_you_status: 'pending', registry_item_name: 'Registry Item', created_at: '2026-05-29T16:45:00Z' },
  { id: 'gift-3', donor_name: 'Aunt Martha', gift_type: 'cash', amount: 250, gift_name: '$250', thank_you_status: 'sent', registry_item_name: 'Honeymoon Fund', created_at: '2026-05-28T09:30:00Z' },
  { id: 'gift-4', donor_name: 'The Davidson Cousins', gift_type: 'cash', amount: 1200, gift_name: '$1,200', thank_you_status: 'sent', registry_item_name: 'Honeymoon Fund', created_at: '2026-05-27T14:20:00Z' },
  { id: 'gift-5', donor_name: 'Parents of the Bride', gift_type: 'cash', amount: 10000, gift_name: '$10,000', thank_you_status: 'pending', registry_item_name: 'Honeymoon Fund', created_at: '2026-05-26T11:05:00Z' },
  { id: 'gift-6', donor_name: 'Sarah & Michael Green', gift_type: 'physical', amount: null, gift_name: 'KitchenAid Stand Mixer', thank_you_status: 'sent', registry_item_name: 'Kitchen Registry', created_at: '2026-05-25T18:00:00Z' }
];

const INITIAL_PHOTOS = [
  { id: 'photo-1', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80', caption: 'Our Ceremony Venue', date: '2027-06-20' },
  { id: 'photo-2', url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80', caption: 'Reception Dinner Tables', date: '2027-06-20' },
  { id: 'photo-3', url: 'https://images.unsplash.com/photo-1543157148-f68f2d47a622?auto=format&fit=crop&w=800&q=80', caption: 'Bridal Bouquet Floral Highlights', date: '2027-06-20' },
  { id: 'photo-4', url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80', caption: 'Intertwined Wedding Rings', date: '2027-06-20' },
  { id: 'photo-5', url: 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=800&q=80', caption: 'Decadent Wedding Cake & Patisserie', date: '2027-06-20' },
  { id: 'photo-6', url: 'https://images.unsplash.com/photo-1519225495810-7517c300ea97?auto=format&fit=crop&w=800&q=80', caption: 'Pre-wedding photoshoot portraits', date: '2027-06-19' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard | expenses | budget | gifts | album
  
  // Shared Elevated States
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
  const [gifts, setGifts] = useState(INITIAL_GIFTS);
  const [photos, setPhotos] = useState(INITIAL_PHOTOS);

  // Modals Open State
  const [isAddGiftOpen, setIsAddGiftOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddPhotoOpen, setIsAddPhotoOpen] = useState(false);

  // Helper shortcuts that transition views automatically for better UX
  const triggerAddExpense = () => {
    setActiveTab('expenses');
    setIsAddExpenseOpen(true);
  };

  const triggerAddGift = () => {
    setActiveTab('gifts');
    setIsAddGiftOpen(true);
  };

  const triggerAddPhoto = () => {
    setActiveTab('album');
    setIsAddPhotoOpen(true);
  };

  // Helper for Mobile FAB based on currently active tab
  const handleMobileFABClick = () => {
    if (activeTab === 'expenses') setIsAddExpenseOpen(true);
    else if (activeTab === 'gifts') setIsAddGiftOpen(true);
    else if (activeTab === 'album') setIsAddPhotoOpen(true);
    else triggerAddExpense(); // Default fallback
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#2d2d2d] pb-[90px] md:pb-0 md:pl-64 antialiased">
      
      {/* TopAppBar (Mobile Only) */}
      <header className="md:hidden bg-[#fbf9f8] fixed top-0 w-full z-30 border-b border-[#2d2d2d]/10">
        <div className="flex justify-between items-center px-6 py-4 w-full max-w-[1280px] mx-auto">
          {/* Left Top Branding */}
          <div className="flex items-center gap-2">
            <img src="/lnklogo-removebg-preview.png" alt="L&M Logo" className="h-8 w-auto object-contain" />
            <span className="font-headline-md text-headline-md text-xl text-[#2d2d2d] font-bold tracking-tighter">
              L&M
            </span>
          </div>
          {/* Right Top Icons */}
          <div className="flex items-center space-x-4">
            <button className="text-[#2d2d2d] hover:opacity-80 flex items-center">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="text-[#2d2d2d] hover:opacity-80 flex items-center">
              <span className="material-symbols-outlined">account_circle</span>
            </button>
          </div>
        </div>
      </header>

      {/* SideNavBar (Desktop Only) */}
      <nav className="hidden md:flex flex-col bg-[#e9e8e7] text-primary h-full w-64 fixed left-0 top-0 border-r border-[#2d2d2d]/5 shadow-sm p-6 space-y-4 z-20 justify-between">
        <div className="space-y-8 w-full">
          {/* Left Top Branding */}
          <div className="flex items-center gap-2.5 pb-2 border-b border-[#2d2d2d]/10">
            <img src="/lnklogo-removebg-preview.png" alt="L&M Logo" className="h-10 w-auto object-contain" />
            <span className="font-headline-md text-headline-md text-2xl text-[#2d2d2d] font-bold tracking-tighter">
              L&M
            </span>
          </div>
          
          <div className="space-y-2">
            {[
              { id: 'dashboard', label: 'Overview', icon: 'dashboard' },
              { id: 'expenses', label: 'Expenses', icon: 'payments' },
              { id: 'budget', label: 'Budget', icon: 'account_balance_wallet' },
              { id: 'gifts', label: 'Gifts', icon: 'card_giftcard', fill: true },
              { id: 'album', label: 'Album', icon: 'photo_library' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                    isActive
                      ? 'bg-[#c5a059] text-white shadow-sm font-semibold'
                      : 'text-on-surface-variant hover:bg-surface-variant'
                  }`}
                >
                  <span
                    className="material-symbols-outlined mr-3"
                    style={tab.fill && isActive ? { fontVariationSettings: '"FILL" 1' } : {}}
                  >
                    {tab.icon}
                  </span>
                  <span className="font-body-md text-body-md">{tab.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3 pt-6 border-t border-[#2d2d2d]/10">
          <button
            onClick={triggerAddExpense}
            className="w-full flex items-center justify-center px-4 py-3 rounded-lg bg-[#2D2D2D] text-white hover:opacity-90 active:scale-[0.98] transition-all font-label-md text-label-md"
          >
            <span className="material-symbols-outlined mr-2">add_circle</span>
            Add Expense
          </button>
          <button
            onClick={triggerAddGift}
            className="w-full flex items-center justify-center px-4 py-3 rounded-lg border border-[#2D2D2D] text-[#2D2D2D] hover:bg-white/40 active:scale-[0.98] transition-all font-label-md text-label-md"
          >
            <span className="material-symbols-outlined mr-2">redeem</span>
            Add Gift
          </button>
        </div>
      </nav>

      {/* Main Content Router */}
      <main className="w-full max-w-[1280px] mx-auto px-6 md:px-16 pt-28 md:pt-16 pb-20 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            {activeTab === 'dashboard' && (
              <Dashboard
                gifts={gifts}
                expenses={expenses}
                photosCount={photos.length}
                onNavigate={setActiveTab}
                onAddGiftClick={triggerAddGift}
                onAddExpenseClick={triggerAddExpense}
                onAddPhotoClick={triggerAddPhoto}
              />
            )}

            {activeTab === 'expenses' && (
              <ExpenseModule
                expenses={expenses}
                setExpenses={setExpenses}
                isAddExpenseOpen={isAddExpenseOpen}
                setIsAddExpenseOpen={setIsAddExpenseOpen}
              />
            )}

            {activeTab === 'budget' && (
              <BudgetModule expenses={expenses} />
            )}

            {activeTab === 'gifts' && (
              <GiftTracker
                gifts={gifts}
                setGifts={setGifts}
                isAddModalOpen={isAddGiftOpen}
                setIsAddModalOpen={setIsAddGiftOpen}
              />
            )}

            {activeTab === 'album' && (
              <AlbumModule
                photos={photos}
                setPhotos={setPhotos}
                isAddPhotoOpen={isAddPhotoOpen}
                setIsAddPhotoOpen={setIsAddPhotoOpen}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Action Button (FAB) (Mobile Only) */}
      {activeTab !== 'budget' && (
        <button
          onClick={handleMobileFABClick}
          className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-[#2D2D2D] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-opacity-90 active:scale-95 transition-all z-30"
          aria-label="Add entry"
        >
          <span className="material-symbols-outlined">add</span>
        </button>
      )}

      {/* BottomNavBar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 w-full z-30 bg-[#fbf9f8] rounded-t-xl border-t border-[#2d2d2d]/10 shadow-md px-4 py-3 pb-safe flex justify-around items-center text-[11px] text-[#2d2d2d] select-none">
        {[
          { id: 'dashboard', label: 'Overview', icon: 'dashboard' },
          { id: 'expenses', label: 'Expenses', icon: 'payments' },
          { id: 'budget', label: 'Budget', icon: 'account_balance_wallet' },
          { id: 'gifts', label: 'Gifts', icon: 'card_giftcard', fill: true },
          { id: 'album', label: 'Album', icon: 'photo_library' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center transition-colors ${
                isActive ? 'text-[#c5a059] font-bold scale-105 transition-transform' : 'text-secondary hover:text-primary'
              }`}
            >
              <span
                className="material-symbols-outlined mb-1"
                style={tab.fill && isActive ? { fontVariationSettings: '"FILL" 1' } : {}}
              >
                {tab.icon}
              </span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
