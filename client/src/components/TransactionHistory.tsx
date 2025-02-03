import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_TRANSACTIONS } from '../graphql/queries';
import check from '../assets/check.svg';

interface Transaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  date: string;
  senderId?: string;
  receiverId?: string;
  description?: string;
}

interface TransactionHistoryProps {
  userId: string;
  refetch: () => Promise<any>; // shareef added this to update transactio nafter scan
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ userId, refetch }) => {
  const { loading, error, data } = useQuery(GET_TRANSACTIONS, {
    variables: { userId, limit: 10, offset: 0 },
    fetchPolicy: "network-only", // ✅ Always get fresh data
  });

  if (loading) return <p>Loading transactions...</p>;
  if (error) return <p>Error fetching transactions: {error.message}</p>;

  const transactions: Transaction[] = data?.getTransactions || [];

  if (transactions.length === 0) {
    return <p>No transactions available.</p>;
  }

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h2 className="font-medium text-2xl tracking-widest">Transaction History</h2>
        <p className="text-sm font-medium text-gray-400 tracking-widest">All Time Transactions</p>
      </div>
      <button
        onClick={() => refetch()} // ✅ Refresh transaction history
        className="py-2 px-4 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm"
      >
        Refresh Transactions
      </button>
      <div>
        {transactions.map((txn) => (
          <div key={txn.id}>
            <div className="card w-full flex flex-row justify-between mb-10">
              <div className="flex flex-row gap-3.5 items-center">
                <div className="flex flex-col">
                  <div className="flex flex-row gap-2 items-center">
                    <div
                      className={`h-8 w-8 rounded-full flex justify-center items-center ${
                        txn.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
                      }`}
                    >
                      <img src={check} alt="status-check" />
                    </div>
                    <div
                      className={`text-base font-medium ${
                        txn.status === 'completed' ? 'text-green-500' : 'text-yellow-500'
                      }`}
                    >
                      {txn.status === 'completed' ? '✅ Completed' : '⏳ Pending'}
                    </div>
                  </div>
                  <div className="pl-10 font-ivy tracking-widest text-lg">{txn.date}</div>
                  <div className="pl-10 text-sm text-gray-600">{txn.description || 'No description'}</div>
                </div>
              </div>
              <div className="font-ivy tracking-widest text-2xl">${txn.amount}</div>
            </div>
            <div className="w-full border-t-2 border-gray-200 pb-10"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionHistory;
