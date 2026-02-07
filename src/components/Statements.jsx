import { useState } from 'react';
import './Statements.css';

function Statements({ statements, onAdd, onTogglePaid, onDelete, getTotalDue }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [cardName, setCardName] = useState('');
  const [amount, setAmount] = useState('');
  const [statementDate, setStatementDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [minPayment, setMinPayment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!cardName || !amount || !dueDate) return;

    onAdd({
      cardName,
      amount: parseFloat(amount),
      statementDate,
      dueDate,
      minPayment: minPayment ? parseFloat(minPayment) : null,
    });

    // Reset form
    setCardName('');
    setAmount('');
    setStatementDate(new Date().toISOString().split('T')[0]);
    setDueDate('');
    setMinPayment('');
    setShowAddForm(false);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDueStatus = (dueDate, isPaid) => {
    if (isPaid) return { text: 'Paid', class: 'paid' };
    const days = getDaysUntilDue(dueDate);
    if (days < 0) return { text: 'Overdue', class: 'overdue' };
    if (days === 0) return { text: 'Due Today', class: 'due-today' };
    if (days <= 7) return { text: `Due in ${days} days`, class: 'due-soon' };
    return { text: `Due ${formatDate(dueDate)}`, class: 'upcoming' };
  };

  const totalDue = getTotalDue();

  return (
    <div className="statements">
      <div className="statements-header">
        <div className="total-due-card">
          <div className="total-due-label">Total Outstanding</div>
          <div className="total-due-amount">${totalDue.toFixed(2)}</div>
          <div className="total-due-count">
            {statements.filter(s => !s.isPaid).length} unpaid statement{statements.filter(s => !s.isPaid).length !== 1 ? 's' : ''}
          </div>
        </div>

        <button 
          className="add-statement-btn"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : '+ Add Statement'}
        </button>
      </div>

      {showAddForm && (
        <form className="add-statement-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Credit Card Name</label>
              <input
                type="text"
                placeholder="e.g., Chase Sapphire"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row two-col">
            <div className="form-group">
              <label>Statement Amount</label>
              <div className="amount-input">
                <span>$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Minimum Payment</label>
              <div className="amount-input">
                <span>$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={minPayment}
                  onChange={(e) => setMinPayment(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-row two-col">
            <div className="form-group">
              <label>Statement Date</label>
              <input
                type="date"
                value={statementDate}
                onChange={(e) => setStatementDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="submit-btn">
            Add Statement
          </button>
        </form>
      )}

      <div className="statements-list">
        {statements.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💳</div>
            <h3>No statements yet</h3>
            <p>Add your credit card statements to track due dates and payments</p>
          </div>
        ) : (
          statements
            .sort((a, b) => {
              // Unpaid first, then by due date
              if (a.isPaid !== b.isPaid) return a.isPaid ? 1 : -1;
              return new Date(a.dueDate) - new Date(b.dueDate);
            })
            .map((stmt) => {
              const status = getDueStatus(stmt.dueDate, stmt.isPaid);
              return (
                <div key={stmt.id} className={`statement-card ${stmt.isPaid ? 'paid' : ''}`}>
                  <div className="statement-main">
                    <div className="statement-icon">💳</div>
                    <div className="statement-details">
                      <div className="statement-card-name">{stmt.cardName}</div>
                      <div className="statement-dates">
                        Statement: {formatDate(stmt.statementDate)}
                      </div>
                    </div>
                    <div className="statement-amount-section">
                      <div className="statement-amount">${stmt.amount.toFixed(2)}</div>
                      {stmt.minPayment && (
                        <div className="min-payment">Min: ${stmt.minPayment.toFixed(2)}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="statement-footer">
                    <span className={`due-status ${status.class}`}>
                      {status.text}
                    </span>
                    <div className="statement-actions">
                      <button
                        className={`pay-btn ${stmt.isPaid ? 'unpay' : ''}`}
                        onClick={() => onTogglePaid(stmt.id)}
                      >
                        {stmt.isPaid ? 'Mark Unpaid' : 'Mark Paid'}
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => onDelete(stmt.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
}

export default Statements;
