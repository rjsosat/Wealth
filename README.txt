Wealth Management Tracker
=========================

A personal finance tracker built with React Native (Expo) and Supabase.

Features
--------
- Dashboard with Income/Expense summary
- Remote Transaction Storage via Supabase
- Review "Pending" Transactions automatically on load
- Create new Transactions (Expense or Income)
- Category & Payment Method management

Setup Instructions
------------------
1. Clone or download the project.
2. Ensure you have Node.js installed.
3. Install dependencies:
   npm install
4. Create a `.env.local` file at the root of the project with your Supabase credentials:
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
5. Start the Expo server:
   npx expo start

Database Schema (Supabase)
--------------------------
Table: transactions
Columns:
- id (UUID, Primary Key)
- created_at (TIMESTAMP)
- amount (NUMERIC)
- currency (TEXT)
- title (TEXT)
- description (TEXT)
- category_id (TEXT)
- payment_method (TEXT)
- date (TIMESTAMP)
- type (TEXT: 'Income' or 'Expense')
- confirmation (TEXT: 'Confirmed' or 'Pending')

Running the App
---------------
Use the Expo Go app on your phone, or run it on an iOS Simulator/Android Emulator.
