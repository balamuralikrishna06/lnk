import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { supabase } from '../supabase';

const INITIAL_CATEGORIES = [
  { id: 'cat-1', name: 'Venue & Catering', allocated: 25000, color: '#c5a059' }, // Gold
  { id: 'cat-2', name: 'Attire & Styling', allocated: 6000, color: '#7f7667' },  // Outline Brass
  { id: 'cat-3', name: 'Flowers & Decor', allocated: 5000, color: '#e9c176' },   // Light Gold
  { id: 'cat-4', name: 'Music & Photo', allocated: 10000, color: '#5f5e5e' },    // Grey
  { id: 'cat-5', name: 'Miscellaneous', allocated: 4000, color: '#3a3b39' },    // Dark Charcoal
];

export default function BudgetModule({ expenses, weddingId }) {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [totalBudget, setTotalBudget] = useState(50000);
  
  useEffect(() => {
    async function fetchAllocations() {
      if (supabase.supabaseUrl.includes('mock.supabase.co')) {
        return;
      }
      try {
        const { data, error } = await supabase
          .from('budget_allocations')
          .select('*')
          .eq('wedding_id', weddingId);
        if (error) throw error;
        if (data && data.length > 0) {
          const merged = INITIAL_CATEGORIES.map(cat => {
            const dbMatch = data.find(item => item.id === cat.id);
            return dbMatch ? { ...cat, allocated: Number(dbMatch.allocated), name: dbMatch.name } : cat;
          });
          setCategories(merged);
        }
      } catch (err) {
        console.error('Error fetching budget allocations:', err.message);
      }
    }
    fetchAllocations();
  }, [weddingId]);

  // Sum up spent amounts per category
  const getSpentForCategory = (catName) => {
    return expenses
      .filter((exp) => {
        if (catName === 'Venue & Catering') return exp.category === 'Venue' || exp.category === 'Catering';
        if (catName === 'Attire & Styling') return exp.category === 'Attire' || exp.category === 'Rings';
        if (catName === 'Flowers & Decor') return exp.category === 'Florals' || exp.category === 'Decor';
        if (catName === 'Music & Photo') return exp.category === 'Music' || exp.category === 'Photography';
        return exp.category === 'Miscellaneous' || exp.category === 'Other';
      })
      .reduce((sum, exp) => sum + exp.amount, 0);
  };

  const categoryData = categories.map((cat) => {
    const spent = getSpentForCategory(cat.name);
    const remaining = Math.max(cat.allocated - spent, 0);
    return {
      ...cat,
      spent,
      remaining,
    };
  });

  const totalSpent = categoryData.reduce((sum, cat) => sum + cat.spent, 0);
  const remainingBudget = Math.max(totalBudget - totalSpent, 0);
  const totalAllocated = categories.reduce((sum, cat) => sum + cat.allocated, 0);

  // Data for the Donut Chart (Pie)
  // We plot the spent allocations by category plus the remaining unspent budget
  const chartData = [
    ...categoryData.map((cat) => ({
      name: `${cat.name} (Spent)`,
      value: cat.spent,
      color: cat.color,
    })),
    {
      name: 'Unspent Remaining',
      value: remainingBudget,
      color: '#efeded', // light container gray
    },
  ].filter((item) => item.value > 0);

  const handleAllocationChange = async (id, newVal) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, allocated: Number(newVal) } : c))
    );

    if (supabase.supabaseUrl.includes('mock.supabase.co')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('budget_allocations')
        .update({ allocated: Number(newVal) })
        .eq('id', id)
        .eq('wedding_id', weddingId);
      if (error) throw error;
    } catch (err) {
      console.error('Error updating allocation in Supabase:', err.message);
    }
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
            Budget Allocator
          </h2>
          <p className="font-body-lg text-body-lg text-secondary max-w-2xl">
            Designate wedding funds, compare itemized expenditures, and track remaining reserves.
          </p>
        </div>
        <div className="flex gap-3 items-center bg-white border border-on-surface/10 rounded-lg p-2 shadow-sm">
          <span className="font-label-md text-label-md text-secondary uppercase tracking-wider pl-2">Total Budget:</span>
          <input
            type="number"
            value={totalBudget}
            onChange={(e) => setTotalBudget(Number(e.target.value))}
            className="w-28 bg-transparent text-body-lg font-bold text-on-surface focus:outline-none text-right pr-2"
          />
        </div>
      </motion.div>

      {/* Main Budget Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Donut Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-on-surface/10 p-8 rounded-xl flex flex-col items-center justify-center min-h-[380px] hover:card-shadow transition-shadow duration-300"
        >
          <h3 className="font-headline-md text-headline-md text-on-surface mb-6 text-center self-start">
            Expenditure Distribution
          </h3>

          <div className="w-full h-64 relative flex items-center justify-center">
            {/* Donut Chart */}
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Centered Statistics */}
            <div className="absolute flex flex-col items-center text-center">
              <span className="font-caption text-caption text-secondary uppercase tracking-wider font-semibold">
                Remaining
              </span>
              <span className="font-display-lg-mobile text-display-lg-mobile text-primary font-bold">
                ₹{remainingBudget.toLocaleString()}
              </span>
              <span className="font-caption text-caption text-secondary mt-1">
                {Math.round((remainingBudget / totalBudget) * 100)}% left
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-6 justify-center text-caption font-semibold">
            {categories.map((c) => (
              <div key={c.id} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="text-secondary">{c.name}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#efeded]" />
              <span className="text-secondary">Unspent</span>
            </div>
          </div>
        </motion.div>

        {/* Dynamic Category Sliders Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-[#FAF9F6] border border-on-surface/10 p-8 rounded-xl"
        >
          <h3 className="font-headline-md text-headline-md text-on-surface mb-8 border-b border-on-surface/10 pb-4">
            Category Budgets
          </h3>

          <div className="space-y-6">
            {categoryData.map((cat) => {
              const spentPercentage = cat.allocated > 0 ? Math.min(Math.round((cat.spent / cat.allocated) * 100), 100) : 0;
              const isOverspent = cat.spent > cat.allocated;

              return (
                <div key={cat.id} className="space-y-2">
                  <div className="flex justify-between items-center text-body-md">
                    <span className="font-medium text-[#2d2d2d] flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      {cat.name}
                    </span>
                    <div className="text-right font-medium">
                      <span className="text-[#2d2d2d]">₹{cat.spent.toLocaleString()}</span>
                      <span className="text-secondary mx-1">/</span>
                      <span className="text-secondary">₹{cat.allocated.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Range Allocation Slider */}
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1000"
                      max="30000"
                      step="500"
                      value={cat.allocated}
                      onChange={(e) => handleAllocationChange(cat.id, e.target.value)}
                      className="flex-1 accent-primary h-1 bg-surface-container-high rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="font-caption text-caption text-secondary w-12 text-right">
                      {Math.round((cat.allocated / totalBudget) * 100)}% cap
                    </span>
                  </div>

                  {/* Progress Indicator */}
                  <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden relative">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOverspent ? 'bg-error' : 'bg-primary'
                      }`}
                      style={{ width: `${spentPercentage}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-caption font-semibold">
                    <span className={isOverspent ? 'text-error' : 'text-secondary'}>
                      {isOverspent
                        ? `Overspent by ₹${(cat.spent - cat.allocated).toLocaleString()}`
                        : `${spentPercentage}% Spent`}
                    </span>
                    <span className="text-secondary">₹{cat.remaining.toLocaleString()} remaining</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
