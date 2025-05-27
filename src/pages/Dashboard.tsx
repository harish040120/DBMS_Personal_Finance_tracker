// src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { fetchDashboardData } from '../services/api';
import TransactionItem from '../components/transactions/TransactionItem';

interface CategoryData {
  name: string;
  value: number;
}

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
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

  if (!dashboardData) return <div>Failed to load dashboard data</div>;

  const COLORS = ['#0A84FF', '#30D158', '#FF9F0A', '#FF453A', '#BF5AF2'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-gray-500">Current Balance</p>
              <h3 className="text-2xl font-bold mt-1">₹{dashboardData.balance.toLocaleString('en-IN')}</h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Wallet className="text-blue-600" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-gray-500">Total Income</p>
              <h3 className="text-2xl font-bold text-green-600 mt-1">
                ₹{dashboardData.income.toLocaleString('en-IN')}
              </h3>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <ArrowUpRight className="text-green-600" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-gray-500">Total Expenses</p>
              <h3 className="text-2xl font-bold text-red-600 mt-1">
                ₹{dashboardData.expenses.toLocaleString('en-IN')}
              </h3>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <ArrowDownRight className="text-red-600" size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-lg font-bold mb-4">Monthly Overview</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={value => `₹${value}`} />
                <Tooltip formatter={value => `₹${value}`} />
                <Bar dataKey="income" fill="#0A84FF" />
                <Bar dataKey="expense" fill="#FF453A" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-lg font-bold mb-4">Spending by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboardData.categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                    {dashboardData.categoryData.map((entry: CategoryData, index: number) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip formatter={value => `₹${value}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold">Recent Transactions</h3>
        </div>
        <div className="divide-y">
          {dashboardData.recentTransactions.map((transaction: any) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;