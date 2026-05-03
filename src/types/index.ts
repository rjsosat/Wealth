export type Currency = 'USD' | 'PEN';

export type TransactionType = 'Income' | 'Expense';

export type Category = {
    id: string;
    name: string;
    type: TransactionType | 'Both'; // Determine if it belongs to Income or Expense dictionary
    icon?: string; // e.g., using lucide-react-native or expo vector icons name
    color?: string; // Hex color for UI
};

export type PaymentMethod = {
    id: string;
    name: string;
    initialBalance?: number;
    cardLast4?: string;
    accountType?: 'Debit' | 'Credit';
};

export type CategorizationRule = {
    id?: string;
    matchPattern: string;
    mappedTitle: string;
    mappedCategoryId: string;
};

export type Transaction = {
    id: string;
    amount: number;
    currency: Currency;
    title: string;
    description?: string;
    categoryId: string;
    paymentMethod?: string;
    date: string; // ISO format string
    type: TransactionType;
    confirmation?: 'Confirmed' | 'Pending';
};

export type Budget = {
    id: string;
    categoryId: string;
    limitAmount: number;
    currency: Currency;
    period: 'monthly'; // currently only monthly
};
