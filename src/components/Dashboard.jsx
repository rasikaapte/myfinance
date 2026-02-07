import { useState } from 'react';
import './Dashboard.css';

function Dashboard({ 
  expenses, 
  incomes, 
  statements, 
  categories,
  sources,
  netWorth = 0
}) {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState({
    month: today.getMonth(),
    year: today.getFullYear()
  });

  // Get month boundaries
  const getMonthBounds = (month, year) => {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    return { start, end };
  };

  const { start: monthStart, end: monthEnd } = getMonthBounds(selectedMonth.month, selectedMonth.year);

  // Filter data by selected month
  const monthExpenses = expenses.filter(e => {
    const date = new Date(e.date);
    return date >= monthStart && date <= monthEnd;
  });

  const monthIncomes = incomes.filter(i => {
    const date = new Date(i.date);
    return date >= monthStart && date <= monthEnd;
  });

  // Calculate totals
  const totalExpenses = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = monthIncomes.reduce((sum, i) => sum + i.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  // Get expense breakdown by category
  const expensesByCategory = categories.map(cat => {
    const catExpenses = monthExpenses.filter(e => e.categoryId === cat.id);
    return {
      ...cat,
      total: catExpenses.reduce((sum, e) => sum + e.amount, 0),
      count: catExpenses.length
    };
  }).filter(cat => cat.count > 0).sort((a, b) => b.total - a.total);

  // Navigation functions
  const goToPrevMonth = () => {
    setSelectedMonth(prev => {
      if (prev.month === 0) {
        return { month: 11, year: prev.year - 1 };
      }
      return { month: prev.month - 1, year: prev.year };
    });
  };

  const goToNextMonth = () => {
    setSelectedMonth(prev => {
      if (prev.month === 11) {
        return { month: 0, year: prev.year + 1 };
      }
      return { month: prev.month + 1, year: prev.year };
    });
  };

  const goToCurrentMonth = () => {
    setSelectedMonth({
      month: today.getMonth(),
      year: today.getFullYear()
    });
  };

  const isCurrentMonth = selectedMonth.month === today.getMonth() && 
                         selectedMonth.year === today.getFullYear();

  const monthName = new Date(selectedMonth.year, selectedMonth.month).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });
  
  // Get upcoming statements (unpaid, due within 30 days)
  const upcomingStatements = statements
    .filter(s => !s.isPaid)
    .filter(s => {
      const dueDate = new Date(s.dueDate);
      const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 30;
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 3);

  // Get transactions for selected month
  const monthTransactions = [
    ...monthExpenses.map(e => ({
      ...e,
      type: 'expense',
      category: categories.find(c => c.id === e.categoryId) || categories[7]
    })),
    ...monthIncomes.map(i => ({
      ...i,
      type: 'income',
      source: sources.find(s => s.id === i.sourceId) || sources[7]
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getDaysUntilDue = (dueDate) => {
    const due = new Date(dueDate);
    const diffTime = due - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Calculate savings rate
  const savingsRate = totalIncome > 0 
    ? ((netBalance / totalIncome) * 100).toFixed(0)
    : 0;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="dashboard">
      {/* Net Worth Banner */}
      {netWorth > 0 && (
        <div className="net-worth-banner">
          <div className="net-worth-label">Net Worth</div>
          <div className="net-worth-value">{formatCurrency(netWorth)}</div>
        </div>
      )}

      {/* Month Selector */}
      <div className="month-selector">
        <button className="month-nav-btn" onClick={goToPrevMonth}>
          ‹
        </button>
        <div className="month-display">
          <span className="month-name">{monthName}</span>
          {!isCurrentMonth && (
            <button className="today-btn" onClick={goToCurrentMonth}>
              Today
            </button>
          )}
        </div>
        <button className="month-nav-btn" onClick={goToNextMonth}>
          ›
        </button>
      </div>

      {/* Overview Cards */}
      <div className="overview-cards">
        <div className="overview-card income-card">
          <div className="card-icon">📈</div>
          <div className="card-content">
            <div className="card-label">Income</div>
            <div className="card-amount">+${totalIncome.toFixed(2)}</div>
            <div className="card-period">{monthIncomes.length} transaction{monthIncomes.length !== 1 ? 's' : ''}</div>
          </div>
        </div>

        <div className="overview-card expense-card">
          <div className="card-icon">📉</div>
          <div className="card-content">
            <div className="card-label">Expenses</div>
            <div className="card-amount">-${totalExpenses.toFixed(2)}</div>
            <div className="card-period">{monthExpenses.length} transaction{monthExpenses.length !== 1 ? 's' : ''}</div>
          </div>
        </div>

        <div className={`overview-card balance-card ${netBalance >= 0 ? 'positive' : 'negative'}`}>
          <div className="card-icon">{netBalance >= 0 ? '💰' : '⚠️'}</div>
          <div className="card-content">
            <div className="card-label">Net Balance</div>
            <div className="card-amount">
              {netBalance >= 0 ? '+' : '-'}${Math.abs(netBalance).toFixed(2)}
            </div>
            <div className="card-period">
              {totalIncome > 0 && netBalance >= 0 && `${savingsRate}% saved`}
              {netBalance < 0 && 'Over budget'}
            </div>
          </div>
        </div>
      </div>

      {/* Spending Breakdown */}
      {expensesByCategory.length > 0 && (
        <div className="dashboard-section">
          <h3>Spending Breakdown</h3>
          <div className="spending-bars">
            {expensesByCategory.slice(0, 4).map((cat) => {
              const percentage = totalExpenses > 0 
                ? (cat.total / totalExpenses) * 100 
                : 0;
              return (
                <div key={cat.id} className="spending-bar-item">
                  <div className="spending-bar-header">
                    <span className="spending-category">
                      {cat.icon} {cat.name}
                    </span>
                    <span className="spending-amount">${cat.total.toFixed(0)}</span>
                  </div>
                  <div className="spending-bar">
                    <div 
                      className="spending-bar-fill"
                      style={{ width: `${percentage}%`, background: cat.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming Payments */}
      {upcomingStatements.length > 0 && (
        <div className="dashboard-section">
          <h3>Upcoming Payments</h3>
          <div className="upcoming-list">
            {upcomingStatements.map((stmt) => {
              const daysUntil = getDaysUntilDue(stmt.dueDate);
              return (
                <div key={stmt.id} className="upcoming-item">
                  <div className="upcoming-icon">💳</div>
                  <div className="upcoming-details">
                    <div className="upcoming-name">{stmt.cardName}</div>
                    <div className="upcoming-due">
                      {daysUntil === 0 ? 'Due today' : 
                       daysUntil === 1 ? 'Due tomorrow' : 
                       `Due in ${daysUntil} days`}
                    </div>
                  </div>
                  <div className="upcoming-amount">${stmt.amount.toFixed(2)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Transactions This Month */}
      <div className="dashboard-section">
        <h3>Transactions</h3>
        {monthTransactions.length === 0 ? (
          <div className="empty-transactions">
            <p>No transactions in {monthName}</p>
          </div>
        ) : (
          <div className="transactions-list">
            {monthTransactions.map((tx) => (
              <div key={`${tx.type}-${tx.id}`} className="transaction-item">
                <div 
                  className="transaction-icon"
                  style={{ 
                    background: tx.type === 'expense' 
                      ? tx.category.color 
                      : tx.source.color 
                  }}
                >
                  {tx.type === 'expense' ? tx.category.icon : tx.source.icon}
                </div>
                <div className="transaction-details">
                  <div className="transaction-name">
                    {tx.type === 'expense' ? tx.category.name : tx.source.name}
                  </div>
                  <div className="transaction-date">{formatDate(tx.date)}</div>
                </div>
                <div className={`transaction-amount ${tx.type}`}>
                  {tx.type === 'expense' ? '-' : '+'}${tx.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-item">
          <div className="stat-value">{monthExpenses.length}</div>
          <div className="stat-label">Expenses</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{monthIncomes.length}</div>
          <div className="stat-label">Income</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{statements.filter(s => !s.isPaid).length}</div>
          <div className="stat-label">Unpaid Bills</div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
