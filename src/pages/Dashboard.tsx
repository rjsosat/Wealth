
import { Card } from '../components/ui/Card';
import { useFinanceCalculations } from '../services/financeHelper';
import { useFinanceStore } from '../store/useFinanceStore';
import { TrendingUp, TrendingDown, WalletCards } from 'lucide-react';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const navigate = useNavigate();
  const { totalBalance, currentMonthExpenses, currentMonthIncome, currentMonthCategoryBreakdown, checkBudgetProgress } = useFinanceCalculations();
  const budgets = useFinanceStore(state => state.budgets);
  const categories = useFinanceStore(state => state.categories);
  const preferredCurrency = useFinanceStore(state => state.preferredCurrency);
  
  const formatMoney = (amount: number) => {
     return new Intl.NumberFormat('en-US', { style: 'currency', currency: preferredCurrency }).format(amount);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <header className="mb-8">
        <h1 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Total Balance</h1>
        <div className="text-5xl font-bold tracking-tight text-gray-900">{formatMoney(totalBalance)}</div>
      </header>
      
      <div className="grid grid-cols-2 gap-4">
        <Card className="!p-4 md:!p-6 bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-100">
          <div className="text-emerald-600 mb-2 border border-emerald-200 bg-emerald-100 w-10 h-10 rounded-full flex items-center justify-center">
             <TrendingUp className="w-5 h-5" />
          </div>
          <h2 className="text-xs text-gray-500 font-medium uppercase">Income</h2>
          <div className="text-2xl font-bold text-gray-900">{formatMoney(currentMonthIncome)}</div>
        </Card>
        
        <Card className="!p-4 md:!p-6 bg-gradient-to-br from-rose-50 to-rose-100/50 border-rose-100">
          <div className="text-rose-600 mb-2 border border-rose-200 bg-rose-100 w-10 h-10 rounded-full flex items-center justify-center">
             <TrendingDown className="w-5 h-5" />
          </div>
          <h2 className="text-xs text-gray-500 font-medium uppercase">Expenses</h2>
          <div className="text-2xl font-bold text-gray-900">{formatMoney(currentMonthExpenses)}</div>
        </Card>
      </div>

      <section className="pt-4">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><WalletCards className="w-5 h-5 text-indigo-500"/> Active Budgets</h2>
        <div className="space-y-4">
          {budgets.length === 0 ? (
            <p className="text-gray-500 text-sm">No active budgets. Create one in Settings.</p>
          ) : (
            budgets.map(budget => {
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
      
      <section className="pt-4">
        <h2 className="text-xl font-bold mb-4">Top Spending</h2>
        <div className="space-y-3">
          {currentMonthCategoryBreakdown.slice(0, 5).map((item: any) => (
            <div key={item.name} onClick={() => navigate(`/transactions?category=${item.id}`)} className="flex justify-between items-center bg-white p-3 rounded-2xl border border-gray-100 shadow-sm cursor-pointer hover:shadow-md hover:border-indigo-100 transition-all">
              <div className="flex items-center gap-3">
                 <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                 <span className="font-medium text-gray-700">{item.name}</span>
              </div>
              <span className="font-bold">{formatMoney(item.amount)}</span>
            </div>
          ))}
          {currentMonthCategoryBreakdown.length === 0 && (
             <p className="text-gray-500 text-sm">No expenses this month.</p>
          )}
        </div>
      </section>
    </div>
  );
}
