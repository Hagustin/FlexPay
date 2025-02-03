import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { GENERATE_QR } from '../graphql/mutations';
import { QRCodeCanvas } from 'qrcode.react';

interface QRModalProps {
  userId: string;
  onClose: () => void;
}

const QRModal: React.FC<QRModalProps> = ({ userId, onClose }) => {
  const [amount, setAmount] = useState('');
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [generateQR, { loading, error }] = useMutation(GENERATE_QR);

  const handleGenerateQR = async () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      alert("⚠️ Please enter a valid amount greater than zero.");
      return;
    }

    const formattedAmount = parseFloat(amount);

    try {
      const { data } = await generateQR({ variables: { userId, amount: formattedAmount } });

      if (data && data.generateQR.code) {
        const qrPayload = {
          receiverId: userId, // ✅ Store correct user ID
          amount: formattedAmount,
        };

        setQrCodeData(JSON.stringify(qrPayload));
      } else {
        alert("❌ Error generating QR code. Please try again.");
      }
    } catch (error) {
      console.error("❌ Error generating QR Code:", error);
      alert("⚠️ An error occurred while generating the QR code.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-3xl shadow-lg w-96 flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-medium text-gray-400 tracking-widest">
            Receive Payments
          </h2>
          <label className="text-4xl font-medium text-black font-ivy tracking-widest">
            QR Code
          </label>
        </div>

        {!qrCodeData && (
          <>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-4 pl-6 border rounded-full"
              placeholder="Enter Amount..."
              min="0.01"
            />
            <button
              onClick={handleGenerateQR}
              disabled={loading}
              className="py-3 px-6 border-1.25 border-black outline outline-black rounded-full font-inter hover:text-white hover:bg-black text-sm tracking-wide"
            >
              {loading ? "Generating..." : "Confirm"}
            </button>
          </>
        )}

        <div className="flex flex-col items-center">
          {loading && <p>🔄 Generating QR Code...</p>}
          {error && <p className="text-red-500">{error.message}</p>}
          {qrCodeData && (
            <div className="relative flex flex-col items-center">
              <QRCodeCanvas
                value={qrCodeData}
                size={200}
                bgColor="#ffffff" 
                fgColor="#000000" 
                level="H" 
                includeMargin={true}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-black font-bold text-lg bg-white px-2 rounded-md">
                  FLEXPAY
                </span>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="py-3 px-6 border-1.25 border-black outline outline-black rounded-full font-inter hover:text-white hover:bg-black text-sm tracking-wide"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default QRModal;
