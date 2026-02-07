import { useState } from 'react';
import './Summary.css';

function Summary({ getSummary }) {
  const [period, setPeriod] = useState('month');
  const summary = getSummary(period);

  const periodLabels = {
    month: 'This Month',
    lastMonth: 'Last Month',
    year: 'This Year',
    all: 'All Time',
  };

  return (
    <div className="summary">
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

      <div className="total-card">
        <div className="total-label">Total Spent</div>
        <div className="total-amount">${summary.total.toFixed(2)}</div>
        <div className="total-count">{summary.count} expense{summary.count !== 1 ? 's' : ''}</div>
      </div>

      {summary.byCategory.length > 0 ? (
        <div className="category-breakdown">
          <h3>By Category</h3>
          <div className="category-list">
            {summary.byCategory.map((cat) => {
              const percentage = summary.total > 0 
                ? (cat.total / summary.total) * 100 
                : 0;
              
              return (
                <div key={cat.id} className="category-row">
                  <div className="category-info">
                    <div
                      className="category-color"
                      style={{ background: cat.color }}
                    >
                      {cat.icon}
                    </div>
                    <div className="category-details">
                      <div className="category-name">{cat.name}</div>
                      <div className="category-count">{cat.count} expense{cat.count !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                  <div className="category-stats">
                    <div className="category-amount">${cat.total.toFixed(2)}</div>
                    <div className="category-percentage">{percentage.toFixed(1)}%</div>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${percentage}%`,
                        background: cat.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="empty-summary">
          <p>No expenses in this period</p>
        </div>
      )}
    </div>
  );
}

export default Summary;
