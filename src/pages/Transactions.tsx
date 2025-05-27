// src/pages/Transactions.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Search, ChevronDown } from 'lucide-react';
import { 
  fetchTransactions, createTransaction, updateTransaction, deleteTransaction,
  fetchCategories, fetchAccounts, Transaction, Category, Account
} from '../services/api';
import TransactionTable from '../components/transactions/TransactionTable';
import TransactionModal from '../components/transactions/TransactionModal';

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [transactionsData, categoriesData, accountsData] = await Promise.all([
          fetchTransactions(),
          fetchCategories(),
          fetchAccounts()
        ]);
        setTransactions(transactionsData);
        setCategories(categoriesData);
        setAccounts(accountsData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSaveTransaction = async (transaction: Transaction) => {
    try {
      if (transaction.id) {
        await updateTransaction(transaction.id, transaction);
        setTransactions(transactions.map(t => t.id === transaction.id ? transaction : t));
      } else {
        const newTransaction = await createTransaction(transaction);
        setTransactions([newTransaction, ...transactions]);
      }
      setShowModal(false);
    } catch (error) {
      console.error('Failed to save transaction:', error);
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    try {
      await deleteTransaction(id);
      setTransactions(transactions.filter(t => t.id !== id));
    } catch (error) {
      console.error('Failed to delete transaction:', error);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = searchTerm === '' || 
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === '' || transaction.category === filterCategory;
    const matchesType = filterType === '' || transaction.transactionType === filterType;
    return matchesSearch && matchesCategory && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus size={16} className="mr-1" /> Add Transaction
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border rounded-md bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>{category.name}</option>
              ))}
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border rounded-md bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <TransactionTable 
          transactions={filteredTransactions}
          onEdit={setCurrentTransaction}
          onDelete={handleDeleteTransaction}
        />
      )}

      {showModal && (
        <TransactionModal
          transaction={currentTransaction}
          categories={categories}
          accounts={accounts}
          onClose={() => {
            setShowModal(false);
            setCurrentTransaction(null);
          }}
          onSave={handleSaveTransaction}
        />
      )}
    </div>
  );
};

export default Transactions;