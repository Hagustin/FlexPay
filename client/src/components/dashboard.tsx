import React, { useEffect, useState } from 'react';
import Navbar from './navbar';

const Dashboard: React.FC = () => {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accountDetails, setAccountDetails] = useState<any>({});

  useEffect(() => {
    setBalance(0); 
    setTransactions([
      { id: 1, date: '', amount: '', description: '' }, // user to add transactions here
      { id: 2, date: '', amount: '', description: '' },
    ]);
    setAccountDetails({
      name: '', // user to add their details here
      email: '',
    });
  }, []);

  return (
    <div className="dashboard">
        <Navbar />
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
            {transactions.map((txn) => (
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
    </div>
  );
};

export default Dashboard;
