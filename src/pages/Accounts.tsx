import { useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useFinanceCalculations } from '../services/financeHelper';
import { Wallet, Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export function Accounts() {
  const paymentMethods = useFinanceStore(state => state.paymentMethods);
  const addPaymentMethod = useFinanceStore(state => state.addPaymentMethod);
  const preferredCurrency = useFinanceStore(state => state.preferredCurrency);
  const transactions = useFinanceStore(state => state.transactions);
  
  // A helper from the store/service to calculate overall total balance 
  const { totalBalance } = useFinanceCalculations();

  const [isAdding, setIsAdding] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [cardLast4, setCardLast4] = useState('');
  const [accountType, setAccountType] = useState<'Debit' | 'Credit'>('Debit');

  const formatMoney = (amount: number) => {
     return new Intl.NumberFormat('en-US', { style: 'currency', currency: preferredCurrency }).format(amount);
  };

  // Calculate balance per account
  const calculateAccountBalance = (accountId: string, initialBal: number = 0) => {
     // For simplicity, we assume initialBalance is in base currency PEN or matches preferredCurrency
     // In a full implementation, you'd want to track currency per account.
     let balance = initialBal;
     const accountTransactions = transactions.filter(t => t.paymentMethod === accountId);
     
     accountTransactions.forEach(t => {
       // Convert transaction amount if needed, though here we just assume it's roughly 1:1 for demonstration 
       // unless convertCurrency is exposed. Let's use it roughly:
       const amt = t.amount; // In reality we'd convert it.
       if (t.type === 'Income') balance += amt;
       if (t.type === 'Expense') balance -= amt;
     });
     return balance;
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingAccountId(null);
    setName('');
    setInitialBalance('');
    setCardLast4('');
    setAccountType('Debit');
  };

  const handleEdit = (account: any) => {
    setEditingAccountId(account.id);
    setName(account.name);
    setInitialBalance(account.initialBalance.toString());
    setCardLast4(account.cardLast4 || '');
    setAccountType(account.accountType || 'Debit');
    setIsAdding(true);
  };

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    
    const accountData = {
      name,
      initialBalance: parseFloat(initialBalance || '0'),
      cardLast4: cardLast4.trim(),
      accountType
    };

    if (editingAccountId) {
      useFinanceStore.getState().updatePaymentMethod(editingAccountId, accountData);
    } else {
      addPaymentMethod({
        id: uuidv4(),
        ...accountData
      });
    }
    
    resetForm();
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
        <Button onClick={() => setIsAdding(!isAdding)} size="sm" className="gap-1 shadow-indigo-600/30">
           <Plus className="w-4 h-4"/> New Account
        </Button>
      </div>

      <Card className="bg-indigo-600 text-white border-indigo-700 shadow-indigo-600/20">
         <h2 className="text-indigo-200 font-medium text-sm mb-1">Net Worth</h2>
         <div className="text-4xl font-bold">{formatMoney(totalBalance)}</div>
      </Card>

      {isAdding && (
        <Card className="!p-5 border border-indigo-100 bg-indigo-50/30">
           <h3 className="font-semibold text-gray-900 mb-3">{editingAccountId ? 'Edit Account' : 'Add New Account'}</h3>
           <form onSubmit={handleAddAccount} className="space-y-3">
             <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Account Name</label>
                <input required value={name} onChange={e => setName(e.target.value)} type="text" placeholder="e.g. Scotiabank" className="w-full bg-white border border-gray-200 rounded-xl p-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm" />
             </div>
             
             <div className="grid grid-cols-2 gap-3">
               <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Card Last 4 (Optional)</label>
                  <input value={cardLast4} onChange={e => setCardLast4(e.target.value)} type="text" maxLength={4} placeholder="e.g. 1234" className="w-full bg-white border border-gray-200 rounded-xl p-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm" />
               </div>
               <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                  <select value={accountType} onChange={e => setAccountType(e.target.value as 'Debit' | 'Credit')} className="w-full bg-white border border-gray-200 rounded-xl p-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm">
                    <option value="Debit">Debit</option>
                    <option value="Credit">Credit</option>
                  </select>
               </div>
             </div>

             <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Initial Balance ({preferredCurrency})</label>
                <input value={initialBalance} onChange={e => setInitialBalance(e.target.value)} type="number" step="0.01" className="w-full bg-white border border-gray-200 rounded-xl p-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm" />
             </div>
             <div className="flex gap-2 pt-2">
                <Button type="submit" size="sm" className="flex-1">{editingAccountId ? 'Update' : 'Save'}</Button>
                <Button type="button" variant="secondary" size="sm" onClick={resetForm}>Cancel</Button>
             </div>
           </form>
        </Card>
      )}

      <div className="space-y-3">
        <h2 className="text-lg font-bold mt-8 mb-4">Your Accounts</h2>
        {paymentMethods.map(account => {
          const bal = calculateAccountBalance(account.id, account.initialBalance);
          return (
            <Card key={account.id} className="!p-5 flex items-center justify-between hover:shadow-lg transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{account.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full font-medium">
                      {account.accountType || 'Standard'}
                    </span>
                    {account.cardLast4 && (
                      <span className="text-xs text-gray-500 font-mono">
                        •••• {account.cardLast4}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="font-bold text-lg tracking-tight text-gray-900">
                  {formatMoney(bal)}
                </div>
                <div className="opacity-0 lg:opacity-0 focus-within:opacity-100 group-hover:opacity-100 transition-opacity flex">
                  <button onClick={(e) => { e.stopPropagation(); handleEdit(account); }} className="p-2 text-gray-400 hover:text-indigo-600 transition-colors" title="Edit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
