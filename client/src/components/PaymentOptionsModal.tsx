import React from "react";

interface PaymentOptionsModalProps {
  onClose: () => void;
  onGenerateQR: () => void;
  onBankDeposit: () => void;
}

const PaymentOptionsModal: React.FC<PaymentOptionsModalProps> = ({ onClose, onGenerateQR, onBankDeposit }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-3xl shadow-lg w-96 flex flex-col gap-4">
        <h2 className="text-sm font-medium text-gray-400 tracking-widest">Select Payment Option</h2>

        {/* Generate QR Code */}
        <button
          onClick={onGenerateQR}
          className="py-3 px-6 border-1.25 border-black outline outline-black rounded-full font-inter hover:text-white hover:bg-black text-sm tracking-wide"
        >
          Generate QR Code
        </button>

        {/* Bank Deposit */}
        <button
          onClick={onBankDeposit}
          className="py-3 px-6 border-1.25 border-black outline outline-black rounded-full font-inter hover:text-white hover:bg-black text-sm tracking-wide"
        >
          Bank Deposit
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

export default PaymentOptionsModal;
