import React from 'react';
import { format } from 'date-fns';
import { ArrowUpRight, ArrowDownRight, ShoppingCart, Home, Car, Gift, Briefcase, CreditCard } from 'lucide-react';
import { Transaction } from '../../services/api';

interface TransactionItemProps {
  transaction: Transaction;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const getIcon = () => {
    switch (transaction.category) {
      case 'Shopping':
        return <ShoppingCart size={16} />;
      case 'Housing':
        return <Home size={16} />;
      case 'Transportation':
        return <Car size={16} />;
      case 'Entertainment':
        return <Gift size={16} />;
      case 'Income':
        return <Briefcase size={16} />;
      default:
        return <CreditCard size={16} />;
    }
  };

  const formattedDate = format(new Date(transaction.date), 'MMM d, yyyy');
  const isIncome = transaction.amount > 0;
  
  return (
    <div className="px-6 py-4 flex items-center hover:bg-gray-50 transition-colors">
      <div className={`p-2 rounded-full mr-4 ${isIncome ? 'bg-green-100' : 'bg-red-100'}`}>
        {isIncome 
          ? <ArrowUpRight className="text-green-600" size={18} /> 
          : <ArrowDownRight className="text-red-600" size={18} />
        }
      </div>
      
      <div className="flex-1">
        <p className="font-semibold text-gray-800 mb-1">{transaction.description}</p>
        <div className="flex items-center text-xs text-gray-500">
          <span className="flex items-center mr-3">
            {getIcon()}
            <span className="ml-1">{transaction.category}</span>
          </span>
          <span>{formattedDate}</span>
        </div>
      </div>
      
      <div className={`font-bold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
        {isIncome ? '+' : '-'}₹{Math.abs(transaction.amount).toLocaleString('en-IN')}
      </div>
    </div>
  );
};

export default TransactionItem;