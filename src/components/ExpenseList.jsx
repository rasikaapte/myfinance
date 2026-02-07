import './ExpenseList.css';

function ExpenseList({ expenses, categories, onDelete }) {
  const getCategoryById = (id) => categories.find((c) => c.id === id) || categories[7];

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

  const groupedExpenses = expenses.reduce((groups, expense) => {
    const date = expense.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(expense);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedExpenses).sort((a, b) => 
    new Date(b) - new Date(a)
  );

  if (expenses.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📊</div>
        <h3>No expenses yet</h3>
        <p>Tap the + button to add your first expense</p>
      </div>
    );
  }

  return (
    <div className="expense-list">
      {sortedDates.map((date) => (
        <div key={date} className="expense-group">
          <div className="date-header">{formatDate(date)}</div>
          {groupedExpenses[date].map((expense) => {
            const category = getCategoryById(expense.categoryId);
            return (
              <div key={expense.id} className="expense-item">
                <div
                  className="expense-icon"
                  style={{ background: category.color }}
                >
                  {category.icon}
                </div>
                <div className="expense-details">
                  <div className="expense-category">{category.name}</div>
                  {expense.description && (
                    <div className="expense-description">{expense.description}</div>
                  )}
                </div>
                <div className="expense-amount">
                  -${expense.amount.toFixed(2)}
                </div>
                <button
                  className="delete-btn"
                  onClick={() => onDelete(expense.id)}
                  title="Delete"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default ExpenseList;
