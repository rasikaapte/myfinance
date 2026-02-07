import { useState } from 'react';
import { useExpenses } from './hooks/useExpenses';
import AddExpense from './components/AddExpense';
import ExpenseList from './components/ExpenseList';
import Summary from './components/Summary';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('expenses');
  const [showAddModal, setShowAddModal] = useState(false);
  const { expenses, categories, addExpense, deleteExpense, getSummary } = useExpenses();

  const handleAddExpense = (expense) => {
    addExpense(expense);
    setShowAddModal(false);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>💰 MyFinance</h1>
        <p>Track your expenses with ease</p>
      </header>

      <nav className="nav">
        <button
          className={`nav-btn ${activeTab === 'expenses' ? 'active' : ''}`}
          onClick={() => setActiveTab('expenses')}
        >
          Expenses
        </button>
        <button
          className={`nav-btn ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          Summary
        </button>
      </nav>

      <main className="main">
        {activeTab === 'expenses' && (
          <ExpenseList
            expenses={expenses}
            categories={categories}
            onDelete={deleteExpense}
          />
        )}
        {activeTab === 'summary' && (
          <Summary getSummary={getSummary} />
        )}
      </main>

      <button className="fab" onClick={() => setShowAddModal(true)}>
        +
      </button>

      {showAddModal && (
        <AddExpense
          categories={categories}
          onAdd={handleAddExpense}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}

export default App;
