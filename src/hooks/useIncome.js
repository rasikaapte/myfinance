import { useState, useEffect } from 'react';

const STORAGE_KEY = 'myfinance_income';

const INCOME_SOURCES = [
  { id: 1, name: 'Salary', icon: '💼', color: '#4CAF50' },
  { id: 2, name: 'Freelance', icon: '💻', color: '#2196F3' },
  { id: 3, name: 'Investments', icon: '📈', color: '#9C27B0' },
  { id: 4, name: 'Rental', icon: '🏠', color: '#FF9800' },
  { id: 5, name: 'Business', icon: '🏢', color: '#00BCD4' },
  { id: 6, name: 'Gifts', icon: '🎁', color: '#E91E63' },
  { id: 7, name: 'Refunds', icon: '💰', color: '#8BC34A' },
  { id: 8, name: 'Other', icon: '📦', color: '#607D8B' },
];

export function useIncome() {
  const [incomes, setIncomes] = useState([]);

  // Load incomes from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setIncomes(JSON.parse(stored));
    }
  }, []);

  // Save incomes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(incomes));
  }, [incomes]);

  const addIncome = (income) => {
    const newIncome = {
      ...income,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };
    setIncomes((prev) => [newIncome, ...prev]);
    return newIncome;
  };

  const deleteIncome = (id) => {
    setIncomes((prev) => prev.filter((inc) => inc.id !== id));
  };

  const getSummary = (period = 'all') => {
    const now = new Date();
    let filteredIncomes = incomes;

    if (period === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      filteredIncomes = incomes.filter(
        (inc) => new Date(inc.date) >= startOfMonth
      );
    } else if (period === 'lastMonth') {
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      filteredIncomes = incomes.filter((inc) => {
        const date = new Date(inc.date);
        return date >= startOfLastMonth && date <= endOfLastMonth;
      });
    } else if (period === 'year') {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      filteredIncomes = incomes.filter(
        (inc) => new Date(inc.date) >= startOfYear
      );
    }

    const total = filteredIncomes.reduce((sum, inc) => sum + inc.amount, 0);

    const bySource = INCOME_SOURCES.map((source) => {
      const sourceIncomes = filteredIncomes.filter(
        (inc) => inc.sourceId === source.id
      );
      return {
        ...source,
        total: sourceIncomes.reduce((sum, inc) => sum + inc.amount, 0),
        count: sourceIncomes.length,
      };
    }).filter((source) => source.count > 0);

    return { total, bySource, count: filteredIncomes.length };
  };

  return {
    incomes,
    sources: INCOME_SOURCES,
    addIncome,
    deleteIncome,
    getSummary,
  };
}
