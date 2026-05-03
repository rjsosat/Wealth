import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinanceStore } from '../store/useFinanceStore';
import { TransactionForm } from '../components/ui/TransactionForm';
import { v4 as uuidv4 } from 'uuid';
import { ArrowLeft } from 'lucide-react';

export function AddTransaction() {
  const navigate = useNavigate();
  const addTransaction = useFinanceStore(state => state.addTransaction);

  const handleSubmit = async (data: any) => {
    await addTransaction({
      ...data,
      id: uuidv4()
    });
    navigate('/transactions');
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/50 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-3xl font-bold tracking-tight">New Transaction</h1>
      </div>

      <TransactionForm onSubmit={handleSubmit} submitLabel="Save Transaction" />
    </div>
  );
}
