import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { TRANSFER_FUNDS } from '../graphql/mutations';
import { GET_WALLET_BALANCE } from '../graphql/queries';

interface QRScannerProps {
  onClose: () => void;
  userId: string; // Add the userId to track the sender
}

interface QRCodeData {
  receiverId: string;
  amount: number;
}

const QRScanner: React.FC<QRScannerProps> = ({ onClose, userId }) => {
  const scannerId = 'qr-scanner';
  const [qrData, setQrData] = useState<QRCodeData | null>(null); // Store parsed QR data
  const [amount, setAmount] = useState<number | null>(null);

  // Query to get wallet balance of the sender (userId)
  const { data: balanceData, loading: balanceLoading } = useQuery(
    GET_WALLET_BALANCE,
    {
      variables: { id: userId },
    }
  );

  // Mutation for transferring funds
  const [transferFunds, { loading: transferLoading, error: transferError }] =
    useMutation(TRANSFER_FUNDS);

    const handleScan = (data: string | null) => {
      if (data) {
        console.log("🔹 Scanned QR Code:", data);
    
        try {
          const parsedData: QRCodeData = JSON.parse(data); // ✅ Ensure QR code contains valid JSON
          if (!parsedData.receiverId || !parsedData.amount) {
            throw new Error("Invalid QR code format");
          }
    
          setQrData(parsedData);
          setAmount(parsedData.amount);
          alert(`Scanned Data: ${JSON.stringify(parsedData, null, 2)}`);
        } catch (error) {
          console.error("❌ Error parsing QR data:", error);
          alert("Invalid QR code. Please try again.");
        }
      }
    };
    

  const handleError = (err: any) => {
    console.error('❌ QR Scan Error:', err);
  };

  const handleTransfer = () => {
    if (qrData && amount !== null) {
      // Perform transfer if user has enough balance
      if (balanceData && balanceData.getUser.walletBalance >= amount) {
        transferFunds({
          variables: {
            senderId: userId,
            receiverId: qrData.receiverId, // Now safely using receiverId from qrData
            amount: amount,
          },
        })
          .then(() => {
            alert('Transfer Successful');
            onClose(); // Close scanner after successful transfer
          })
          .catch((error) => {
            alert(`Transfer Failed: ${error.message}`);
          });
      } else {
        alert('Insufficient Balance');
      }
    } else {
      alert('Invalid QR data or amount');
    }
  };

  useEffect(() => {
    const html5QrcodeScanner = new Html5QrcodeScanner(
      scannerId,
      { fps: 10, qrbox: 250 },
      false
    );

    html5QrcodeScanner.render(handleScan, handleError);

    return () => {
      html5QrcodeScanner.clear();
    };
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-3xl shadow-lg w-96 flex flex-col gap-4">
        <h2 className="text-sm font-medium text-gray-400 tracking-widest">
          Scan QR Code
        </h2>
        <div
          id={scannerId}
          className="w-full h-64 bg-gray-200 flex items-center justify-center"
        />

        {balanceLoading ? (
          <p>Loading wallet balance...</p>
        ) : (
          <p>Wallet Balance: ${balanceData?.getUser.walletBalance}</p>
        )}

        <button
          onClick={handleTransfer}
          className="py-3 px-6 border-1.25 border-black outline outline-black rounded-full font-inter hover:text-white hover:bg-black text-sm tracking-wide"
        >
          Transfer Funds
        </button>

        {transferLoading && <p>Transferring funds...</p>}
        {transferError && (
          <p className="text-red-500">{transferError.message}</p>
        )}

        <button
          onClick={onClose}
          className="py-3 px-6 border-1.25 border-black outline outline-black rounded-full font-inter hover:text-white hover:bg-black text-sm tracking-wide"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default QRScanner;
