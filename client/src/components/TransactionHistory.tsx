import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_TRANSACTIONS } from '../graphql/queries';
import check from '../assets/check.svg';

interface Transaction {
  id: string;
  amount: number;
  type: string;
  date: string;
}

interface TransactionHistoryProps {
  userId: string;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ userId }) => {
  const { loading, error, data } = useQuery(GET_TRANSACTIONS, {
    variables: { userId, limit: 10, offset: 0 }, // Pagination parameters
  });

  if (loading) return <p>Loading transactions...</p>;
  if (error) return <p>Error fetching transactions: {error.message}</p>;

  // Ensure that data is available and transactions are valid
  const transactions: Transaction[] = data?.getTransactions || [];

  if (transactions.length === 0) {
    return <p>No transactions available.</p>;
  }

  return (
    <>
      <div className="flex flex-col gap-10">
        <div>
          <h2 className="font-medium text-2xl tracking-widest">
            Transaction History
          </h2>
          <p className="text-sm font-medium text-gray-400 tracking-widest ">
            All Of Time
          </p>
        </div>
        <div>
          {transactions.map((txn) => (
            <>
              <div
                key={txn.id}
                className="card w-full flex flex-row justify-between mb-10"
              >
                <div className="flex flex-row gap-3.5 items-center">
                  <div className="flex flex-col">
                    <div className="flex flex-row gap-2 items-center">
                      <div className="h-8 w-8 bg-green-500 rounded-full flex justify-center items-center">
                        <img src={check} />
                      </div>
                      <div className="text-base text-green-500 font-medium">
                        {txn.type}
                      </div>
                    </div>
                    <div className="pl-10 font-ivy tracking-widest text-lg">
                      {txn.date}
                    </div>
                  </div>
                </div>
                <div className="font-ivy tracking-widest text-2xl">
                  ${txn.amount}
                </div>
              </div>
              <div className="w-full border-t-2 border-gray-200 pb-10"></div>
            </>
          ))}
        </div>
      </div>
    </>
  );
};

export default TransactionHistory;
