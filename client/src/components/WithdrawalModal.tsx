import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { WITHDRAW_FUNDS } from "../graphql/mutations";
import { GET_WALLET_BALANCE, GET_TRANSACTIONS } from "../graphql/queries";

interface WithdrawalModalProps {
  onClose: () => void;
  userId: string;
  isOpen: boolean;
}

const WithdrawalModal: React.FC<WithdrawalModalProps> = ({ onClose, userId, isOpen }) => {
  const [amount, setAmount] = useState("");
  const [withdrawFunds, { loading }] = useMutation(WITHDRAW_FUNDS, {
    refetchQueries: [
      { query: GET_WALLET_BALANCE, variables: { id: userId } },
      { query: GET_TRANSACTIONS, variables: { userId, limit: 10, offset: 0 } },
    ],
    awaitRefetchQueries: true,
  });

  if (!isOpen) return null;

  const handleConfirm = async () => {
    const withdrawalAmount = parseFloat(amount);
    if (!amount || isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
      alert("❌ Please enter a valid withdrawal amount.");
      return;
    }

    try {
      await withdrawFunds({ variables: { userId, amount: withdrawalAmount } });
      alert(`✅ Withdrawal of $${withdrawalAmount} to your bank was successful!`);
      setAmount(""); // Reset input field
      onClose(); // Close modal
    } catch (error: any) {
      alert(`❌ Withdrawal failed: ${error.message}`);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-3xl shadow-lg w-96 flex flex-col gap-4">
        <h2 className="text-sm font-medium text-gray-400 tracking-widest">
          Withdraw Funds
        </h2>
        <p className="text-3xl sm:text-4xl font-medium text-black font-ivy tracking-widest">
          Enter Amount
        </p>

        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="$0.00"
          className="w-full p-3 border border-gray-300 rounded-lg text-center"
        />

        <button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full py-3 px-6 bg-red-500 hover:bg-red-600 text-white rounded-full font-inter text-sm tracking-wide"
        >
          {loading ? "Processing..." : "Confirm Withdrawal"}
        </button>

        <button
          onClick={onClose}
          className="w-full py-3 px-6 border-1.25 border-gray-400 outline outline-gray-400 rounded-full font-inter hover:text-white hover:bg-gray-400 text-sm tracking-wide"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default WithdrawalModal;
