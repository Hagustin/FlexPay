import React from 'react';
import { useQuery } from '@apollo/client';
import {
  GET_USER,
  GET_TRANSACTIONS,
  GET_WALLET_BALANCE,
} from '../graphql/queries';
import TransactionHistory from './TransactionHistory';

const Dashboard: React.FC = () => {
  const {
    loading: loadingUser,
    error: errorUser,
    data: userData,
  } = useQuery(GET_USER);

  const {
    loading: loadingTransactions,
    error: errorTransactions,
    data: transactionsData,
  } = useQuery(GET_TRANSACTIONS);

  const {
    loading: loadingBalance,
    error: errorBalance,
    data: balanceData,
  } = useQuery(GET_WALLET_BALANCE);

  if (loadingUser || loadingTransactions || loadingBalance)
    return <p>Loading...</p>;
  if (errorUser) return <p>Error fetching user data: {errorUser.message}</p>;
  if (errorTransactions)
    return <p>Error fetching transactions: {errorTransactions.message}</p>;
  if (errorBalance)
    return <p>Error fetching wallet balance: {errorBalance.message}</p>;

  const { accountDetails } = userData;
  const { transactions } = transactionsData;
  const { balance } = balanceData;

  return (
    <div className="min-h-screen bg-gray-100">
      <h1>Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Wallet Balance */}
        <div className="card">
          <h2>Wallet Balance</h2>
          <p>${balance.toFixed(2)}</p>
        </div>

        {/* Recent Transactions */}
        <div className="card">
          <h2>Recent Transactions</h2>
          <ul>
            {transactions.map((txn: any) => (
              <li key={txn.id}>
                {txn.date}: {txn.description} (${txn.amount})
              </li>
            ))}
          </ul>
        </div>

        {/* Account Details */}
        <div className="card">
          <h2>Account Details</h2>
          <p>Name: {accountDetails.name}</p>
          <p>Email: {accountDetails.email}</p>
        </div>
      </div>
      {/* Transaction History */}
      <TransactionHistory userId={userData?.getUser.id} />
    </div>
  );
};

export default Dashboard;
