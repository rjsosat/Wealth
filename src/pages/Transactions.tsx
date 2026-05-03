import { useFinanceStore } from '../store/useFinanceStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Plus, ArrowDownRight, ArrowUpRight, Trash2, FilterX } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function Transactions() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');
  
  const allTransactions = useFinanceStore(state => state.transactions);
  const categories = useFinanceStore(state => state.categories);
  const removeTransaction = useFinanceStore(state => state.removeTransaction);

  const transactions = categoryFilter 
    ? allTransactions.filter(t => t.categoryId === categoryFilter)
    : allTransactions;

  const activeCategory = categoryFilter ? categories.find(c => c.id === categoryFilter) : null;

  const formatMoney = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  };

  // Group transactions by day
  const groupedTransactions = transactions.reduce((acc, t) => {
    // Extract exact date to avoid UTC browser timezone shift lag
    const [year, month, day] = t.date.split('T')[0].split('-');
    const localDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const dayStr = format(localDate, 'MMMM d, yyyy');
    
    if (!acc[dayStr]) acc[dayStr] = [];
    acc[dayStr].push(t);
    return acc;
  }, {} as Record<string, typeof transactions>);

  return (
    <div className="space-y-6 pb-20 md:pb-0 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        
        <div className="flex items-center gap-3">
          <select 
            value={categoryFilter || ''} 
            onChange={(e) => {
              if (e.target.value) {
                setSearchParams({ category: e.target.value });
              } else {
                setSearchParams({});
              }
            }}
            className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-sm font-medium text-gray-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 hidden sm:block"
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <Button onClick={() => navigate('/add')} size="sm" className="gap-1 shadow-indigo-600/30">
            <Plus className="w-4 h-4"/> New
          </Button>
        </div>
      </div>
      
      {/* Mobile filter dropdown (visible only on small screens) */}
      <div className="sm:hidden mb-6">
        <select 
          value={categoryFilter || ''} 
          onChange={(e) => {
            if (e.target.value) {
              setSearchParams({ category: e.target.value });
            } else {
              setSearchParams({});
            }
          }}
          className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-8">
        {Object.keys(groupedTransactions).length === 0 ? (
          <div className="text-center py-16 bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-500 text-lg">No transactions found.</p>
          </div>
        ) : (
          Object.keys(groupedTransactions).map(day => (
            <div key={day}>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2">{day}</h2>
              <div className="space-y-3">
                {groupedTransactions[day].map(t => {
                  const cat = categories.find(c => c.id === t.categoryId);
                  const isIncome = t.type === 'Income';
                  return (
                    <Card key={t.id} className={`!p-4 flex items-center justify-between hover:shadow-lg transition-all group ${t.confirmation === 'Pending' ? 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.2)]' : ''}`}>
                      <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => navigate(`/edit/${t.id}`)}>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isIncome ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100' : 'bg-rose-50 text-rose-600 group-hover:bg-rose-100'}`}>
                          {isIncome ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 text-lg">{t.title}</h3>
                            {t.confirmation === 'Pending' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wide">Pending</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <span 
                              onClick={(e) => { e.stopPropagation(); navigate(`?category=${cat?.id}`); }}
                              className="px-2 py-0.5 rounded-full font-medium cursor-pointer hover:opacity-80 transition-opacity" 
                              style={{ backgroundColor: `${cat?.color || '#cbd5e1'}20`, color: cat?.color }}
                            >
                              {cat?.name || 'Uncategorized'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className={`font-bold text-lg tracking-tight ${isIncome ? 'text-emerald-600' : 'text-gray-900'}`}>
                          {isIncome ? '+' : ''}{formatMoney(t.amount, t.currency)}
                        </div>
                        <div className="opacity-0 lg:opacity-0 focus-within:opacity-100 group-hover:opacity-100 transition-opacity flex">
                          <button onClick={(e) => { e.stopPropagation(); navigate(`/edit/${t.id}`); }} className="p-2 text-gray-400 hover:text-indigo-600 transition-colors" title="Edit">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); removeTransaction(t.id); }} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
