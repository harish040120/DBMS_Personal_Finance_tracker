import React, { useState, useEffect } from 'react';
import { PiggyBank, ArrowUpRight, ArrowDownRight, CircleDollarSign, Wallet } from 'lucide-react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { fetchDashboardData, DashboardData } from '../services/api';
import TransactionItem from '../components/transactions/TransactionItem';

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <PiggyBank size={48} className="mx-auto text-blue-500 mb-4" />
        <h2 className="text-2xl font-extrabold text-gray-700 mb-2">Welcome to your Finance Tracker</h2>
        <p className="text-gray-500 mb-6 font-medium">Start by adding your first transaction</p>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition font-semibold">
          Add Transaction
        </button>
      </div>
    );
  }

  const { 
    balance, 
    income, 
    expenses, 
    recentTransactions, 
    monthlyData,
    categoryData
  } = dashboardData;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28EFF'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-800">Dashboard</h1>
        <div className="text-sm text-gray-500 font-medium">
          {format(new Date(), 'MMMM d, yyyy')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-gray-500">Current Balance</p>
              <h3 className="text-2xl font-extrabold text-gray-900 mt-1">₹{balance.toLocaleString('en-IN')}</h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Wallet className="text-blue-600" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-gray-500">Total Income</p>
              <h3 className="text-2xl font-extrabold text-green-600 mt-1">₹{income.toLocaleString('en-IN')}</h3>
              <p className="flex items-center text-sm text-green-600 mt-2 font-medium">
                <ArrowUpRight size={16} className="mr-1" />
                <span>3.2% from last month</span>
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <ArrowUpRight className="text-green-600" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-gray-500">Total Expenses</p>
              <h3 className="text-2xl font-extrabold text-red-600 mt-1">₹{expenses.toLocaleString('en-IN')}</h3>
              <p className="flex items-center text-sm text-red-600 mt-2 font-medium">
                <ArrowDownRight size={16} className="mr-1" />
                <span>2.5% from last month</span>
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <ArrowDownRight className="text-red-600" size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Monthly Overview</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`} 
                />
                <Tooltip 
                  formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Amount']}
                  contentStyle={{ borderRadius: '8px', borderColor: '#e2e8f0' }}
                />
                <Bar dataKey="income" fill="#0A84FF" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#FF3B30" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Spending by Category</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">Recent Transactions</h3>
          <a href="/transactions" className="text-blue-600 text-sm font-semibold hover:text-blue-700">
            View All
          </a>
        </div>
        <div className="divide-y divide-gray-100">
          {recentTransactions.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;