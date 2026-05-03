import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { Budget, Category, Currency, PaymentMethod, Transaction } from '../types';

interface FinanceState {
    transactions: Transaction[];
    categories: Category[];
    budgets: Budget[];
    preferredCurrency: Currency;
    paymentMethods: PaymentMethod[];

    // Actions
    fetchTransactions: () => Promise<void>;
    addTransaction: (transaction: Transaction) => Promise<void>;
    removeTransaction: (id: string) => Promise<void>;
    updateTransaction: (id: string, updated: Partial<Transaction>) => Promise<void>;

    addCategory: (category: Category) => void;
    updateCategory: (id: string, updated: Partial<Category>) => void;
    removeCategory: (id: string) => void;

    addBudget: (budget: Budget) => void;
    updateBudget: (id: string, limitAmount: number) => void;

    addPaymentMethod: (method: PaymentMethod) => void;
    updatePaymentMethod: (id: string, updated: Partial<PaymentMethod>) => void;

    setPreferredCurrency: (currency: Currency) => void;

    // Helpers
    clearAllData: () => void;
}

const defaultCategories: Category[] = [
    { id: 'cat-1', name: 'Transport', type: 'Expense', icon: 'car', color: '#4F46E5' },
    { id: 'cat-2', name: 'Food', type: 'Expense', icon: 'fast-food-outline', color: '#E11D48' },
    { id: 'cat-3', name: 'Leisure', type: 'Expense', icon: 'game-controller-outline', color: '#10B981' },
    { id: 'cat-4', name: 'Gifts', type: 'Expense', icon: 'gift-outline', color: '#F59E0B' },
    { id: 'cat-5', name: 'Sueldo', type: 'Income', icon: 'cash-outline', color: '#3B82F6' },
    { id: 'cat-6', name: 'Yapeo', type: 'Income', icon: 'phone-portrait-outline', color: '#8B5CF6' },
];

export const useFinanceStore = create<FinanceState>()(
    persist(
        (set, get) => ({
            transactions: [],
            categories: defaultCategories,
            budgets: [],
            preferredCurrency: 'PEN',
            paymentMethods: [
                { id: 'pm-1', name: 'Cash', initialBalance: 0 },
                { id: 'pm-2', name: 'BCP', initialBalance: 0 },
            ],

            fetchTransactions: async () => {
                const { data, error } = await supabase
                    .from('transactions')
                    .select('*')
                    .order('date', { ascending: false });

                if (error) {
                    console.error('Error fetching transactions:', error);
                    return;
                }

                if (data) {
                    const mapped = data.map((t: any) => ({
                        id: t.id,
                        amount: t.amount,
                        currency: t.currency,
                        title: t.title,
                        description: t.description,
                        categoryId: t.category_id,
                        paymentMethod: t.payment_method,
                        date: t.date,
                        type: t.type,
                        confirmation: t.confirmation,
                    }));
                    set({ transactions: mapped as Transaction[] });
                }
            },

            addTransaction: async (transaction) => {
                set((state) => ({ transactions: [transaction, ...state.transactions] }));

                const { error } = await supabase.from('transactions').insert({
                    id: transaction.id,
                    amount: transaction.amount,
                    currency: transaction.currency,
                    title: transaction.title,
                    description: transaction.description,
                    category_id: transaction.categoryId,
                    payment_method: transaction.paymentMethod,
                    date: transaction.date,
                    type: transaction.type,
                    confirmation: transaction.confirmation || 'Confirmed'
                });

                if (error) {
                    console.error('Error adding transaction:', error);
                    set((state) => ({
                        transactions: state.transactions.filter((t) => t.id !== transaction.id),
                    }));
                }
            },

            removeTransaction: async (id) => {
                const previousTransactions = get().transactions;
                set((state) => ({
                    transactions: state.transactions.filter((t) => t.id !== id),
                }));

                const { error } = await supabase.from('transactions').delete().eq('id', id);
                if (error) {
                    console.error('Error deleting transaction:', error);
                    set({ transactions: previousTransactions });
                }
            },

            updateTransaction: async (id, updated) => {
                const previousTransactions = get().transactions;
                set((state) => ({
                    transactions: state.transactions.map((t) =>
                        t.id === id ? { ...t, ...updated } : t
                    ),
                }));

                const updateData: any = {};
                if (updated.amount !== undefined) updateData.amount = updated.amount;
                if (updated.currency !== undefined) updateData.currency = updated.currency;
                if (updated.title !== undefined) updateData.title = updated.title;
                if (updated.description !== undefined) updateData.description = updated.description;
                if (updated.categoryId !== undefined) updateData.category_id = updated.categoryId;
                if (updated.paymentMethod !== undefined) updateData.payment_method = updated.paymentMethod;
                if (updated.date !== undefined) updateData.date = updated.date;
                if (updated.type !== undefined) updateData.type = updated.type;
                if (updated.confirmation !== undefined) updateData.confirmation = updated.confirmation;

                const { error } = await supabase.from('transactions').update(updateData).eq('id', id);
                if (error) {
                    console.error('Error updating transaction:', error);
                    set({ transactions: previousTransactions });
                }
            },

            addCategory: (category) =>
                set((state) => ({ categories: [...state.categories, category] })),

            updateCategory: (id, updated) =>
                set((state) => ({
                    categories: state.categories.map((c) =>
                        c.id === id ? { ...c, ...updated } : c
                    ),
                })),

            removeCategory: (id) =>
                set((state) => ({
                    categories: state.categories.filter((c) => c.id !== id),
                })),

            addBudget: (budget) =>
                set((state) => ({ budgets: [...state.budgets, budget] })),

            updateBudget: (id, limitAmount) =>
                set((state) => ({
                    budgets: state.budgets.map((b) =>
                        b.id === id ? { ...b, limitAmount, currency: 'PEN' } : b
                    ),
                })),

            addPaymentMethod: (method) =>
                set((state) => ({ paymentMethods: [...state.paymentMethods, method] })),

            updatePaymentMethod: (id, updated) =>
                set((state) => ({
                    paymentMethods: state.paymentMethods.map((pm) =>
                        pm.id === id ? { ...pm, ...updated } : pm
                    ),
                })),

            setPreferredCurrency: (currency) => set({ preferredCurrency: currency }),

            clearAllData: () => set({ transactions: [], budgets: [] }),
        }),
        {
            name: 'finance-storage',
            storage: createJSONStorage(() => AsyncStorage),
            merge: (persistedState: any, currentState) => {
                const state = { ...currentState, ...persistedState };

                const mergedCategories = [...(persistedState.categories || [])];

                currentState.categories.forEach((defaultCat: Category) => {
                    const existingIdx = mergedCategories.findIndex(c => c.id === defaultCat.id);
                    if (existingIdx === -1) {
                        mergedCategories.push(defaultCat);
                    } else {
                        if (!mergedCategories[existingIdx].type) {
                            mergedCategories[existingIdx].type = defaultCat.type;
                        }
                    }
                });

                state.categories = mergedCategories.map(c => ({
                    ...c,
                    type: c.type || 'Expense',
                }));

                if (!state.paymentMethods || state.paymentMethods.length === 0) {
                    state.paymentMethods = [
                        { id: 'pm-1', name: 'Cash', initialBalance: 0 },
                        { id: 'pm-2', name: 'BCP', initialBalance: 0 },
                    ];
                } else {
                    state.paymentMethods = state.paymentMethods.map((pm: any) => ({
                        ...pm,
                        initialBalance: pm.initialBalance !== undefined ? pm.initialBalance : 0
                    }));
                }

                return state as FinanceState;
            }
        }
    )
);
