import React, { useState, useEffect } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Card } from './Card';
import { Button } from './Button';
import type { TransactionType, Currency, Transaction } from '../../types';

interface TransactionFormProps {
  initialData?: Partial<Transaction>;
  onSubmit: (data: Omit<Transaction, 'id'>) => Promise<void> | void;
  submitLabel?: string;
  onSaveRule?: (rule: { matchPattern: string; mappedTitle: string; mappedCategoryId: string }) => void;
}

export function TransactionForm({ initialData, onSubmit, submitLabel = 'Save Transaction', onSaveRule }: TransactionFormProps) {
  const categories = useFinanceStore(state => state.categories);
  const paymentMethods = useFinanceStore(state => state.paymentMethods);
  const addCategory = useFinanceStore(state => state.addCategory);

  const [type, setType] = useState<TransactionType>(initialData?.type || 'Expense');
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [currency, setCurrency] = useState<Currency>(initialData?.currency || 'PEN');
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || categories[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState(initialData?.paymentMethod || paymentMethods[0]?.id || '');
  const [saveAsRule, setSaveAsRule] = useState(false);
  
  // Convert ISO timestamp to YYYY-MM-DD for the input type="date"
  const [date, setDate] = useState(
    initialData?.date ? initialData.date.split('T')[0] : new Date().toISOString().split('T')[0]
  );

  // Filter categories by selected type (Income/Expense/Both)
  const availableCategories = categories.filter(c => c.type === type || c.type === 'Both');

  // Update category if the selected one doesn't match the new type
  useEffect(() => {
    if (!availableCategories.find(c => c.id === categoryId) && availableCategories.length > 0) {
      setCategoryId(availableCategories[0].id);
    }
  }, [type, availableCategories, categoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !title || !categoryId) return;

    if (saveAsRule && onSaveRule && initialData?.title) {
      onSaveRule({
        matchPattern: initialData.title, // Map the original raw title (which Gemini usually pulls as merchant)
        mappedTitle: title, // Map to their nice typed title
        mappedCategoryId: categoryId
      });
    }

    await onSubmit({
      amount: parseFloat(amount),
      currency,
      title,
      description,
      categoryId,
      paymentMethod,
      date: new Date(date).toISOString(),
      type,
      confirmation: 'Confirmed'
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2 p-1 bg-gray-200/50 backdrop-blur-sm rounded-xl">
        <button
          type="button"
          onClick={() => setType('Expense')}
          className={`flex-1 py-2 rounded-lg font-medium transition-all ${type === 'Expense' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
        >
          Expense
        </button>
        <button
          type="button"
          onClick={() => setType('Income')}
          className={`flex-1 py-2 rounded-lg font-medium transition-all ${type === 'Income' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
        >
          Income
        </button>
      </div>

      <Card className="!p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input required value={title} onChange={e => setTitle(e.target.value)} type="text" placeholder="e.g. Groceries" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <input value={description} onChange={e => setDescription(e.target.value)} type="text" placeholder="Additional details..." className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input required value={amount} onChange={e => setAmount(e.target.value)} type="number" step="0.01" min="0" placeholder="0.00" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
            </div>
            <div className="w-24">
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select value={currency} onChange={e => setCurrency(e.target.value as Currency)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium">
                <option value="PEN">PEN</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select required value={categoryId} onChange={e => {
                  if (e.target.value === 'ADD_NEW_CATEGORY') {
                    const newName = window.prompt('Enter new category name:');
                    if (newName && newName.trim()) {
                      const newCat = {
                        id: crypto.randomUUID(),
                        name: newName.trim(),
                        type,
                        icon: 'grid-outline',
                        color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')
                      };
                      addCategory(newCat);
                      setCategoryId(newCat.id);
                    }
                  } else {
                    setCategoryId(e.target.value);
                  }
                }} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium">
                  {availableCategories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                  {availableCategories.length === 0 && <option value="" disabled>No categories</option>}
                  <option value="ADD_NEW_CATEGORY" className="font-bold text-indigo-600">+ Add New Category...</option>
                </select>
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium">
                  {paymentMethods.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                  <option value="">None</option>
                </select>
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input required value={date} onChange={e => setDate(e.target.value)} type="date" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
          </div>
      </Card>

      {onSaveRule && (
        <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
          <input 
            type="checkbox" 
            id="saveRule"
            checked={saveAsRule}
            onChange={(e) => setSaveAsRule(e.target.checked)}
            className="w-5 h-5 text-indigo-600 rounded border-indigo-300 focus:ring-indigo-500"
          />
          <label htmlFor="saveRule" className="text-sm text-indigo-900 font-medium">
            Save as auto-categorization rule for "{initialData?.title}"
          </label>
        </div>
      )}

      <Button type="submit" className="w-full shadow-indigo-600/30" size="lg">{submitLabel}</Button>
    </form>
  );
}
