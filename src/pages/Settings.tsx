import { useFinanceStore } from '../store/useFinanceStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export function Settings() {
  const preferredCurrency = useFinanceStore(state => state.preferredCurrency);
  const setPreferredCurrency = useFinanceStore(state => state.setPreferredCurrency);
  const clearAllData = useFinanceStore(state => state.clearAllData);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Settings</h1>
      
      <Card>
        <h2 className="text-xl font-bold mb-4">Preferences</h2>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-gray-900">Base Currency</div>
            <div className="text-sm text-gray-500">Your primary currency for total balances</div>
          </div>
          <select 
            value={preferredCurrency} 
            onChange={(e) => setPreferredCurrency(e.target.value as any)}
            className="bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 font-medium outline-none"
          >
            <option value="PEN">PEN (Soles)</option>
            <option value="USD">USD (Dollars)</option>
          </select>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-bold mb-4">Account</h2>
        <p className="text-sm text-gray-500 mb-4">Manage your account session.</p>
        <Button variant="secondary" onClick={handleSignOut}>
          Sign Out
        </Button>
      </Card>

      <Card className="border-red-100 bg-red-50/50">
        <h2 className="text-xl font-bold mb-4 text-red-600">Danger Zone</h2>
        <p className="text-sm text-gray-600 mb-4">Permanently clear all cached local data. This will not delete data from the Supabase cloud if it is already synced.</p>
        <Button variant="danger" onClick={() => {
            if(window.confirm('Are you sure you want to clear the local cache?')) {
                clearAllData();
            }
        }}>Clear Local Cache</Button>
      </Card>
    </div>
  );
}
