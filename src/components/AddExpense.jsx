import { useState } from 'react';
import './AddExpense.css';

function AddExpense({ categories, onAdd, onClose }) {
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 1);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    onAdd({
      amount: parseFloat(amount),
      categoryId,
      description,
      date,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Expense</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Amount</label>
            <div className="amount-input">
              <span className="currency">$</span>
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
            <label>Category</label>
            <div className="category-grid">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`category-btn ${categoryId === cat.id ? 'selected' : ''}`}
                  style={{ '--cat-color': cat.color }}
                  onClick={() => setCategoryId(cat.id)}
                >
                  <span className="cat-icon">{cat.icon}</span>
                  <span className="cat-name">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Description (optional)</label>
            <input
              type="text"
              placeholder="What was this expense for?"
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
            Add Expense
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddExpense;
