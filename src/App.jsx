import { useState } from 'react';
import { useExpenses } from './hooks/useExpenses';
import { useStatements } from './hooks/useStatements';
import { useIncome } from './hooks/useIncome';
import { usePortfolio } from './hooks/usePortfolio';
import AddExpense from './components/AddExpense';
import Dashboard from './components/Dashboard';
import ExpenseList from './components/ExpenseList';
import Statements from './components/Statements';
import Income from './components/Income';
import Portfolio from './components/Portfolio';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const { expenses, categories, addExpense, deleteExpense } = useExpenses();
  const { statements, addStatement, togglePaid, deleteStatement, getTotalDue } = useStatements();
  const { incomes, sources, addIncome, deleteIncome, getSummary: getIncomeSummary } = useIncome();
  const { 
    accounts, 
    accountTypes,
    institutions,
    addAccount, 
    updateBalance, 
    deleteAccount,
    getTotalByCategory,
    getTotalNetWorth,
    getAccountGrowth
  } = usePortfolio();

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
          className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Home
        </button>
        <button
          className={`nav-btn ${activeTab === 'expenses' ? 'active' : ''}`}
          onClick={() => setActiveTab('expenses')}
        >
          Expenses
        </button>
        <button
          className={`nav-btn ${activeTab === 'income' ? 'active' : ''}`}
          onClick={() => setActiveTab('income')}
        >
          Income
        </button>
        <button
          className={`nav-btn ${activeTab === 'portfolio' ? 'active' : ''}`}
          onClick={() => setActiveTab('portfolio')}
        >
          Portfolio
        </button>
        <button
          className={`nav-btn ${activeTab === 'statements' ? 'active' : ''}`}
          onClick={() => setActiveTab('statements')}
        >
          Bills
        </button>
      </nav>

      <main className="main">
        {activeTab === 'dashboard' && (
          <Dashboard
            expenses={expenses}
            incomes={incomes}
            statements={statements}
            categories={categories}
            sources={sources}
            netWorth={getTotalNetWorth()}
          />
        )}
        {activeTab === 'expenses' && (
          <ExpenseList
            expenses={expenses}
            categories={categories}
            onDelete={deleteExpense}
          />
        )}
        {activeTab === 'income' && (
          <Income
            incomes={incomes}
            sources={sources}
            onAdd={addIncome}
            onDelete={deleteIncome}
            getSummary={getIncomeSummary}
          />
        )}
        {activeTab === 'portfolio' && (
          <Portfolio
            accounts={accounts}
            accountTypes={accountTypes}
            institutions={institutions}
            onAdd={addAccount}
            onUpdateBalance={updateBalance}
            onDelete={deleteAccount}
            getTotalByCategory={getTotalByCategory}
            getTotalNetWorth={getTotalNetWorth}
            getAccountGrowth={getAccountGrowth}
          />
        )}
        {activeTab === 'statements' && (
          <Statements
            statements={statements}
            onAdd={addStatement}
            onTogglePaid={togglePaid}
            onDelete={deleteStatement}
            getTotalDue={getTotalDue}
          />
        )}
      </main>

      {activeTab === 'expenses' && (
        <button className="fab" onClick={() => setShowAddModal(true)}>
          +
        </button>
      )}

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
