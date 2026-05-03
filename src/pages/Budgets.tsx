import React, { useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useFinanceCalculations } from '../services/financeHelper';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { TransactionType } from '../types';

export function Budgets() {
  const budgets = useFinanceStore(state => state.budgets);
  const categories = useFinanceStore(state => state.categories);
  const addCategory = useFinanceStore(state => state.addCategory);
  const removeCategory = useFinanceStore(state => state.removeCategory);
  const addBudget = useFinanceStore(state => state.addBudget);
  const preferredCurrency = useFinanceStore(state => state.preferredCurrency);
  const { checkBudgetProgress } = useFinanceCalculations();

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#3B82F6');
  const [newCatType, setNewCatType] = useState<TransactionType | 'Both'>('Expense');

  const [isAddingBudget, setIsAddingBudget] = useState(false);
  const [budgetCatId, setBudgetCatId] = useState(categories[0]?.id || '');
  const [budgetLimit, setBudgetLimit] = useState('');

  const formatMoney = (amount: number) => {
     return new Intl.NumberFormat('en-US', { style: 'currency', currency: preferredCurrency }).format(amount);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    addCategory({
      id: uuidv4(),
      name: newCatName,
      type: newCatType,
      color: newCatColor
    });
    setIsAddingCategory(false);
    setNewCatName('');
  };

  const handleAddBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetLimit || !budgetCatId) return;
    addBudget({
      id: uuidv4(),
      categoryId: budgetCatId,
      limitAmount: parseFloat(budgetLimit),
      currency: preferredCurrency,
      period: 'monthly'
    });
    setIsAddingBudget(false);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Budgets & Tags</h1>
      </div>

      {/* Budgets Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Monthly Budgets</h2>
          <Button onClick={() => setIsAddingBudget(!isAddingBudget)} size="sm" variant="secondary" className="gap-1">
             <Plus className="w-4 h-4"/> Budget
          </Button>
        </div>

        {isAddingBudget && (
          <Card className="!p-5 mb-4 border border-indigo-100 bg-indigo-50/30">
             <form onSubmit={handleAddBudget} className="space-y-3">
               <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                  <select required value={budgetCatId} onChange={e => setBudgetCatId(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl p-2.5 outline-none focus:border-indigo-500 font-medium text-sm">
                    {categories.filter(c => c.type !== 'Income').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
               </div>
               <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Monthly Limit ({preferredCurrency})</label>
                  <input required value={budgetLimit} onChange={e => setBudgetLimit(e.target.value)} type="number" step="0.01" className="w-full bg-white border border-gray-200 rounded-xl p-2.5 outline-none focus:border-indigo-500 text-sm" />
               </div>
               <div className="flex gap-2 pt-2">
                  <Button type="submit" size="sm" className="flex-1">Save</Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddingBudget(false)}>Cancel</Button>
               </div>
             </form>
          </Card>
        )}

        <div className="space-y-4">
          {budgets.length === 0 ? (
            <div className="text-center py-8 bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-gray-200 text-gray-500">No active budgets.</div>
          ) : (
            [...budgets].sort((a, b) => b.limitAmount - a.limitAmount).map(budget => {
              const prog = checkBudgetProgress(budget.categoryId);
              const cat = categories.find(c => c.id === budget.categoryId);
              const isOver = (prog.percentage || 0) > 100;
              return (
                <Card key={budget.id} className="!p-5 border-l-4" style={{ borderLeftColor: cat?.color || '#cbd5e1' }}>
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-800">{cat?.name || 'Unknown'}</h3>
                      <p className="text-xs text-gray-500">{formatMoney(prog.spent)} / {formatMoney(prog.limit || 0)}</p>
                    </div>
                    <div className={`font-bold text-sm ${isOver ? 'text-red-500' : 'text-gray-700'}`}>
                      {Math.round(prog.percentage || 0)}%
                    </div>
                  </div>
                  <ProgressBar progress={prog.percentage || 0} color={isOver ? 'bg-red-500' : 'bg-indigo-500'} />
                </Card>
              );
            })
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Categories</h2>
          <Button onClick={() => setIsAddingCategory(!isAddingCategory)} size="sm" variant="secondary" className="gap-1">
             <Plus className="w-4 h-4"/> Category
          </Button>
        </div>

        {isAddingCategory && (
           <Card className="!p-5 mb-4 border border-indigo-100 bg-indigo-50/30">
             <form onSubmit={handleAddCategory} className="space-y-3">
               <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Category Name</label>
                  <input required value={newCatName} onChange={e => setNewCatName(e.target.value)} type="text" className="w-full bg-white border border-gray-200 rounded-xl p-2.5 outline-none focus:border-indigo-500 text-sm" />
               </div>
               <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                    <select required value={newCatType} onChange={e => setNewCatType(e.target.value as any)} className="w-full bg-white border border-gray-200 rounded-xl p-2.5 outline-none font-medium text-sm">
                      <option value="Expense">Expense</option>
                      <option value="Income">Income</option>
                      <option value="Both">Both</option>
                    </select>
                  </div>
                  <div className="w-20">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
                    <input type="color" value={newCatColor} onChange={e => setNewCatColor(e.target.value)} className="w-full h-11 p-0.5 bg-white border border-gray-200 rounded-xl cursor-pointer" />
                  </div>
               </div>
               <div className="flex gap-2 pt-2">
                  <Button type="submit" size="sm" className="flex-1">Save</Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddingCategory(false)}>Cancel</Button>
               </div>
             </form>
          </Card>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
           {categories.map(cat => (
             <div key={cat.id} className="flex items-center justify-between p-3 bg-white rounded-2xl border border-gray-100 shadow-sm group">
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                   <span className="font-medium text-sm text-gray-800">{cat.name}</span>
                </div>
                <button onClick={() => removeCategory(cat.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-red-500">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
             </div>
           ))}
        </div>
      </section>
    </div>
  );
}
