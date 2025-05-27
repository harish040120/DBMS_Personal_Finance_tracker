export interface Transaction {
  id: number;
  description: string;
  amount: number;
  category: string;
  accountId: number; // CHANGED FROM 'account' TO 'accountId'
  date: string;
  transactionType: 'income' | 'expense';
}

export interface Category {
  id: number;
  name: string;
  color: string;
}

export interface Account {
  id: number;
  name: string;
  balance: number;
}

export interface DashboardData {
  balance: number;
  income: number;
  expenses: number;
  recentTransactions: Transaction[];
  monthlyData: { name: string; income: number; expense: number }[];
  categoryData: { name: string; value: number; color?: string }[];
}

const API_BASE_URL = 'http://localhost:3001/api';

export const fetchTransactions = async (): Promise<Transaction[]> => {
  const response = await fetch(`${API_BASE_URL}/transactions`);
  if (!response.ok) throw new Error('Failed to fetch transactions');
  const data = await response.json();
  return data.map((t: any) => ({
    id: t.Transaction_ID,
    description: t.Note || '',
    amount: t.Transaction_Type === 'income' ? t.Amount : -t.Amount,
    category: t.Category || 'Other',
    accountId: t.Account_ID,
    date: t.Date,
    transactionType: t.Transaction_Type
  }));
};

export const createTransaction = async (transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
  const response = await fetch(`${API_BASE_URL}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: Math.abs(transaction.amount),
      date: transaction.date,
      note: transaction.description,
      category: transaction.category,
      accountId: transaction.accountId,
      transactionType: transaction.transactionType
    })
  });
  
  if (!response.ok) throw new Error('Failed to create transaction');
  const data = await response.json();
  return { ...transaction, id: data.id };
};

export const updateTransaction = async (id: number, transaction: Transaction): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: Math.abs(transaction.amount),
      date: transaction.date,
      note: transaction.description,
      category: transaction.category,
      accountId: transaction.accountId,
      transactionType: transaction.transactionType
    })
  });
  if (!response.ok) throw new Error('Failed to update transaction');
};

export const deleteTransaction = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/transactions/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete transaction');
};

export const fetchCategories = async (): Promise<Category[]> => {
  const response = await fetch(`${API_BASE_URL}/categories`);
  if (!response.ok) throw new Error('Failed to fetch categories');
  const data = await response.json();
  return data.map((c: any) => ({ 
    id: c.id, 
    name: c.name, 
    color: c.color 
  }));
};

export const fetchAccounts = async (): Promise<Account[]> => {
  const response = await fetch(`${API_BASE_URL}/accounts`);
  if (!response.ok) throw new Error('Failed to fetch accounts');
  const data = await response.json();
  return data.map((a: any) => ({ id: a.Account_ID, name: a.Account_Name, balance: a.Balance }));
};

export const fetchDashboardData = async (): Promise<DashboardData> => {
  const response = await fetch(`${API_BASE_URL}/dashboard`);
  if (!response.ok) throw new Error('Failed to fetch dashboard data');
  const data = await response.json();
  
  return {
    balance: data.balance || 0,
    income: data.monthlySummary[0]?.income || 0,
    expenses: data.monthlySummary[0]?.expense || 0,
    recentTransactions: data.recentTransactions?.map((t: any) => ({
      id: t.Transaction_ID,
      description: t.Note || '',
      amount: t.Transaction_Type === 'income' ? t.Amount : -t.Amount,
      category: t.Category || 'Other',
      accountId: t.Account_ID,
      date: t.Date,
      transactionType: t.Transaction_Type
    })) || [],
    monthlyData: data.monthlySummary?.map((m: any) => ({
      name: m.month,
      income: m.income || 0,
      expense: m.expense || 0
    })) || [],
    categoryData: data.categorySpending?.map((c: any) => ({
      name: c.Name,
      value: c.total || 0,
      color: c.Color
    })) || []
  };
};