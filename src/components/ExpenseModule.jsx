import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { supabase } from '../supabase';

const INITIAL_EXPENSES = [
  { id: 'exp-1', name: 'Venue Deposit', amount: 15000, category: 'Venue', status: 'paid', date: '2026-05-10' },
  { id: 'exp-2', name: 'Wedding Rings', amount: 4500, category: 'Attire', status: 'paid', date: '2026-05-15' },
  { id: 'exp-3', name: 'Catering Deposit', amount: 2500, category: 'Catering', status: 'paid', date: '2026-05-18' },
  { id: 'exp-4', name: 'DJ Downpayment', amount: 2000, category: 'Music', status: 'pending', date: '2026-05-20' },
  { id: 'exp-5', name: 'Bridal Bouquet Booking', amount: 3500, category: 'Florals', status: 'paid', date: '2026-05-22' },
  { id: 'exp-6', name: 'Photography Deposit', amount: 6000, category: 'Photography', status: 'paid', date: '2026-05-25' },
  { id: 'exp-7', name: 'Printed Programs', amount: 500, category: 'Miscellaneous', status: 'pending', date: '2026-05-28' },
];

const CATEGORIES = ['Venue', 'Catering', 'Attire', 'Florals', 'Music', 'Photography', 'Miscellaneous'];

export default function ExpenseModule({ expenses, setExpenses, isAddExpenseOpen, setIsAddExpenseOpen }) {
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Add Form Local States
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Venue');
  const [status, setStatus] = useState('pending');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // TODO: Connect to Supabase
  // Uncomment the lines below to pull dynamic expense items from your Supabase 'expenses' table
  /*
  useEffect(() => {
    async function fetchExpenses() {
      try {
        const { data, error } = await supabase
          .from('expenses')
          .select('*')
          .order('date', { ascending: false });
        if (error) throw error;
        if (data && data.length > 0) {
          setExpenses(data);
        }
      } catch (err) {
        console.error('Error fetching expenses from Supabase:', err.message);
      }
    }
    fetchExpenses();
  }, []);
  */

  // Handlers
  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!name.trim() || !amount) return;

    const newExpense = {
      name,
      amount: parseFloat(amount),
      category,
      status,
      date,
    };

    const localExpense = {
      id: `exp-${Date.now()}`,
      ...newExpense,
    };

    // Optimistic Update
    setExpenses((prev) => [localExpense, ...prev]);

    // Reset Form
    setName('');
    setAmount('');
    setCategory('Venue');
    setStatus('pending');
    setIsAddExpenseOpen(false);

    // TODO: Connect to Supabase
    // Uncomment the lines below to push new expense inserts to Supabase
    /*
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert([newExpense])
        .select();
      if (error) throw error;
      if (data && data[0]) {
        setExpenses((prev) => prev.map((exp) => (exp.id === localExpense.id ? data[0] : exp)));
      }
    } catch (err) {
      console.error('Error saving expense to Supabase:', err.message);
      setExpenses((prev) => prev.filter((exp) => exp.id !== localExpense.id));
    }
    */
  };

  const handleDeleteExpense = async (id) => {
    // Optimistic Update
    const removedExpense = expenses.find((exp) => exp.id === id);
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));

    // TODO: Connect to Supabase
    // Uncomment the lines below to sync deletions with your Supabase table
    /*
    try {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Error deleting expense in Supabase:', err.message);
      if (removedExpense) {
        setExpenses((prev) => [removedExpense, ...prev]);
      }
    }
    */
  };

  const toggleExpenseStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'paid' ? 'pending' : 'paid';

    // Optimistic Update
    setExpenses((prev) =>
      prev.map((exp) => (exp.id === id ? { ...exp, status: nextStatus } : exp))
    );

    // TODO: Connect to Supabase
    // Uncomment to update status in Supabase table
    /*
    try {
      const { error } = await supabase
        .from('expenses')
        .update({ status: nextStatus })
        .eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Error toggling expense status in Supabase:', err.message);
      setExpenses((prev) =>
        prev.map((exp) => (exp.id === id ? { ...exp, status: currentStatus } : exp))
      );
    }
    */
  };

  // Computations for Recharts
  // Group spent total per category
  const chartData = CATEGORIES.map((cat) => {
    const spent = expenses
      .filter((exp) => exp.category.toLowerCase() === cat.toLowerCase() || (cat === 'Venue' && exp.category === 'Catering')) // Group Venue/Catering to match budget
      .reduce((sum, exp) => sum + exp.amount, 0);
    return {
      name: cat,
      spent,
    };
  }).filter((c) => c.spent > 0);

  // Filters
  const filteredExpenses = expenses.filter((exp) => {
    const matchesCategory = filterCategory === 'all' || exp.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || exp.status === filterStatus;
    return matchesCategory && matchesStatus;
  });

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
            Expense Tracker
          </h2>
          <p className="font-body-lg text-body-lg text-secondary max-w-2xl">
            Log invoice entries, track pending accounts payable, and visualize structural costs.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsAddExpenseOpen(true)}
          className="w-full md:w-auto px-6 py-3 bg-[#2D2D2D] text-white rounded-lg font-label-md text-label-md hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          Record Expense
        </motion.button>
      </motion.div>

      {/* Recharts Bar Chart Card */}
      {chartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-on-surface/10 p-6 rounded-xl hover:card-shadow transition-shadow duration-300"
        >
          <h3 className="font-headline-md text-headline-md text-on-surface mb-6">
            Expenses by Category
          </h3>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#5f5e5e" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#5f5e5e" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(197, 160, 89, 0.05)' }}
                  contentStyle={{
                    backgroundColor: '#FAF9F6',
                    border: '1px solid rgba(45, 45, 45, 0.1)',
                    borderRadius: '8px',
                    fontFamily: 'Inter',
                  }}
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Spent']}
                />
                <Bar dataKey="spent" fill="#c5a059" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#c5a059' : '#b08b26'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Filters & Table Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#FAF9F6] border border-on-surface/10 p-6 md:p-8 rounded-xl"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2d2d2d]/10 pb-6 mb-6">
          <h3 className="font-headline-md text-headline-md text-on-surface">Transactions</h3>
          
          {/* Filters Row */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Category Select */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-white border border-[#2d2d2d]/10 rounded-lg px-3 py-2 text-caption font-semibold focus:outline-none focus:border-primary"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Status Select */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white border border-[#2d2d2d]/10 rounded-lg px-3 py-2 text-caption font-semibold focus:outline-none focus:border-primary"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid Only</option>
              <option value="pending">Pending Only</option>
            </select>
          </div>
        </div>

        {/* Expenses List / Table */}
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12 text-secondary font-body-md">
            No expenses found matching the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-body-md">
              <thead>
                <tr className="border-b border-[#2d2d2d]/10 text-secondary font-label-md text-caption uppercase tracking-wider pb-3">
                  <th className="py-3 font-semibold">Expense</th>
                  <th className="py-3 font-semibold">Category</th>
                  <th className="py-3 font-semibold">Date</th>
                  <th className="py-3 font-semibold">Amount</th>
                  <th className="py-3 font-semibold">Status</th>
                  <th className="py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2d2d2d]/5">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-white/30 transition-colors group">
                    <td className="py-4 font-medium text-[#2d2d2d]">{exp.name}</td>
                    <td className="py-4 text-secondary">{exp.category}</td>
                    <td className="py-4 text-secondary">{exp.date}</td>
                    <td className="py-4 font-semibold text-[#2d2d2d]">${exp.amount.toLocaleString()}</td>
                    <td className="py-4">
                      <button
                        onClick={() => toggleExpenseStatus(exp.id, exp.status)}
                        className={`px-3 py-1 rounded-full text-caption font-semibold border flex items-center gap-1 transition-colors select-none ${
                          exp.status === 'paid'
                            ? 'border-primary text-primary bg-primary/5'
                            : 'border-secondary text-secondary bg-surface-variant'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {exp.status === 'paid' ? 'Paid' : 'Pending'}
                      </button>
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="text-secondary hover:text-error opacity-0 group-hover:opacity-100 transition-opacity p-1 flex items-center justify-center float-right"
                        aria-label="Delete expense"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Record Expense Modal overlay */}
      <AnimatePresence>
        {isAddExpenseOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddExpenseOpen(false)}
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
                onClick={() => setIsAddExpenseOpen(false)}
                className="absolute top-4 right-4 text-secondary hover:text-on-surface transition-colors"
                aria-label="Close"
              >
                <span className="material-symbols-outlined">close</span>
              </button>

              <h3 className="font-headline-md text-headline-md mb-6">Record New Expense</h3>

              <form onSubmit={handleAddExpense} className="space-y-5">
                <div>
                  <label className="block font-label-md text-label-md uppercase tracking-wider text-secondary mb-2">
                    Item Description
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Florals Downpayment"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border border-on-surface/10 rounded-lg px-4 py-3 text-body-md focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-label-md text-label-md uppercase tracking-wider text-secondary mb-2">
                      Amount ($ USD)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 1500"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-white border border-on-surface/10 rounded-lg px-4 py-3 text-body-md focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block font-label-md text-label-md uppercase tracking-wider text-secondary mb-2">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-white border border-on-surface/10 rounded-lg px-4 py-3 text-body-md focus:outline-none focus:border-primary transition-colors"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-label-md text-label-md uppercase tracking-wider text-secondary mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-white border border-on-surface/10 rounded-lg px-4 py-3 text-body-md focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block font-label-md text-label-md uppercase tracking-wider text-secondary mb-2">
                      Payment Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full bg-white border border-on-surface/10 rounded-lg px-4 py-3 text-body-md focus:outline-none focus:border-primary transition-colors"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-on-surface/5">
                  <button
                    type="button"
                    onClick={() => setIsAddExpenseOpen(false)}
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
                    Save Expense
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
