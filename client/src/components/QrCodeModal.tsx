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

  const [generateQR, { loading, error }] = useMutation(GENERATE_QR, {
    onCompleted: (data) => {
      setQrCodeData(data.generateQR.code);
    },
  });

  const handleGenerateQR = () => {
    if (!amount || isNaN(parseFloat(amount))) {
      alert('Please enter a valid amount');
      return;
    }
    generateQR({ variables: { userId, amount: parseFloat(amount) } });
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

        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-4 pl-6 border rounded-full"
          placeholder="Enter Amount..."
        />

        <div className="flex flex-col items-center">
          {loading && <p>Generating...</p>}
          {error && <p className="text-red-500">{error.message}</p>}

          {qrCodeData && (
            <div className="flex flex-col items-center">
              <QRCodeCanvas value={qrCodeData} size={200} />
            </div>
          )}
        </div>

        {/* Buttons stay under the QR code */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleGenerateQR}
            className="py-3 px-6 border-1.25 border-black outline outline-black rounded-full font-inter hover:text-white hover:bg-black text-sm tracking-wide"
          >
            Confirm
          </button>

          <button
            onClick={onClose}
            className="py-3 px-6 border-1.25 border-black outline outline-black rounded-full font-inter hover:text-white hover:bg-black text-sm tracking-wide"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRModal;
