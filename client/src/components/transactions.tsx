import { useQuery } from "@apollo/client";
import { GET_TRANSACTIONS } from "../graphql/queries";

const Transactions = () => {
  const { loading, error, } = useQuery(GET_TRANSACTIONS);

  if (loading) return <p>Loading transactions...</p>;
  if (error) return <p className="text-red-500">Error loading transactions: {error.message}</p>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">SAMPLE ONLY PLEASE CHANGE SHAREEF!</h2>
    </div>
  );
};

export default Transactions;
