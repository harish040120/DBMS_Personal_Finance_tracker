import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Transaction, Category, Account } from '../../services/api';

interface TransactionModalProps {
  transaction: Transaction | null;
  categories: Category[];
  accounts: Account[];
  onClose: () => void;
  onSave: (transaction: Transaction) => void;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ transaction, categories, accounts, onClose, onSave }) => {
  const [form, setForm] = useState<Omit<Transaction, 'id'>>({
    description: '',
    amount: 0,
    category: 'Other',
    accountId: 1, // Default to first account
    date: new Date().toISOString().split('T')[0],
    transactionType: 'expense'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (transaction) {
      setForm({
        description: transaction.description,
        amount: Math.abs(transaction.amount),
        category: transaction.category,
        accountId: transaction.accountId, // Use accountId
        date: transaction.date.split('T')[0],
        transactionType: transaction.transactionType
      });
    }
  }, [transaction]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.description.trim()) newErrors.description = 'Description is required';
    if (form.amount <= 0) newErrors.amount = 'Amount must be greater than 0';
    if (!form.date) newErrors.date = 'Date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const amount = form.transactionType === 'income' ? form.amount : -form.amount;

    onSave({
      ...(transaction || { id: 0 }),
      ...form,
      amount,
      date: new Date(form.date).toISOString()
    });
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-lg font-medium">{transaction ? 'Edit Transaction' : 'Add Transaction'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Transaction Type Buttons */}
          <div>
            <label className="block text-sm font-medium mb-1">Transaction Type</label>
            <div className="flex rounded-md shadow-sm">
              <button
                type="button"
                className={`flex-1 py-2 px-4 text-sm rounded-l-md ${
                  form.transactionType === 'expense'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setForm({ ...form, transactionType: 'expense' })}
              >
                Expense
              </button>
              <button
                type="button"
                className={`flex-1 py-2 px-4 text-sm rounded-r-md ${
                  form.transactionType === 'income'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setForm({ ...form, transactionType: 'income' })}
              >
                Income
              </button>
            </div>
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={`block w-full px-3 py-2 border rounded-md ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* Amount Field */}
          <div>
            <label className="block text-sm font-medium mb-1">Amount (₹)</label>
            <input
              type="number"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
              className={`block w-full px-3 py-2 border rounded-md ${
                errors.amount ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
          </div>

          {/* Category Select */}
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              {categories.map(category => (
                <option key={category.id} value={category.name}>{category.name}</option>
              ))}
            </select>
          </div>

          {/* Account Select */}
          <div>
          <label className="block text-sm font-medium mb-1">Account</label>
          <select
            value={accounts.find((acc) => acc.id === form.accountId)?.name || ''}
            onChange={(e) => {
              const selectedName = e.target.value;
              const selectedAccount = accounts.find((acc) => acc.name === selectedName);
              setForm({
                ...form,
                accountId: selectedAccount ? selectedAccount.id : 1,
              });
            }}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            {accounts.map((account) => (
              <option key={account.id} value={account.name}>
                {account.name}
              </option>
            ))}
          </select>
        </div>

          {/* Date Field */}
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className={`block w-full px-3 py-2 border rounded-md ${
                errors.date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
          </div>

          {/* Submit Button */}
          <div className="pt-4 flex justify-end gap-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {transaction ? 'Update' : 'Add'} Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;