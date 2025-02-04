import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { ADD_FUNDS } from "../graphql/mutations";
import { GET_WALLET_BALANCE, GET_TRANSACTIONS } from "../graphql/queries";

interface BankDepositModalProps {
  onClose: () => void;
  userId: string; // Ensure userId is passed
}

const BankDepositModal: React.FC<BankDepositModalProps> = ({ onClose, userId }) => {
  const [amount, setAmount] = useState("");

  // Apollo Query for Transaction History
  const { refetch: refetchTransactions } = useQuery(GET_TRANSACTIONS, {
    variables: { userId, limit: 10, offset: 0 },
  });

  // Apollo Query for Wallet Balance
  const { refetch: refetchBalance } = useQuery(GET_WALLET_BALANCE, {
    variables: { id: userId },
  });

  // Apollo Mutation for Deposit
  const [addFunds, { loading, error }] = useMutation(ADD_FUNDS, {
    refetchQueries: [
      { query: GET_WALLET_BALANCE, variables: { id: userId } }, // ✅ Ensure wallet updates
      { query: GET_TRANSACTIONS, variables: { userId, limit: 10, offset: 0 } } // ✅ Ensure transaction history updates
    ],
    awaitRefetchQueries: true, // ✅ Wait until both are updated before UI re-renders
  });

  const handleConfirm = async () => {
    const depositAmount = parseFloat(amount);

    if (!amount || isNaN(depositAmount) || depositAmount <= 0) {
      alert("❌ Please enter a valid deposit amount.");
      return;
    }

    try {
      console.log("🔍 Sending deposit request:", { userId, amount: depositAmount });

      const { data } = await addFunds({
        variables: { userId, amount: depositAmount },
      });

      console.log("✅ Deposit Response:", data);
      alert(`✅ Bank Deposit of $${depositAmount} Successful!`);

      setAmount(""); // Reset input

      // ✅ Manually trigger a refresh for both wallet balance AND transaction history
      await refetchBalance();
      await refetchTransactions();

      onClose(); // Close modal
    } catch (error: any) {
      console.error("❌ Deposit failed:", error);
      alert(`❌ Deposit failed: ${error.message}`);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-3xl shadow-lg w-96 flex flex-col gap-4">
        <h2 className="text-sm font-medium text-gray-400 tracking-widest">Bank Deposit</h2>

        {/* Amount Input */}
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter Amount"
          className="w-full p-3 border border-gray-300 rounded-lg text-center"
        />

        {/* Confirm Button */}
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="py-3 px-6 bg-green-500 hover:bg-green-600 text-white rounded-full font-inter text-sm tracking-wide"
        >
          {loading ? "Processing..." : "Confirm Deposit"}
        </button>

        {/* Error Message */}
        {error && <p className="text-red-500 text-sm">{error.message}</p>}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="py-3 px-6 border-1.25 border-gray-400 outline outline-gray-400 rounded-full font-inter hover:text-white hover:bg-gray-400 text-sm tracking-wide"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default BankDepositModal;
