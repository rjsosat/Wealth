import { useNavigate, useParams } from 'react-router-dom';
import { useFinanceStore } from '../store/useFinanceStore';
import { TransactionForm } from '../components/ui/TransactionForm';
import { ArrowLeft } from 'lucide-react';

export function EditTransaction() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const transactions = useFinanceStore(state => state.transactions);
  const updateTransaction = useFinanceStore(state => state.updateTransaction);

  const transaction = transactions.find(t => t.id === id);

  if (!transaction) {
    return (
      <div className="text-center py-20 animate-in fade-in">
        <p className="text-gray-500">Transaction not found.</p>
        <button onClick={() => navigate('/transactions')} className="text-indigo-600 mt-4 underline">Go Back</button>
      </div>
    );
  }

  const handleSubmit = async (data: any) => {
    await updateTransaction(id!, data);
    navigate('/transactions');
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/50 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-3xl font-bold tracking-tight">Edit Transaction</h1>
      </div>

      <TransactionForm 
        initialData={transaction} 
        onSubmit={handleSubmit} 
        submitLabel="Save Changes" 
      />
    </div>
  );
}
