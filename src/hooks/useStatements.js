import { useState, useEffect } from 'react';

const STORAGE_KEY = 'myfinance_statements';

export function useStatements() {
  const [statements, setStatements] = useState([]);

  // Load statements from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setStatements(JSON.parse(stored));
    }
  }, []);

  // Save statements to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(statements));
  }, [statements]);

  const addStatement = (statement) => {
    const newStatement = {
      ...statement,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      isPaid: false,
    };
    setStatements((prev) => [newStatement, ...prev]);
    return newStatement;
  };

  const togglePaid = (id) => {
    setStatements((prev) =>
      prev.map((stmt) =>
        stmt.id === id ? { ...stmt, isPaid: !stmt.isPaid } : stmt
      )
    );
  };

  const deleteStatement = (id) => {
    setStatements((prev) => prev.filter((stmt) => stmt.id !== id));
  };

  const getUpcomingDue = () => {
    const today = new Date();
    const upcoming = statements
      .filter((stmt) => !stmt.isPaid && new Date(stmt.dueDate) >= today)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    return upcoming;
  };

  const getTotalDue = () => {
    return statements
      .filter((stmt) => !stmt.isPaid)
      .reduce((sum, stmt) => sum + stmt.amount, 0);
  };

  return {
    statements,
    addStatement,
    togglePaid,
    deleteStatement,
    getUpcomingDue,
    getTotalDue,
  };
}
