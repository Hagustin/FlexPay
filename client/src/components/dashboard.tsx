import React from "react";
import { useQuery } from "@apollo/client";
import Navbar from "./navbar";
import { GET_USER, GET_TRANSACTIONS, GET_WALLET_BALANCE } from "../graphql/queries";
//Dashboard needs some serious work. It's not displaying the data correctly.
const Dashboard: React.FC = () => {
  const { loading: loadingUser, error: errorUser, data: userData } = useQuery(GET_USER);
  const { loading: loadingTransactions, error: errorTransactions, data: transactionsData } = useQuery(GET_TRANSACTIONS);
  const { loading: loadingBalance, error: errorBalance, data: balanceData } = useQuery(GET_WALLET_BALANCE);

  if (loadingUser || loadingTransactions || loadingBalance) return <p className="text-center">Loading...</p>;
  if (errorUser) return <p className="text-red-500 text-center">Error fetching user data: {errorUser.message}</p>;
  if (errorTransactions) return <p className="text-red-500 text-center">Error fetching transactions: {errorTransactions.message}</p>;
  if (errorBalance) return <p className="text-red-500 text-center">Error fetching wallet balance: {errorBalance.message}</p>;

  const { accountDetails } = userData || { accountDetails: { name: "N/A", email: "N/A" } };
  const { transactions } = transactionsData || { transactions: [] };
  const { balance } = balanceData || { balance: 0 };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-5xl mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold text-center mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/*Wallet Balance */}
          <div className="p-4 bg-white shadow rounded-md text-center">
            <h2 className="text-lg font-semibold mb-2">Wallet Balance</h2>
            <p className="text-2xl font-bold text-green-600">${balance.toFixed(2)}</p>
          </div>

          {/*Recent Transactions */}
          <div className="p-4 bg-white shadow rounded-md">
            <h2 className="text-lg font-semibold mb-2">Recent Transactions</h2>
            <ul className="text-sm">
              {transactions.length > 0 ? (
                transactions.map((txn: any) => (
                  <li key={txn.id} className="border-b py-2">
                    <span className="font-medium">{new Date(txn.date).toLocaleDateString()}</span>: 
                    {txn.description} <span className={`font-bold ${txn.amount < 0 ? "text-red-500" : "text-green-500"}`}>(${txn.amount})</span>
                  </li>
                ))
              ) : (
                <p className="text-gray-500">No transactions found.</p>
              )}
            </ul>
          </div>

          {/* Account Details */}
          <div className="p-4 bg-white shadow rounded-md text-center">
            <h2 className="text-lg font-semibold mb-2">Account Details</h2>
            <p><strong>Name:</strong> {accountDetails.name}</p>
            <p><strong>Email:</strong> {accountDetails.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
