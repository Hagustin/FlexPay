import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Html5QrcodeScanner, Html5QrcodeScanType, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { TRANSFER_FUNDS } from '../graphql/mutations';
import { GET_WALLET_BALANCE } from '../graphql/queries';

interface QRScannerProps {
  onClose: () => void;
  userId: string; // Track sender
}

interface QRCodeData {
  receiverId: string;
  amount: number;
}

const QRScanner: React.FC<QRScannerProps> = ({ onClose, userId }) => {
  const scannerId = 'qr-scanner';
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [scanComplete, setScanComplete] = useState(false); // ✅ Prevents double-scanning

  // Fetch wallet balance
  const { data: balanceData, loading: balanceLoading } = useQuery(GET_WALLET_BALANCE, {
    variables: { id: userId },
  });

  // Transfer funds mutation
  const [transferFunds, { loading: transferLoading, error: transferError }] = useMutation(TRANSFER_FUNDS);

  // Handle QR scan result
  const handleScan = (data: string | null) => {
    if (data && !scanComplete) {
      console.log("✅ QR Code Scanned:", data);
      setScanComplete(true); // ✅ Prevent multiple scans

      try {
        const parsedData: QRCodeData = JSON.parse(data);
        if (!parsedData.receiverId || !parsedData.amount) {
          throw new Error("Invalid QR code format");
        }
        setQrData(parsedData);
        setAmount(parsedData.amount);
        alert(`Scanned Data: ${JSON.stringify(parsedData, null, 2)}`);
      } catch (error) {
        console.error("❌ Error parsing QR data:", error);
        alert("Invalid QR code. Please try again.");
        setScanComplete(false); // ✅ Allow re-scanning after failure
      }
    }
  };

  // Handle transfer funds
  const handleTransfer = () => {
    if (qrData && amount !== null) {
      if (balanceData?.getUser.walletBalance >= amount) {
        transferFunds({
          variables: {
            senderId: userId,
            receiverId: qrData.receiverId,
            amount,
          },
        })
          .then(() => {
            alert("✅ Transfer Successful");
            onClose(); // Close scanner after success
          })
          .catch((error) => {
            alert(`❌ Transfer Failed: ${error.message}`);
          });
      } else {
        alert("⚠️ Insufficient Balance");
      }
    } else {
      alert("❌ Invalid QR data or amount");
    }
  };

  // Set up QR scanner
  useEffect(() => {
    const scannerConfig = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      disableFlip: false,
      rememberLastUsedCamera: true, // ✅ Remember last used camera
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA], // ✅ Force camera usage
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE], // ✅ Support only QR codes
      aspectRatio: 1.777, // ✅ Optimize for mobile screen ratio
      useBarCodeDetectorIfSupported: true, // ✅ Enable native barcode scanning if available
    };

    const html5QrcodeScanner = new Html5QrcodeScanner(scannerId, scannerConfig, false);

    html5QrcodeScanner.render(
      (decodedText) => {
        console.log("✅ QR Code Scanned:", decodedText);
        handleScan(decodedText);
      },
      (errorMessage) => {
        console.log("❌ QR Scanner Error:", errorMessage);
      }
    );

    return () => {
      html5QrcodeScanner.clear().catch((error) => console.error("❌ Error clearing scanner:", error));
    };
  }, []); // ✅ Ensures scanner initializes only once

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-3xl shadow-lg w-96 flex flex-col gap-4">
        <h2 className="text-sm font-medium text-gray-400 tracking-widest">
          Scan QR Code
        </h2>
        <div id={scannerId} className="w-full h-64 bg-gray-200 flex items-center justify-center" />

        {balanceLoading ? (
          <p>Loading wallet balance...</p>
        ) : (
          <p>Wallet Balance: ${balanceData?.getUser.walletBalance}</p>
        )}

        <button
          onClick={handleTransfer}
          disabled={!qrData || scanComplete}
          className="py-3 px-6 border-1.25 border-black outline outline-black rounded-full font-inter hover:text-white hover:bg-black text-sm tracking-wide"
        >
          {transferLoading ? "Transferring..." : "Transfer Funds"}
        </button>

        {transferLoading && <p>Transferring funds...</p>}
        {transferError && <p className="text-red-500">{transferError.message}</p>}

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
