import { useState, useEffect } from 'react';

const STORAGE_KEY = 'myfinance_portfolio';

const ACCOUNT_TYPES = [
  { id: 'savings', name: 'Savings Account', icon: '🏦', color: '#4CAF50' },
  { id: 'checking', name: 'Checking Account', icon: '💳', color: '#2196F3' },
  { id: 'emergency', name: 'Emergency Fund', icon: '🛡️', color: '#FF9800' },
  { id: 'stocks', name: 'Stocks', icon: '📈', color: '#9C27B0' },
  { id: 'bonds', name: 'Bonds', icon: '📊', color: '#00BCD4' },
  { id: 'etf', name: 'ETFs', icon: '📉', color: '#E91E63' },
  { id: 'crypto', name: 'Crypto', icon: '₿', color: '#FF5722' },
  { id: '401k', name: '401(k)', icon: '🏛️', color: '#3F51B5' },
  { id: 'ira', name: 'IRA', icon: '📋', color: '#009688' },
  { id: 'other', name: 'Other', icon: '💰', color: '#607D8B' },
];

const INSTITUTIONS = [
  { id: 'chase', name: 'Chase', url: 'https://www.chase.com', icon: '🏦' },
  { id: 'bofa', name: 'Bank of America', url: 'https://www.bankofamerica.com', icon: '🏦' },
  { id: 'wells', name: 'Wells Fargo', url: 'https://www.wellsfargo.com', icon: '🏦' },
  { id: 'citi', name: 'Citibank', url: 'https://www.citi.com', icon: '🏦' },
  { id: 'usbank', name: 'US Bank', url: 'https://www.usbank.com', icon: '🏦' },
  { id: 'capital', name: 'Capital One', url: 'https://www.capitalone.com', icon: '🏦' },
  { id: 'pnc', name: 'PNC Bank', url: 'https://www.pnc.com', icon: '🏦' },
  { id: 'td', name: 'TD Bank', url: 'https://www.td.com', icon: '🏦' },
  { id: 'ally', name: 'Ally Bank', url: 'https://www.ally.com', icon: '🏦' },
  { id: 'discover', name: 'Discover Bank', url: 'https://www.discover.com/online-banking', icon: '🏦' },
  { id: 'marcus', name: 'Marcus by Goldman Sachs', url: 'https://www.marcus.com', icon: '🏦' },
  { id: 'amex', name: 'American Express', url: 'https://www.americanexpress.com', icon: '💳' },
  { id: 'fidelity', name: 'Fidelity', url: 'https://www.fidelity.com', icon: '📈' },
  { id: 'vanguard', name: 'Vanguard', url: 'https://www.vanguard.com', icon: '📈' },
  { id: 'schwab', name: 'Charles Schwab', url: 'https://www.schwab.com', icon: '📈' },
  { id: 'etrade', name: 'E*TRADE', url: 'https://www.etrade.com', icon: '📈' },
  { id: 'robinhood', name: 'Robinhood', url: 'https://www.robinhood.com', icon: '📈' },
  { id: 'webull', name: 'Webull', url: 'https://www.webull.com', icon: '📈' },
  { id: 'merrill', name: 'Merrill Edge', url: 'https://www.merrilledge.com', icon: '📈' },
  { id: 'coinbase', name: 'Coinbase', url: 'https://www.coinbase.com', icon: '₿' },
  { id: 'kraken', name: 'Kraken', url: 'https://www.kraken.com', icon: '₿' },
  { id: 'gemini', name: 'Gemini', url: 'https://www.gemini.com', icon: '₿' },
  { id: 'sofi', name: 'SoFi', url: 'https://www.sofi.com', icon: '🏦' },
  { id: 'betterment', name: 'Betterment', url: 'https://www.betterment.com', icon: '📈' },
  { id: 'wealthfront', name: 'Wealthfront', url: 'https://www.wealthfront.com', icon: '📈' },
  { id: 'other', name: 'Other (custom URL)', url: '', icon: '🔗' },
];

export function usePortfolio() {
  const [accounts, setAccounts] = useState([]);

  // Load accounts from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setAccounts(JSON.parse(stored));
    }
  }, []);

  // Save accounts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  }, [accounts]);

  const addAccount = (account) => {
    const newAccount = {
      ...account,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      history: [
        {
          date: new Date().toISOString().split('T')[0],
          balance: account.balance,
        },
      ],
    };
    setAccounts((prev) => [...prev, newAccount]);
    return newAccount;
  };

  const updateBalance = (id, newBalance) => {
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === id) {
          const today = new Date().toISOString().split('T')[0];
          const existingTodayIndex = acc.history.findIndex(h => h.date === today);
          
          let newHistory;
          if (existingTodayIndex >= 0) {
            // Update today's entry
            newHistory = [...acc.history];
            newHistory[existingTodayIndex] = { date: today, balance: newBalance };
          } else {
            // Add new entry
            newHistory = [...acc.history, { date: today, balance: newBalance }];
          }
          
          return {
            ...acc,
            balance: newBalance,
            history: newHistory,
          };
        }
        return acc;
      })
    );
  };

  const deleteAccount = (id) => {
    setAccounts((prev) => prev.filter((acc) => acc.id !== id));
  };

  const getTotalByCategory = () => {
    const savings = accounts
      .filter(a => ['savings', 'checking', 'emergency'].includes(a.type))
      .reduce((sum, a) => sum + a.balance, 0);
    
    const investments = accounts
      .filter(a => ['stocks', 'bonds', 'etf', 'crypto'].includes(a.type))
      .reduce((sum, a) => sum + a.balance, 0);
    
    const retirement = accounts
      .filter(a => ['401k', 'ira'].includes(a.type))
      .reduce((sum, a) => sum + a.balance, 0);
    
    const other = accounts
      .filter(a => a.type === 'other')
      .reduce((sum, a) => sum + a.balance, 0);

    return { savings, investments, retirement, other };
  };

  const getTotalNetWorth = () => {
    return accounts.reduce((sum, acc) => sum + acc.balance, 0);
  };

  const getAccountGrowth = (id) => {
    const account = accounts.find(a => a.id === id);
    if (!account || account.history.length < 2) return null;
    
    const firstBalance = account.history[0].balance;
    const currentBalance = account.balance;
    const change = currentBalance - firstBalance;
    const percentChange = firstBalance > 0 ? (change / firstBalance) * 100 : 0;
    
    return { change, percentChange };
  };

  return {
    accounts,
    accountTypes: ACCOUNT_TYPES,
    institutions: INSTITUTIONS,
    addAccount,
    updateBalance,
    deleteAccount,
    getTotalByCategory,
    getTotalNetWorth,
    getAccountGrowth,
  };
}
