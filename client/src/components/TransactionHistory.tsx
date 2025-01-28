import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_TRANSACTIONS } from '../graphql/queries';

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
    variables: { userId },
  });

  if (loading) return <p>Loading transactions...</p>;
  if (error) return <p>Error fetching transactions: {error.message}</p>;

  const transactions: Transaction[] = data.getTransactions;

  return (
    <div className="card">
      <h2>Recent Transactions</h2>
      <ul>
        {transactions.map((txn) => (
          <li key={txn.id}>
            {txn.date}: {txn.type} - ${txn.amount}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TransactionHistory;
