import { useState, useEffect } from 'react';

const STORAGE_KEY = 'myfinance_expenses';

const CATEGORIES = [
  { id: 1, name: 'Food & Dining', icon: '🍔', color: '#FF6B6B' },
  { id: 2, name: 'Transportation', icon: '🚗', color: '#4ECDC4' },
  { id: 3, name: 'Shopping', icon: '🛍️', color: '#45B7D1' },
  { id: 4, name: 'Entertainment', icon: '🎬', color: '#96CEB4' },
  { id: 5, name: 'Bills & Utilities', icon: '💡', color: '#FFEAA7' },
  { id: 6, name: 'Healthcare', icon: '🏥', color: '#DDA0DD' },
  { id: 7, name: 'Travel', icon: '✈️', color: '#98D8C8' },
  { id: 8, name: 'Other', icon: '📦', color: '#B8B8B8' },
];

export function useExpenses() {
  const [expenses, setExpenses] = useState([]);

  // Load expenses from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setExpenses(JSON.parse(stored));
    }
  }, []);

  // Save expenses to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  }, [expenses]);

  const addExpense = (expense) => {
    const newExpense = {
      ...expense,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => [newExpense, ...prev]);
    return newExpense;
  };

  const deleteExpense = (id) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
  };

  const getExpensesByCategory = (categoryId) => {
    if (!categoryId) return expenses;
    return expenses.filter((exp) => exp.categoryId === categoryId);
  };

  const getSummary = (period = 'all') => {
    const now = new Date();
    let filteredExpenses = expenses;

    if (period === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      filteredExpenses = expenses.filter(
        (exp) => new Date(exp.date) >= startOfMonth
      );
    } else if (period === 'lastMonth') {
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      filteredExpenses = expenses.filter((exp) => {
        const date = new Date(exp.date);
        return date >= startOfLastMonth && date <= endOfLastMonth;
      });
    } else if (period === 'year') {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      filteredExpenses = expenses.filter(
        (exp) => new Date(exp.date) >= startOfYear
      );
    }

    const total = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    const byCategory = CATEGORIES.map((cat) => {
      const categoryExpenses = filteredExpenses.filter(
        (exp) => exp.categoryId === cat.id
      );
      return {
        ...cat,
        total: categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0),
        count: categoryExpenses.length,
      };
    }).filter((cat) => cat.count > 0);

    return { total, byCategory, count: filteredExpenses.length };
  };

  return {
    expenses,
    categories: CATEGORIES,
    addExpense,
    deleteExpense,
    getExpensesByCategory,
    getSummary,
  };
}
