import React, { useEffect, useState } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { TransactionForm } from './TransactionForm';
import { X } from 'lucide-react';
import type { Transaction } from '../../types';

export function PendingReviewModal() {
  const transactions = useFinanceStore(state => state.transactions);
  const updateTransaction = useFinanceStore(state => state.updateTransaction);
  const removeTransaction = useFinanceStore(state => state.removeTransaction);
  const saveCategorizationRule = useFinanceStore(state => state.saveCategorizationRule);

  const pendingTransactions = transactions.filter(t => t.confirmation === 'Pending');
  const [currentPending, setCurrentPending] = useState<Transaction | null>(null);

  // Set the current pending transaction to the oldest one
  useEffect(() => {
    if (pendingTransactions.length > 0) {
      // Sort to get the oldest pending transaction first
      const oldest = [...pendingTransactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
      setCurrentPending(oldest);
    } else {
      setCurrentPending(null);
    }
  }, [transactions]); // Re-run when transactions change

  if (!currentPending || pendingTransactions.length === 0) return null;

  const handleConfirm = async (data: any) => {
    await updateTransaction(currentPending.id, {
      ...data,
      confirmation: 'Confirmed'
    });
  };

  const handleReject = async () => {
    if (confirm('Are you sure you want to delete this pending transaction?')) {
      await removeTransaction(currentPending.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white/95 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Review Pending Entry</h2>
            <p className="text-sm text-indigo-600 font-medium">
              {pendingTransactions.length} transaction{pendingTransactions.length !== 1 ? 's' : ''} awaiting review
            </p>
          </div>
          <button onClick={handleReject} className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-full transition-colors" title="Discard">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {/* Important context notice */}
          {currentPending.description && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm">
              <span className="font-semibold block mb-1">Raw Details from Bank:</span>
              {currentPending.description}
            </div>
          )}

          <TransactionForm 
            key={currentPending.id}
            initialData={currentPending} 
            onSubmit={handleConfirm} 
            submitLabel="Confirm & Save"
            onSaveRule={saveCategorizationRule}
          />
        </div>
      </div>
    </div>
  );
}
