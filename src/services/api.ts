import { format } from 'date-fns';

// Types
export interface Transaction {
  id: number;
  description: string;
  amount: number; // positive for income, negative for expense
  category: string;
  date: string; // ISO string
}

export interface Category {
  id: number;
  name: string;
  color: string;
}

export interface DashboardData {
  balance: number;
  income: number;
  expenses: number;
  recentTransactions: Transaction[];
  monthlyData: { name: string; income: number; expense: number }[];
  categoryData: { name: string; value: number }[];
}

export interface ReportData {
  chartData: Record<string, any>[];
  categoryData: { name: string; value: number }[];
  series: string[];
  summary: { label: string; value: number; change: number }[];
}

// Mock Data Functions
const generateMockTransactions = (): Transaction[] => {
  const transactions: Transaction[] = [];
  const categories = ['Food', 'Transportation', 'Entertainment', 'Shopping', 'Utilities', 'Housing', 'Income'];
  const now = new Date();
  
  // Generate 20 transactions over the last 30 days
  for (let i = 0; i < 20; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    const isIncome = Math.random() > 0.7; // 30% chance of being income
    const category = isIncome ? 'Income' : categories[Math.floor(Math.random() * (categories.length - 1))];
    
    transactions.push({
      id: i + 1,
      description: isIncome 
        ? ['Salary', 'Freelance Work', 'Investment Return', 'Gift'][Math.floor(Math.random() * 4)]
        : ['Grocery Shopping', 'Restaurant', 'Coffee', 'Gas', 'Movie Tickets', 'Rent', 'Electric Bill'][Math.floor(Math.random() * 7)],
      amount: isIncome 
        ? Math.floor(Math.random() * 2000) + 500 // income between $500-$2500
        : -(Math.floor(Math.random() * 200) + 10), // expense between $10-$210
      category,
      date: date.toISOString(),
    });
  }
  
  // Sort by date, newest first
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const generateMockCategories = (): Category[] => {
  return [
    { id: 1, name: 'Food', color: '#FF9F0A' },
    { id: 2, name: 'Transportation', color: '#5E5CE6' },
    { id: 3, name: 'Entertainment', color: '#FF3B30' },
    { id: 4, name: 'Shopping', color: '#FF2D55' },
    { id: 5, name: 'Utilities', color: '#64D2FF' },
    { id: 6, name: 'Housing', color: '#BF5AF2' },
    { id: 7, name: 'Income', color: '#30D158' },
    { id: 8, name: 'Other', color: '#8E8E93' },
  ];
};

const generateMockDashboardData = (transactions: Transaction[]): DashboardData => {
  // Calculate balance, income, expenses
  const balance = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const income = transactions
    .filter(transaction => transaction.amount > 0)
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const expenses = Math.abs(
    transactions
      .filter(transaction => transaction.amount < 0)
      .reduce((sum, transaction) => sum + transaction.amount, 0)
  );
  
  // Recent transactions (top 5)
  const recentTransactions = transactions.slice(0, 5);
  
  // Monthly data
  const monthlyData = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const month = new Date(now);
    month.setMonth(month.getMonth() - i);
    
    const monthName = format(month, 'MMM');
    monthlyData.unshift({
      name: monthName,
      income: Math.floor(Math.random() * 3000) + 2000,
      expense: Math.floor(Math.random() * 2000) + 1000,
    });
  }
  
  // Category data
  const categoryData = [
    { name: 'Food', value: Math.floor(Math.random() * 500) + 300 },
    { name: 'Transportation', value: Math.floor(Math.random() * 300) + 100 },
    { name: 'Entertainment', value: Math.floor(Math.random() * 200) + 100 },
    { name: 'Shopping', value: Math.floor(Math.random() * 400) + 200 },
    { name: 'Utilities', value: Math.floor(Math.random() * 300) + 150 },
  ];
  
  return {
    balance,
    income,
    expenses,
    recentTransactions,
    monthlyData,
    categoryData,
  };
};

const generateMockReportData = (reportType: string, timeRange: string): ReportData => {
  let chartData: Record<string, any>[] = [];
  let categoryData: { name: string; value: number }[] = [];
  let series: string[] = [];
  let summary: { label: string; value: number; change: number }[] = [];
  
  // Generate chart data based on report type
  if (reportType === 'spending' || reportType === 'income') {
    // For spending and income, show bar/line chart over time
    series = reportType === 'spending' ? ['Food', 'Transportation', 'Entertainment', 'Shopping', 'Utilities'] : ['Salary', 'Freelance', 'Investments'];
    
    const periods = timeRange === 'week' ? 7 : timeRange === 'month' ? 6 : timeRange === 'quarter' ? 3 : 12;
    const isDaily = timeRange === 'week';
    
    const now = new Date();
    for (let i = 0; i < periods; i++) {
      const date = new Date(now);
      if (isDaily) {
        date.setDate(date.getDate() - i);
      } else if (timeRange === 'month') {
        date.setDate(date.getDate() - i * 5);
      } else if (timeRange === 'quarter') {
        date.setMonth(date.getMonth() - i);
      } else {
        date.setMonth(date.getMonth() - i);
      }
      
      const dataPoint: Record<string, any> = {
        name: isDaily ? format(date, 'EEE') : format(date, 'MMM'),
      };
      
      series.forEach(serie => {
        dataPoint[serie] = Math.floor(Math.random() * 500) + 100;
      });
      
      chartData.unshift(dataPoint);
    }
    
    // Category breakdown
    categoryData = series.map(category => ({
      name: category,
      value: Math.floor(Math.random() * 1000) + 500,
    }));
    
    // Summary metrics
    summary = [
      { 
        label: reportType === 'spending' ? 'Total Expenses' : 'Total Income', 
        value: categoryData.reduce((sum, cat) => sum + cat.value, 0),
        change: Math.floor(Math.random() * 10) - 5,
      },
      { 
        label: 'Average per Day', 
        value: categoryData.reduce((sum, cat) => sum + cat.value, 0) / (timeRange === 'week' ? 7 : 30),
        change: Math.floor(Math.random() * 10) - 5,
      },
      { 
        label: 'Highest Category', 
        value: Math.max(...categoryData.map(cat => cat.value)),
        change: Math.floor(Math.random() * 10) - 5,
      },
      { 
        label: 'Lowest Category', 
        value: Math.min(...categoryData.map(cat => cat.value)),
        change: Math.floor(Math.random() * 10) - 5,
      },
    ];
  } else if (reportType === 'categories') {
    // For category breakdown, focus on pie chart data
    categoryData = [
      { name: 'Food', value: Math.floor(Math.random() * 500) + 300 },
      { name: 'Transportation', value: Math.floor(Math.random() * 300) + 100 },
      { name: 'Entertainment', value: Math.floor(Math.random() * 200) + 100 },
      { name: 'Shopping', value: Math.floor(Math.random() * 400) + 200 },
      { name: 'Utilities', value: Math.floor(Math.random() * 300) + 150 },
    ];
    
    // Create chart data for time comparison
    series = ['Amount'];
    const periods = 6;
    const now = new Date();
    
    for (let i = 0; i < periods; i++) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      
      chartData.unshift({
        name: format(date, 'MMM'),
        Amount: Math.floor(Math.random() * 2000) + 1000,
      });
    }
    
    // Summary metrics
    summary = [
      { 
        label: 'Highest Category', 
        value: Math.max(...categoryData.map(cat => cat.value)),
        change: Math.floor(Math.random() * 10) - 5,
      },
      { 
        label: 'Total Spending', 
        value: categoryData.reduce((sum, cat) => sum + cat.value, 0),
        change: Math.floor(Math.random() * 10) - 5,
      },
      { 
        label: 'Categories Count', 
        value: categoryData.length,
        change: 0,
      },
      { 
        label: 'Average per Category', 
        value: categoryData.reduce((sum, cat) => sum + cat.value, 0) / categoryData.length,
        change: Math.floor(Math.random() * 10) - 5,
      },
    ];
  } else if (reportType === 'balance') {
    // For balance trends, show income vs expenses over time
    series = ['Income', 'Expenses', 'Balance'];
    
    const periods = timeRange === 'week' ? 7 : timeRange === 'month' ? 6 : timeRange === 'quarter' ? 3 : 12;
    const isDaily = timeRange === 'week';
    
    const now = new Date();
    let runningBalance = 5000; // Start with a balance
    
    for (let i = 0; i < periods; i++) {
      const date = new Date(now);
      if (isDaily) {
        date.setDate(date.getDate() - i);
      } else if (timeRange === 'month') {
        date.setDate(date.getDate() - i * 5);
      } else if (timeRange === 'quarter') {
        date.setMonth(date.getMonth() - i);
      } else {
        date.setMonth(date.getMonth() - i);
      }
      
      const income = Math.floor(Math.random() * 1000) + 1500;
      const expenses = Math.floor(Math.random() * 800) + 800;
      runningBalance += (income - expenses);
      
      chartData.unshift({
        name: isDaily ? format(date, 'EEE') : format(date, 'MMM'),
        Income: income,
        Expenses: expenses,
        Balance: runningBalance,
      });
    }
    
    // Category data for pie chart (income sources)
    categoryData = [
      { name: 'Salary', value: Math.floor(Math.random() * 3000) + 2000 },
      { name: 'Freelance', value: Math.floor(Math.random() * 1000) + 500 },
      { name: 'Investments', value: Math.floor(Math.random() * 500) + 200 },
      { name: 'Other', value: Math.floor(Math.random() * 300) + 100 },
    ];
    
    // Summary metrics
    summary = [
      { 
        label: 'Current Balance', 
        value: chartData[chartData.length - 1].Balance,
        change: ((chartData[chartData.length - 1].Balance - chartData[0].Balance) / chartData[0].Balance) * 100,
      },
      { 
        label: 'Total Income', 
        value: chartData.reduce((sum, point) => sum + point.Income, 0),
        change: Math.floor(Math.random() * 10) - 5,
      },
      { 
        label: 'Total Expenses', 
        value: chartData.reduce((sum, point) => sum + point.Expenses, 0),
        change: Math.floor(Math.random() * 10) - 5,
      },
      { 
        label: 'Net Change', 
        value: chartData.reduce((sum, point) => sum + (point.Income - point.Expenses), 0),
        change: Math.floor(Math.random() * 20) - 10,
      },
    ];
  }
  
  return {
    chartData,
    categoryData,
    series,
    summary,
  };
};

// Mock API Calls
export const fetchTransactions = async (): Promise<Transaction[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateMockTransactions());
    }, 500);
  });
};

export const fetchCategories = async (): Promise<Category[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateMockCategories());
    }, 500);
  });
};

export const fetchDashboardData = async (): Promise<DashboardData> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const transactions = generateMockTransactions();
      resolve(generateMockDashboardData(transactions));
    }, 500);
  });
};

export const fetchReportData = async (reportType: string, timeRange: string): Promise<ReportData> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateMockReportData(reportType, timeRange));
    }, 500);
  });
};