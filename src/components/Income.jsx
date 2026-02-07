import { useState } from 'react';
import './Income.css';

function Income({ incomes, sources, onAdd, onDelete, getSummary }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [sourceId, setSourceId] = useState(sources[0]?.id || 1);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [period, setPeriod] = useState('month');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    onAdd({
      amount: parseFloat(amount),
      sourceId,
      description,
      date,
    });

    // Reset form
    setAmount('');
    setSourceId(sources[0]?.id || 1);
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setShowAddForm(false);
  };

  const getSourceById = (id) => sources.find((s) => s.id === id) || sources[7];

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  };

  const summary = getSummary(period);
  const periodLabels = {
    month: 'This Month',
    lastMonth: 'Last Month',
    year: 'This Year',
    all: 'All Time',
  };

  const groupedIncomes = incomes.reduce((groups, income) => {
    const date = income.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(income);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedIncomes).sort((a, b) => 
    new Date(b) - new Date(a)
  );

  return (
    <div className="income">
      <div className="income-header">
        <div className="period-selector">
          {Object.entries(periodLabels).map(([key, label]) => (
            <button
              key={key}
              className={`period-btn ${period === key ? 'active' : ''}`}
              onClick={() => setPeriod(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="total-income-card">
          <div className="total-income-label">Total Income</div>
          <div className="total-income-amount">+${summary.total.toFixed(2)}</div>
          <div className="total-income-count">
            {summary.count} transaction{summary.count !== 1 ? 's' : ''}
          </div>
        </div>

        {summary.bySource.length > 0 && (
          <div className="income-breakdown">
            {summary.bySource.map((source) => (
              <div key={source.id} className="income-source-chip" style={{ background: source.color + '20', color: source.color }}>
                <span>{source.icon}</span>
                <span>${source.total.toFixed(0)}</span>
              </div>
            ))}
          </div>
        )}

        <button 
          className="add-income-btn"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : '+ Add Income'}
        </button>
      </div>

      {showAddForm && (
        <form className="add-income-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Amount</label>
            <div className="amount-input">
              <span>$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Source</label>
            <div className="source-grid">
              {sources.map((source) => (
                <button
                  key={source.id}
                  type="button"
                  className={`source-btn ${sourceId === source.id ? 'selected' : ''}`}
                  onClick={() => setSourceId(source.id)}
                >
                  <span className="source-icon">{source.icon}</span>
                  <span className="source-name">{source.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Description (optional)</label>
            <input
              type="text"
              placeholder="e.g., Monthly salary, Client payment"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="submit-btn">
            Add Income
          </button>
        </form>
      )}

      <div className="income-list">
        {incomes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💵</div>
            <h3>No income recorded</h3>
            <p>Add your income to track your earnings</p>
          </div>
        ) : (
          sortedDates.map((date) => (
            <div key={date} className="income-group">
              <div className="date-header">{formatDate(date)}</div>
              {groupedIncomes[date].map((income) => {
                const source = getSourceById(income.sourceId);
                return (
                  <div key={income.id} className="income-item">
                    <div
                      className="income-icon"
                      style={{ background: source.color }}
                    >
                      {source.icon}
                    </div>
                    <div className="income-details">
                      <div className="income-source">{source.name}</div>
                      {income.description && (
                        <div className="income-description">{income.description}</div>
                      )}
                    </div>
                    <div className="income-amount">
                      +${income.amount.toFixed(2)}
                    </div>
                    <button
                      className="delete-btn"
                      onClick={() => onDelete(income.id)}
                      title="Delete"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Income;
