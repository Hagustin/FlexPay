import { useQuery } from "@apollo/client";
import { GET_TRANSACTIONS } from "../graphql/queries";

const Transactions = () => {
  const { loading, error, data } = useQuery(GET_TRANSACTIONS);

  if (loading) return <p>Loading transactions...</p>;
  if (error) return <p className="text-red-500">Error loading transactions: {error.message}</p>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Transaction History</h2>
      <ul className="bg-white shadow-md rounded p-4">
        {data.transactions.map((txn: any) => (
          <li key={txn.id} className="border-b py-2">
            <span className="font-semibold">{txn.date}:</span> {txn.description} - <span className="font-bold">${txn.amount}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Transactions;
