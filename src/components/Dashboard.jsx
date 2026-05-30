import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PDFExportButton from './PDFExportButton';

export default function Dashboard({
  weddingId,
  gifts,
  expenses,
  photosCount,
  onNavigate,
  onAddGiftClick,
  onAddExpenseClick,
  onAddPhotoClick,
}) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Target wedding date: July 7, 2026
  const weddingDate = new Date('2026-07-07T16:00:00');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +weddingDate - +new Date();
      let newTimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

      if (difference > 0) {
        newTimeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      setTimeLeft(newTimeLeft);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  // Compute stats
  const totalBudget = 50000; // Total allocated wedding budget
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const budgetSpentPercent = Math.min(Math.round((totalSpent / totalBudget) * 100), 100);

  const registryGoal = 15000;
  const registryReceived = gifts
    .filter((g) => g.registry_item_name === 'Honeymoon Fund' && g.gift_type === 'cash')
    .reduce((sum, g) => sum + (g.amount || 0), 0);
  const registryPercent = Math.min(Math.round((registryReceived / registryGoal) * 100), 100);

  // n8n PDF Report Generator
  const generateReportPDF = async (wedding_id) => {
    const webhookUrl = 'https://balamuralikrishna06-n8n-free.hf.space/webhook/6159c71e-a13f-4a95-9db8-e7598da55831';
    
    const payload = {
      timestamp: new Date().toISOString(),
      platform: 'Modern Elegance Wedding Suite',
      wedding_id: wedding_id,
      data: {
        countdown: timeLeft,
        budget: { total: totalBudget, spent: totalSpent, percent: budgetSpentPercent },
        gifts: { count: gifts.length, received: registryReceived, goal: registryGoal, percent: registryPercent },
        expensesSummary: expenses.slice(0, 5),
        giftsSummary: gifts.slice(0, 5),
      }
    };

    console.log('[n8n Webhook] Posting report request for wedding ID:', wedding_id);
    
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`n8n PDF Generation Failed: ${response.statusText}`);
      }

      // Check for PDF stream or download URL
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/pdf')) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `Wedding_Summary_Report_${wedding_id}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        const result = await response.json();
        if (result.downloadUrl) {
          window.open(result.downloadUrl, '_blank');
        } else {
          console.log('[n8n Webhook] Webhook response received successfully:', result);
        }
      }
    } catch (err) {
      console.error('[n8n Webhook] PDF generator execution failed:', err);
      throw err; // bubble up for PDFExportButton state UI
    }
  };

  // Recent lists
  const recentExpenses = expenses.slice(0, 3);
  const recentGifts = gifts.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Header & Greetings */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <div>
          <h2 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-2">
            Wedding Dashboard
          </h2>
          <p className="font-body-lg text-body-lg text-secondary">
            Welcome back. Here is the current progress of your wedding preparations.
          </p>
        </div>
        <div className="w-full md:w-auto">
          <PDFExportButton handleExport={() => generateReportPDF(weddingId)} />
        </div>
      </motion.div>

      {/* Countdown Timer */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#2D2D2D] text-[#FAF9F6] p-8 rounded-xl flex flex-col md:flex-row justify-between items-center gap-6 card-shadow"
      >
        <div className="text-center md:text-left">
          <h3 className="font-headline-md text-headline-md text-white mb-1">The Countdown</h3>
          <p className="font-caption text-caption text-[#FAF9F6]/60 uppercase tracking-wider">
            July 7, 2026 • Jayam Mahal, Tirunelveli
          </p>
        </div>
        <div className="flex gap-4 md:gap-8 justify-center flex-wrap">
          {[
            { label: 'Days', value: timeLeft.days },
            { label: 'Hours', value: timeLeft.hours },
            { label: 'Minutes', value: timeLeft.minutes },
            { label: 'Seconds', value: timeLeft.seconds },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div className="bg-white/10 w-16 h-16 md:w-20 md:h-20 rounded-lg flex items-center justify-center font-display-lg-mobile text-display-lg-mobile md:font-headline-lg md:text-headline-lg text-white border border-white/10 select-none">
                {String(item.value).padStart(2, '0')}
              </div>
              <span className="font-caption text-caption text-[#FAF9F6]/60 mt-2 font-medium">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Spent Budget Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-on-surface/10 p-6 rounded-xl hover:card-shadow transition-shadow duration-300 flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="font-label-md text-label-md text-secondary uppercase tracking-wider">Budget Spent</span>
              <span className="material-symbols-outlined text-primary">payments</span>
            </div>
            <h4 className="font-display-lg-mobile text-display-lg-mobile text-on-surface font-semibold mb-2">
              {budgetSpentPercent}%
            </h4>
            <p className="font-caption text-caption text-secondary">
              ${totalSpent.toLocaleString()} of ${totalBudget.toLocaleString()} allocated
            </p>
          </div>
          <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden mt-6">
            <div className="h-full bg-primary rounded-full" style={{ width: `${budgetSpentPercent}%` }} />
          </div>
        </motion.div>

        {/* Registry Fund Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white border border-on-surface/10 p-6 rounded-xl hover:card-shadow transition-shadow duration-300 flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="font-label-md text-label-md text-secondary uppercase tracking-wider">Registry Goal</span>
              <span className="material-symbols-outlined text-primary">card_giftcard</span>
            </div>
            <h4 className="font-display-lg-mobile text-display-lg-mobile text-on-surface font-semibold mb-2">
              {registryPercent}%
            </h4>
            <p className="font-caption text-caption text-secondary">
              ${registryReceived.toLocaleString()} of ${registryGoal.toLocaleString()} honeymoon goal
            </p>
          </div>
          <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden mt-6">
            <div className="h-full bg-primary rounded-full" style={{ width: `${registryPercent}%` }} />
          </div>
        </motion.div>

        {/* Album Gallery Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white border border-on-surface/10 p-6 rounded-xl hover:card-shadow transition-shadow duration-300 flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="font-label-md text-label-md text-secondary uppercase tracking-wider">Photos Uploaded</span>
              <span className="material-symbols-outlined text-primary">photo_library</span>
            </div>
            <h4 className="font-display-lg-mobile text-display-lg-mobile text-on-surface font-semibold mb-2">
              {photosCount}
            </h4>
            <p className="font-caption text-caption text-secondary">
              Capture and record memories of your special planning journey
            </p>
          </div>
          <button
            onClick={() => onNavigate('album')}
            className="w-full py-2 border border-primary/20 text-primary font-label-md text-label-md rounded-lg hover:bg-surface-container transition-colors mt-6 text-center"
          >
            Manage Album
          </button>
        </motion.div>
      </div>

      {/* Main Content Split: Recent Activities & Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Contributions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-[#FAF9F6] border border-on-surface/10 p-8 rounded-xl"
        >
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#2d2d2d]/10">
            <h3 className="font-headline-md text-headline-md text-on-surface">Recent Gifts</h3>
            <button
              onClick={() => onNavigate('gifts')}
              className="text-primary font-label-md text-label-md hover:underline"
            >
              View Registry
            </button>
          </div>
          <div className="space-y-4">
            {recentGifts.map((gift) => (
              <div key={gift.id} className="flex justify-between items-center py-2 border-b border-[#2D2D2D]/5 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center font-headline-md text-[#2d2d2d]">
                    {gift.donor_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-body-md text-body-md font-medium text-[#2d2d2d]">{gift.donor_name}</p>
                    <p className="font-caption text-caption text-secondary">{gift.registry_item_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-body-md text-body-md font-semibold text-primary">{gift.gift_name}</p>
                  <p className="font-caption text-caption text-secondary capitalize">{gift.gift_type}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions Shortcuts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white border border-on-surface/10 p-8 rounded-xl flex flex-col justify-between"
        >
          <div>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-4 pb-4 border-b border-on-surface/5">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <motion.button
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
                onClick={onAddExpenseClick}
                className="w-full flex items-center justify-between p-3.5 rounded-lg bg-surface hover:bg-surface-container transition-colors text-left border border-on-surface/5"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">add_circle</span>
                  <span className="font-body-md text-body-md font-medium">Record New Expense</span>
                </div>
                <span className="material-symbols-outlined text-[18px] text-secondary">chevron_right</span>
              </motion.button>

              <motion.button
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
                onClick={onAddGiftClick}
                className="w-full flex items-center justify-between p-3.5 rounded-lg bg-surface hover:bg-surface-container transition-colors text-left border border-on-surface/5"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">redeem</span>
                  <span className="font-body-md text-body-md font-medium">Add Gift Contribution</span>
                </div>
                <span className="material-symbols-outlined text-[18px] text-secondary">chevron_right</span>
              </motion.button>

              <motion.button
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
                onClick={onAddPhotoClick}
                className="w-full flex items-center justify-between p-3.5 rounded-lg bg-surface hover:bg-surface-container transition-colors text-left border border-on-surface/5"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">photo_library</span>
                  <span className="font-body-md text-body-md font-medium">Add Photo to Gallery</span>
                </div>
                <span className="material-symbols-outlined text-[18px] text-secondary">chevron_right</span>
              </motion.button>
            </div>
          </div>

          <div className="mt-8 text-center text-xs text-secondary font-body-md">
            Connected to Supabase data client.
          </div>
        </motion.div>
      </div>
    </div>
  );
}
