import React, { useState } from "react";

interface BankDepositModalProps {
  onClose: () => void;
}

const BankDepositModal: React.FC<BankDepositModalProps> = ({ onClose }) => {
  const [amount, setAmount] = useState("");

  const handleConfirm = () => {
    if (!amount || isNaN(parseFloat(amount))) {
      alert("❌ Please enter a valid amount.");
      return;
    }
    alert(`✅ Bank Deposit of $${amount} Successful!`);
    setAmount(""); // Reset input
    onClose(); // Close modal
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
          className="py-3 px-6 bg-green-500 hover:bg-green-600 text-white rounded-full font-inter text-sm tracking-wide"
        >
          Confirm Deposit
        </button>

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
