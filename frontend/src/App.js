import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import BankList from './components/Banks/BankList';
import AccountList from './components/Accounts/AccountList';
import BalanceList from './components/Balances/BalanceList';
import BalanceChart from './components/Balances/BalanceChart';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/accounts" replace />} />
        <Route path="/banks" element={<BankList />} />
        <Route path="/accounts" element={<AccountList />} />
        <Route path="/balances" element={<BalanceList />} />
        <Route path="/chart" element={<BalanceChart />} />
        <Route path="*" element={<Navigate to="/accounts" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;