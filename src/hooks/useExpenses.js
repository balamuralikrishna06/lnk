import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const INITIAL_EXPENSES = [
  { id: 'exp-1', name: 'Venue Deposit', amount: 15000, category: 'Venue', status: 'paid', date: '2026-05-10', wedding_id: 'default' },
  { id: 'exp-2', name: 'Wedding Rings', amount: 4500, category: 'Attire', status: 'paid', date: '2026-05-15', wedding_id: 'default' },
  { id: 'exp-3', name: 'Catering Deposit', amount: 2500, category: 'Catering', status: 'paid', date: '2026-05-18', wedding_id: 'default' },
  { id: 'exp-4', name: 'DJ Downpayment', amount: 2000, category: 'Music', status: 'pending', date: '2026-05-20', wedding_id: 'default' },
  { id: 'exp-5', name: 'Bridal Bouquet Booking', amount: 3500, category: 'Florals', status: 'paid', date: '2026-05-22', wedding_id: 'default' },
  { id: 'exp-6', name: 'Photography Deposit', amount: 6000, category: 'Photography', status: 'paid', date: '2026-05-25', wedding_id: 'default' },
  { id: 'exp-7', name: 'Printed Programs', amount: 500, category: 'Miscellaneous', status: 'pending', date: '2026-05-28', wedding_id: 'default' },
];

export default function useExpenses(weddingId) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchExpenses = async () => {
    // If client is using mock keys, load mock data to prevent blank screen
    if (supabase.supabaseUrl.includes('mock.supabase.co')) {
      setExpenses(INITIAL_EXPENSES);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await supabase
        .from('expenses')
        .select('*')
        .eq('wedding_id', weddingId)
        .order('date', { ascending: false });

      if (fetchErr) throw fetchErr;
      if (data) {
        setExpenses(data);
      }
    } catch (err) {
      console.error('[Supabase] Error fetching expenses:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [weddingId]);

  const addExpense = async (expenseData) => {
    const newEntry = {
      ...expenseData,
      wedding_id: weddingId,
    };

    const tempId = `exp-temp-${Date.now()}`;
    const optimisticEntry = { id: tempId, ...newEntry };

    // Optimistic Update
    setExpenses((prev) => [optimisticEntry, ...prev]);

    if (supabase.supabaseUrl.includes('mock.supabase.co')) {
      return optimisticEntry;
    }

    try {
      // TODO: Connect to Supabase
      const { data, error: insertErr } = await supabase
        .from('expenses')
        .insert([newEntry])
        .select();

      if (insertErr) throw insertErr;
      if (data && data[0]) {
        // Swap temp ID with actual db ID
        setExpenses((prev) => prev.map((exp) => (exp.id === tempId ? data[0] : exp)));
        return data[0];
      }
    } catch (err) {
      console.error('[Supabase] Error adding expense:', err.message);
      setError(err.message);
      // Rollback
      setExpenses((prev) => prev.filter((exp) => exp.id !== tempId));
      throw err;
    }
  };

  const deleteExpense = async (id) => {
    const original = expenses.find((exp) => exp.id === id);
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));

    if (supabase.supabaseUrl.includes('mock.supabase.co')) {
      return;
    }

    try {
      // TODO: Connect to Supabase
      const { error: deleteErr } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('wedding_id', weddingId);

      if (deleteErr) throw deleteErr;
    } catch (err) {
      console.error('[Supabase] Error deleting expense:', err.message);
      setError(err.message);
      // Rollback
      if (original) {
        setExpenses((prev) => [original, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date)));
      }
      throw err;
    }
  };

  const toggleExpenseStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'paid' ? 'pending' : 'paid';

    setExpenses((prev) =>
      prev.map((exp) => (exp.id === id ? { ...exp, status: nextStatus } : exp))
    );

    if (supabase.supabaseUrl.includes('mock.supabase.co')) {
      return;
    }

    try {
      // TODO: Connect to Supabase
      const { error: updateErr } = await supabase
        .from('expenses')
        .update({ status: nextStatus })
        .eq('id', id)
        .eq('wedding_id', weddingId);

      if (updateErr) throw updateErr;
    } catch (err) {
      console.error('[Supabase] Error toggling status:', err.message);
      setError(err.message);
      // Rollback
      setExpenses((prev) =>
        prev.map((exp) => (exp.id === id ? { ...exp, status: currentStatus } : exp))
      );
      throw err;
    }
  };

  return {
    expenses,
    loading,
    error,
    fetchExpenses,
    addExpense,
    deleteExpense,
    toggleExpenseStatus,
  };
}
