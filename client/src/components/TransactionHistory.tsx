import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_TRANSACTIONS } from '../graphql/queries';
import check from '../assets/check.svg';
import { useState } from 'react';
import refresh from '../assets/refresh.svg';
import refreshing from '../assets/refresh-alert.svg';
import x from '../assets/x.svg';

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

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short', // "Feb"
    day: '2-digit', // "04"
    hour: '2-digit', // "07 PM"
    minute: '2-digit',
    hour12: true, // Show AM/PM
  }).format(new Date(dateString));
};

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  userId,
  refetch,
}) => {
  const { loading, error, data } = useQuery(GET_TRANSACTIONS, {
    variables: { userId, limit: 10, offset: 0 },
    fetchPolicy: 'network-only', // ✅ Always get fresh data
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  if (loading) return <p>Loading transactions...</p>;
  if (error) return <p>Error fetching transactions: {error.message}</p>;

  const transactions: Transaction[] = data?.getTransactions || [];

  if (transactions.length === 0) {
    return <p>No transactions available.</p>;
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-row w-full justify-between">
        <div>
          <h2 className="font-medium text-2xl tracking-widest">
            Transaction History
          </h2>
          <p className="text-sm font-medium text-gray-400 tracking-widest">
            All Time Transactions
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="py-3 px-4 border-1.25 border-black outline outline-black rounded-full font-inter text-sm tracking-wide"
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <img src={refreshing} alt="status-check" />
          ) : (
            <img src={refresh} alt="status-check" />
          )}
        </button>
      </div>

      <div>
        {transactions.map((txn) => (
          <div key={txn.id}>
            <div className="card w-full flex flex-row justify-between mb-10">
              <div className="flex flex-row gap-3.5 items-center">
                <div className="flex flex-col">
                  <div className="flex flex-row gap-2 items-center">
                    <div
                      className={`h-8 w-8 rounded-full flex justify-center items-center ${
                        txn.status === 'completed'
                          ? 'bg-green-500'
                          : 'bg-yellow-500'
                      }`}
                    >
                      <img
                        src={`${txn.status === 'completed' ? check : x}`}
                        alt="status-check"
                      />
                    </div>
                    <div
                      className={`text-base font-medium ${
                        txn.status === 'completed'
                          ? 'text-green-500'
                          : 'text-yellow-500'
                      }`}
                    >
                      {txn.status ? (txn.status === 'completed' ? 'Completed' : 'Pending') : 'Unknown'}
                    </div>
                  </div>
                  <div className="pl-10 font-ivy tracking-widest text-lg">
                    {formatDate(txn.date)}
                  </div>
                  <div className="pl-10 text-sm text-gray-600">
                    {txn.description || 'No description'}
                  </div>
                </div>
              </div>
              <div className="font-ivy tracking-widest text-2xl">
                ${txn.amount}
              </div>
            </div>
            <div className="w-full border-t-2 border-gray-200 pb-10"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionHistory;
