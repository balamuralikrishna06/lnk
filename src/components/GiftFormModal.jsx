import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GiftFormModal({ isOpen, onClose, onAddGift }) {
  const [donorName, setDonorName] = useState('');
  const [giftType, setGiftType] = useState('cash'); // 'cash' | 'physical'
  const [amount, setAmount] = useState('');
  const [giftName, setGiftName] = useState('');
  const [registryItemName, setRegistryItemName] = useState('Honeymoon Fund');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!donorName.trim()) return;

    const newGift = {
      donor_name: donorName,
      gift_type: giftType,
      thank_you_status: 'pending',
      registry_item_name: registryItemName,
      created_at: new Date().toISOString(),
    };

    if (giftType === 'cash') {
      const parsedAmount = parseFloat(amount);
      newGift.amount = isNaN(parsedAmount) ? 0 : parsedAmount;
      newGift.gift_name = `₹${newGift.amount.toLocaleString()}`;
    } else {
      newGift.gift_name = giftName || 'Registry Item';
      newGift.amount = null;
    }

    onAddGift(newGift);

    // Reset Form
    setDonorName('');
    setAmount('');
    setGiftName('');
    setRegistryItemName(giftType === 'cash' ? 'Honeymoon Fund' : 'Registry Item');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.15 }}
            className="relative w-full max-w-md bg-background border border-on-surface/10 rounded-xl p-8 card-shadow z-10 text-on-surface"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-secondary hover:text-on-surface transition-colors"
              aria-label="Close"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h3 className="font-headline-md text-headline-md mb-6">Record New Contribution</h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Donor Name */}
              <div>
                <label className="block font-label-md text-label-md uppercase tracking-wider text-secondary mb-2">
                  From (Donor Name)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John & Mary Smith"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full bg-white border border-on-surface/10 rounded-lg px-4 py-3 text-body-md focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Gift Type Toggle */}
              <div>
                <label className="block font-label-md text-label-md uppercase tracking-wider text-secondary mb-2">
                  Contribution Type
                </label>
                <div className="grid grid-cols-2 gap-2 bg-surface-container rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setGiftType('cash');
                      setRegistryItemName('Honeymoon Fund');
                    }}
                    className={`py-2 rounded-md text-label-md font-medium transition-all ${
                      giftType === 'cash'
                        ? 'bg-white text-on-surface shadow-sm'
                        : 'text-secondary hover:text-on-surface'
                    }`}
                  >
                    Cash / Fund
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGiftType('physical');
                      setRegistryItemName('Registry Item');
                    }}
                    className={`py-2 rounded-md text-label-md font-medium transition-all ${
                      giftType === 'physical'
                        ? 'bg-white text-on-surface shadow-sm'
                        : 'text-secondary hover:text-on-surface'
                    }`}
                  >
                    Physical Gift
                  </button>
                </div>
              </div>

              {/* Dynamic Form Fields based on Type */}
              {giftType === 'cash' ? (
                <>
                  <div>
                    <label className="block font-label-md text-label-md uppercase tracking-wider text-secondary mb-2">
                      Contribution Amount (₹ INR)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 250"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-white border border-on-surface/10 rounded-lg px-4 py-3 text-body-md focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block font-label-md text-label-md uppercase tracking-wider text-secondary mb-2">
                      Registry Fund
                    </label>
                    <select
                      value={registryItemName}
                      onChange={(e) => setRegistryItemName(e.target.value)}
                      className="w-full bg-white border border-on-surface/10 rounded-lg px-4 py-3 text-body-md focus:outline-none focus:border-primary transition-colors"
                    >
                      <option value="Honeymoon Fund">Honeymoon Fund</option>
                      <option value="Home Downpayment Fund">Home Downpayment Fund</option>
                      <option value="General Cash Fund">General Cash Fund</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block font-label-md text-label-md uppercase tracking-wider text-secondary mb-2">
                      Gift Item Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Espresso Machine"
                      value={giftName}
                      onChange={(e) => setGiftName(e.target.value)}
                      className="w-full bg-white border border-on-surface/10 rounded-lg px-4 py-3 text-body-md focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block font-label-md text-label-md uppercase tracking-wider text-secondary mb-2">
                      Registry Category
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Registry Item, Kitchen, Decor"
                      value={registryItemName}
                      onChange={(e) => setRegistryItemName(e.target.value)}
                      className="w-full bg-white border border-on-surface/10 rounded-lg px-4 py-3 text-body-md focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </>
              )}

              {/* Submit / Cancel Buttons */}
              <div className="flex gap-4 pt-4 border-t border-on-surface/5">
                <button
                  type="button"
                  onClick={onClose}
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
                  Record Gift
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
