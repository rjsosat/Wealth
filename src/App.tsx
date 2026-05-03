import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Login from './pages/Login';
import { Layout } from './components/ui/Layout';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Settings } from './pages/Settings';
import { AddTransaction } from './pages/AddTransaction';
import { EditTransaction } from './pages/EditTransaction';
import { Budgets } from './pages/Budgets';
import { Accounts } from './pages/Accounts';
import { useFinanceStore } from './store/useFinanceStore';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const session = useFinanceStore(state => state.session);
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  const fetchInitialData = useFinanceStore(state => state.fetchInitialData);
  const setSession = useFinanceStore(state => state.setSession);
  const session = useFinanceStore(state => state.session);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsInitializing(false);
      if (session) {
        fetchInitialData();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchInitialData();
      }
    });

    return () => subscription.unsubscribe();
  }, [setSession, fetchInitialData]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={session ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="add" element={<AddTransaction />} />
          <Route path="edit/:id" element={<EditTransaction />} />
          <Route path="budgets" element={<Budgets />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
