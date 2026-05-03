import { format, isSameMonth, parseISO } from 'date-fns';
import { useMemo } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { Currency } from '../types';

// Hardcoded for now, could be dynamic in a real app or fetched from an API
const CONVERSION_RATES: Record<string, number> = {
    'USD_TO_PEN': 3.75,
    'PEN_TO_USD': 1 / 3.75,
};

export const convertCurrency = (amount: number, from: Currency, to: Currency) => {
    if (from === to) return amount;
    const rate = CONVERSION_RATES[`${from}_TO_${to}`];
    return amount * (rate || 1);
};

export const useFinanceCalculations = () => {
    const transactions = useFinanceStore((state) => state.transactions);
    const budgets = useFinanceStore((state) => state.budgets);
    const preferredCurrency = useFinanceStore((state) => state.preferredCurrency);
    const paymentMethods = useFinanceStore((state) => state.paymentMethods);

    // 1. Current Month Expenses and Income Summary
    const currentMonthExpenses = useMemo(() => {
        const now = new Date();
        return transactions
            .filter((t) => t.type === 'Expense' && isSameMonth(parseISO(t.date), now))
            .reduce((total, t) => {
                const amountInPreferred = convertCurrency(t.amount, t.currency, preferredCurrency);
                return total + amountInPreferred;
            }, 0);
    }, [transactions, preferredCurrency]);

    const currentMonthIncome = useMemo(() => {
        const now = new Date();
        return transactions
            .filter((t) => t.type === 'Income' && isSameMonth(parseISO(t.date), now))
            .reduce((total, t) => {
                const amountInPreferred = convertCurrency(t.amount, t.currency, preferredCurrency);
                return total + amountInPreferred;
            }, 0);
    }, [transactions, preferredCurrency]);

    // 2. Total Balance across all accounts
    const totalBalance = useMemo(() => {
        let balance = 0;

        // Sum initial balances (assuming they are in base currency PEN)
        paymentMethods.forEach(pm => {
            balance += convertCurrency(pm.initialBalance || 0, 'PEN', preferredCurrency);
        });

        // Add/subtract all-time transactions
        transactions.forEach(t => {
            const amountInPreferred = convertCurrency(t.amount, t.currency, preferredCurrency);
            if (t.type === 'Income') balance += amountInPreferred;
            else if (t.type === 'Expense') balance -= amountInPreferred;
        });

        return balance;
    }, [transactions, paymentMethods, preferredCurrency]);

    // 3. Budget Progress
    const checkBudgetProgress = (categoryId: string) => {
        const budget = budgets.find((b) => b.categoryId === categoryId);
        const now = new Date();
        const spentThisMonth = transactions
            .filter(
                (t) =>
                    t.type === 'Expense' &&
                    t.categoryId === categoryId &&
                    isSameMonth(parseISO(t.date), now)
            )
            .reduce((total, t) => {
                const targetCurrency = 'PEN';
                const amountTarget = convertCurrency(t.amount, t.currency, targetCurrency as Currency);
                return total + amountTarget;
            }, 0);

        if (!budget) {
            return {
                limit: null,
                spent: spentThisMonth,
                remaining: null,
                currency: 'PEN',
                percentage: null,
            };
        }

        const limitAmount = convertCurrency(budget.limitAmount, budget.currency, 'PEN');

        return {
            limit: limitAmount,
            spent: spentThisMonth,
            remaining: limitAmount - spentThisMonth,
            currency: 'PEN',
            percentage: Math.min((spentThisMonth / limitAmount) * 100, 100),
        };
    };

    // 4. 7-Day Spending Bar Chart Data
    const last7DaysSpending = useMemo(() => {
        const data = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayStr = date.toLocaleDateString('en-US', { weekday: 'short' });

            const spentOnDate = transactions
                .filter((t) => {
                    const localDateStr = format(new Date(t.date), 'yyyy-MM-dd');
                    return t.type === 'Expense' && localDateStr === dateStr;
                })
                .reduce((total, t) => {
                    return total + convertCurrency(t.amount, t.currency, preferredCurrency);
                }, 0);

            data.push({
                label: dayStr,
                value: spentOnDate,
                date: dateStr,
            });
        }
        return data;
    }, [transactions, preferredCurrency]);

    // 5. Monthly Expenses by Category Donut Chart
    const currentMonthCategoryBreakdown = useMemo(() => {
        const now = new Date();
        const categoryMap = new Map<string, { amount: number, color: string, name: string }>();

        // Get total first for percentages
        const thisMonthExpenses = transactions.filter((t) => t.type === 'Expense' && isSameMonth(parseISO(t.date), now));

        const total = thisMonthExpenses.reduce((sum, t) => sum + convertCurrency(t.amount, t.currency, preferredCurrency), 0);
        if (total === 0) return []; // No expenses this month

        thisMonthExpenses.forEach((t) => {
            const category = useFinanceStore.getState().categories.find(c => c.id === t.categoryId);
            const amtItem = convertCurrency(t.amount, t.currency, preferredCurrency);

            if (category) {
                const existing = categoryMap.get(category.id);
                if (existing) {
                    existing.amount += amtItem;
                } else {
                    categoryMap.set(category.id, {
                        amount: amtItem,
                        color: category.color || '#3B82F6',
                        name: category.name
                    });
                }
            }
        });

        const breakdown = Array.from(categoryMap.values())
            .map(item => ({
                ...item,
                value: item.amount,
                percentage: (item.amount / total) * 100
            }))
            .sort((a, b) => b.amount - a.amount); // Sort by highest spend

        return breakdown;
    }, [transactions, preferredCurrency]);

    return {
        currentMonthExpenses,
        currentMonthIncome,
        totalBalance,
        checkBudgetProgress,
        last7DaysSpending,
        currentMonthCategoryBreakdown
    };
};


export const useWeeklySpending = (weekStartDate: Date) => {
    const transactions = useFinanceStore((state) => state.transactions);
    const preferredCurrency = useFinanceStore((state) => state.preferredCurrency);
    const categories = useFinanceStore((state) => state.categories);

    return useMemo(() => {
        const data = [];

        for (let i = 0; i < 7; i++) {
            // Re-construct the target date explicitly to avoid cross-timezone bleed
            const targetDate = new Date(
                weekStartDate.getFullYear(),
                weekStartDate.getMonth(),
                weekStartDate.getDate() + i
            );

            // Format to YYYY-MM-DD using local time explicitly
            const year = targetDate.getFullYear();
            const month = String(targetDate.getMonth() + 1).padStart(2, '0');
            const day = String(targetDate.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            const dayStr = format(targetDate, 'EEE'); // e.g. "Mon"

            const dayTransactions = transactions.filter((t) => {
                if (t.type !== 'Expense') return false;
                const localDateStr = format(new Date(t.date), 'yyyy-MM-dd');
                return localDateStr === dateStr;
            });

            if (dayTransactions.length === 0) {
                data.push({
                    label: dayStr,
                    stacks: [{ value: 0, color: 'transparent' }],
                    date: dateStr,
                });
                continue;
            }

            const categoryTotals = new Map<string, number>();
            dayTransactions.forEach(t => {
                const amountInPreferred = convertCurrency(t.amount, t.currency, preferredCurrency);
                categoryTotals.set(t.categoryId, (categoryTotals.get(t.categoryId) || 0) + amountInPreferred);
            });

            const stacks = Array.from(categoryTotals.entries()).map(([catId, value]) => {
                const cat = categories.find(c => c.id === catId);
                return {
                    value,
                    color: cat?.color || '#3B82F6',
                    marginBottom: 2
                };
            });

            data.push({
                label: dayStr,
                stacks,
                date: dateStr,
            });
        }

        return data;
    }, [transactions, preferredCurrency, categories, weekStartDate.toISOString()]);
};
