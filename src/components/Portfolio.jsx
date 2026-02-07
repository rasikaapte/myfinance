import { useState } from 'react';
import './Portfolio.css';

function Portfolio({ 
  accounts, 
  accountTypes,
  institutions,
  onAdd, 
  onUpdateBalance, 
  onDelete,
  getTotalByCategory,
  getTotalNetWorth,
  getAccountGrowth
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editBalance, setEditBalance] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('savings');
  const [balance, setBalance] = useState('');
  const [institutionId, setInstitutionId] = useState('');
  const [customUrl, setCustomUrl] = useState('');

  const totals = getTotalByCategory();
  const netWorth = getTotalNetWorth();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !balance) return;

    const institution = institutions.find(i => i.id === institutionId);
    const websiteUrl = institutionId === 'other' ? customUrl : (institution?.url || '');

    onAdd({
      name,
      type,
      balance: parseFloat(balance),
      institutionId,
      websiteUrl,
    });

    setName('');
    setType('savings');
    setBalance('');
    setInstitutionId('');
    setCustomUrl('');
    setShowAddForm(false);
  };

  const handleUpdateBalance = (id) => {
    if (editBalance && parseFloat(editBalance) >= 0) {
      onUpdateBalance(id, parseFloat(editBalance));
    }
    setEditingId(null);
    setEditBalance('');
  };

  const startEditing = (account) => {
    setEditingId(account.id);
    setEditBalance(account.balance.toString());
  };

  const getTypeInfo = (typeId) => {
    return accountTypes.find(t => t.id === typeId) || accountTypes[accountTypes.length - 1];
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Group accounts by category
  const savingsAccounts = accounts.filter(a => ['savings', 'checking', 'emergency'].includes(a.type));
  const investmentAccounts = accounts.filter(a => ['stocks', 'bonds', 'etf', 'crypto'].includes(a.type));
  const retirementAccounts = accounts.filter(a => ['401k', 'ira'].includes(a.type));
  const otherAccounts = accounts.filter(a => a.type === 'other');

  const renderAccountGroup = (title, groupAccounts, totalAmount, icon) => {
    if (groupAccounts.length === 0) return null;
    
    return (
      <div className="account-group">
        <div className="group-header">
          <span className="group-icon">{icon}</span>
          <span className="group-title">{title}</span>
          <span className="group-total">{formatCurrency(totalAmount)}</span>
        </div>
        <div className="accounts-list">
          {groupAccounts.map((account) => {
            const typeInfo = getTypeInfo(account.type);
            const growth = getAccountGrowth(account.id);
            
            return (
              <div key={account.id} className="account-item">
                <div 
                  className="account-icon"
                  style={{ background: typeInfo.color }}
                >
                  {typeInfo.icon}
                </div>
                <div className="account-details">
                  <div className="account-name">{account.name}</div>
                  <div className="account-type">{typeInfo.name}</div>
                </div>
                <div className="account-balance-section">
                  {editingId === account.id ? (
                    <div className="edit-balance">
                      <input
                        type="number"
                        value={editBalance}
                        onChange={(e) => setEditBalance(e.target.value)}
                        autoFocus
                        onBlur={() => handleUpdateBalance(account.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleUpdateBalance(account.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                      />
                    </div>
                  ) : (
                    <>
                      <div 
                        className="account-balance"
                        onClick={() => startEditing(account)}
                        title="Click to update"
                      >
                        {formatCurrency(account.balance)}
                      </div>
                      {growth && (
                        <div className={`account-growth ${growth.change >= 0 ? 'positive' : 'negative'}`}>
                          {growth.change >= 0 ? '+' : ''}{growth.percentChange.toFixed(1)}%
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="account-actions">
                  {account.websiteUrl && (
                    <a
                      href={account.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="website-btn"
                      title="Open website"
                      onClick={(e) => e.stopPropagation()}
                    >
                      🔗
                    </a>
                  )}
                  <button
                    className="delete-btn"
                    onClick={() => onDelete(account.id)}
                    title="Delete"
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="portfolio">
      {/* Net Worth Card */}
      <div className="net-worth-card">
        <div className="net-worth-label">Total Net Worth</div>
        <div className="net-worth-amount">{formatCurrency(netWorth)}</div>
        <div className="net-worth-breakdown">
          {totals.savings > 0 && (
            <div className="breakdown-item">
              <span className="breakdown-dot savings"></span>
              <span>Savings {formatCurrency(totals.savings)}</span>
            </div>
          )}
          {totals.investments > 0 && (
            <div className="breakdown-item">
              <span className="breakdown-dot investments"></span>
              <span>Investments {formatCurrency(totals.investments)}</span>
            </div>
          )}
          {totals.retirement > 0 && (
            <div className="breakdown-item">
              <span className="breakdown-dot retirement"></span>
              <span>Retirement {formatCurrency(totals.retirement)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Add Account Button */}
      <button 
        className="add-account-btn"
        onClick={() => setShowAddForm(!showAddForm)}
      >
        {showAddForm ? 'Cancel' : '+ Add Account'}
      </button>

      {/* Add Account Form */}
      {showAddForm && (
        <form className="add-account-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Account Name</label>
            <input
              type="text"
              placeholder="e.g., Chase Savings, Fidelity 401k"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Account Type</label>
            <div className="type-grid">
              {accountTypes.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`type-btn ${type === t.id ? 'selected' : ''}`}
                  onClick={() => setType(t.id)}
                >
                  <span className="type-icon">{t.icon}</span>
                  <span className="type-name">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Current Balance</label>
            <div className="amount-input">
              <span>$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Bank / Institution (optional)</label>
            <select 
              value={institutionId} 
              onChange={(e) => setInstitutionId(e.target.value)}
              className="institution-select"
            >
              <option value="">Select institution...</option>
              <optgroup label="Banks">
                {institutions.filter(i => ['chase', 'bofa', 'wells', 'citi', 'usbank', 'capital', 'pnc', 'td', 'ally', 'discover', 'marcus', 'sofi'].includes(i.id)).map(i => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </optgroup>
              <optgroup label="Credit Cards">
                {institutions.filter(i => ['amex'].includes(i.id)).map(i => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </optgroup>
              <optgroup label="Investments">
                {institutions.filter(i => ['fidelity', 'vanguard', 'schwab', 'etrade', 'robinhood', 'webull', 'merrill', 'betterment', 'wealthfront'].includes(i.id)).map(i => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </optgroup>
              <optgroup label="Crypto">
                {institutions.filter(i => ['coinbase', 'kraken', 'gemini'].includes(i.id)).map(i => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </optgroup>
              <option value="other">Other (custom URL)</option>
            </select>
          </div>

          {institutionId === 'other' && (
            <div className="form-group">
              <label>Website URL</label>
              <input
                type="url"
                placeholder="https://www.example.com"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
              />
            </div>
          )}

          <button type="submit" className="submit-btn">
            Add Account
          </button>
        </form>
      )}

      {/* Account Groups */}
      {accounts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💎</div>
          <h3>No accounts yet</h3>
          <p>Add your savings and investment accounts to track your net worth</p>
        </div>
      ) : (
        <>
          {renderAccountGroup('Savings & Cash', savingsAccounts, totals.savings, '🏦')}
          {renderAccountGroup('Investments', investmentAccounts, totals.investments, '📈')}
          {renderAccountGroup('Retirement', retirementAccounts, totals.retirement, '🏛️')}
          {renderAccountGroup('Other', otherAccounts, totals.other, '💰')}
        </>
      )}
    </div>
  );
}

export default Portfolio;
