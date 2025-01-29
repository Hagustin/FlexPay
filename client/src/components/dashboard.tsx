import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_USER, GET_WALLET_BALANCE } from '../graphql/queries';
import TransactionHistory from './TransactionHistory'; // Import TransactionHistory

const Dashboard: React.FC = () => {
  const {
    loading: loadingUser,
    error: errorUser,
    data: userData,
  } = useQuery(GET_USER);
  const {
    loading: loadingBalance,
    error: errorBalance,
    data: balanceData,
  } = useQuery(GET_WALLET_BALANCE);

  if (loadingUser || loadingBalance)
    return <p className="text-center">Loading...</p>;
  if (errorUser)
    return (
      <p className="text-red-500 text-center">
        Error fetching user data: {errorUser.message}
      </p>
    );
  if (errorBalance)
    return (
      <p className="text-red-500 text-center">
        Error fetching wallet balance: {errorBalance.message}
      </p>
    );

  const { accountDetails } = userData || {
    accountDetails: { name: 'N/A', email: 'N/A', id: '0' },
  };
  const { balance } = balanceData || { balance: 0 };

  return (
    <div className="min-h-screen bg-gray-100">
      <h1>Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Wallet Balance */}
        <div className="card">
          <h2>Wallet Balance</h2>
          <p>${balance.toFixed(2)}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Wallet Balance */}
          <div className="p-4 bg-white shadow rounded-md text-center">
            <h2 className="text-lg font-semibold mb-2">Wallet Balance</h2>
            <p className="text-2xl font-bold text-green-600">
              ${balance.toFixed(2)}
            </p>
          </div>

          {/* Account Details */}
          <div className="p-4 bg-white shadow rounded-md text-center">
            <h2 className="text-lg font-semibold mb-2">Account Details</h2>
            <p>
              <strong>Name:</strong> {accountDetails.name}
            </p>
            <p>
              <strong>Email:</strong> {accountDetails.email}
            </p>
          </div>

          {/* Transaction History - Replaces the previous "Recent Transactions" */}
          <div className="p-4 bg-white shadow rounded-md">
            <TransactionHistory userId={accountDetails.id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
