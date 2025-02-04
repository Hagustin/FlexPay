import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
  Html5QrcodeScanner,
  Html5QrcodeScanType,
  Html5QrcodeSupportedFormats,
} from 'html5-qrcode';
import { SCAN_QR } from '../graphql/mutations';
import { GET_WALLET_BALANCE, GET_TRANSACTIONS } from '../graphql/queries';

interface QRScannerProps {
  onClose: () => void;
  userId: string; // Sender's ID
}

const QRScanner: React.FC<QRScannerProps> = ({ onClose, userId }) => {
  const scannerId = 'qr-scanner';
  const [scanComplete, setScanComplete] = useState(false);

  // Fetch wallet balance
  const { data: balanceData, refetch: refetchBalance } = useQuery(GET_WALLET_BALANCE, {
    variables: { id: userId },
  });

  // Fetch transaction history
  const { refetch: refetchTransactions } = useQuery(GET_TRANSACTIONS, {
    variables: { userId, limit: 10, offset: 0 },
  });

  // Scan QR Code mutation
  const [scanQR, { loading: scanLoading, error: scanError }] = useMutation(SCAN_QR, {
    refetchQueries: [
      { query: GET_WALLET_BALANCE, variables: { id: userId } },
      { query: GET_TRANSACTIONS, variables: { userId, limit: 10, offset: 0 } },
    ],
    awaitRefetchQueries: true,
  });

  // Handle QR scan result
  // Handle QR scan result
  const handleScan = async (data: string | null) => {
    if (!data || scanComplete) return; // Prevent multiple prompts
    
    console.log('✅ Raw QR Code Scanned:', data);
    setScanComplete(true);
  
    try {
      let qrCode = data.trim(); // Ensure no extra spaces
      console.log('🔍 Trimmed QR Code:', qrCode);
  
      // Check if the QR code is JSON or just a string
      try {
        const parsedData = JSON.parse(qrCode);
        if (parsedData.qrCode) {
          qrCode = parsedData.qrCode;
        } else {
          throw new Error('Invalid JSON QR format'); // Force fallback to plain string
        }
      } catch {
        // If parsing fails, assume the QR code is a plain string (UUID)
        console.log('🔍 Assuming plain string QR Code');
      }
  
      if (!qrCode) {
        throw new Error('Invalid QR code format');
      }

      console.log('🔍 Final QR Code:', qrCode);
  
      // Call the scanQR mutation
      const { data: scanData } = await scanQR({
        variables: { userId, qrCode },
      });
  
      console.log('✅ ScanQR Response:', scanData);
      alert('✅ Payment Successful! Wallet Updated.');
  
      // Refresh wallet balance and transactions
      await refetchBalance();
      await refetchTransactions();
  
      onClose();
    } catch (error) {
      console.error('❌ Error processing QR code:', error);
      alert(error instanceof Error ? error.message : 'Unexpected error. Please try again.');
      setScanComplete(false);
    }
  };
  


  // Set up QR scanner
  useEffect(() => {
    const scannerConfig = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      disableFlip: false,
      rememberLastUsedCamera: true,
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      aspectRatio: 1.777,
      useBarCodeDetectorIfSupported: true,
    };

    const html5QrcodeScanner = new Html5QrcodeScanner(scannerId, scannerConfig, false);

    html5QrcodeScanner.render(
      (decodedText) => {
        console.log('✅ QR Code Scanned:', decodedText);
        handleScan(decodedText);
      },
      (errorMessage) => {
        console.log('❌ QR Scanner Error:', errorMessage);
      }
    );

    return () => {
      html5QrcodeScanner
        .clear()
        .catch((error) => console.error('❌ Error clearing scanner:', error));
    };
  }, []); // Runs only once

  return (
    <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='bg-white p-6 rounded-3xl shadow-lg w-96 flex flex-col gap-4'>
        <h2 className='text-sm font-medium text-gray-400 tracking-widest'>Scan QR Code</h2>
        <div id={scannerId} className='w-full h-64 bg-gray-200 flex items-center justify-center' />

        {balanceData ? (
          <p className='text-sm font-medium text-gray-400 tracking-widest'>
            Wallet Balance: ${balanceData?.getUser.walletBalance}
          </p>
        ) : (
          <p className='text-sm font-medium text-gray-400 tracking-widest'>Loading wallet balance...</p>
        )}

        {scanLoading && <p>Processing Payment...</p>}
        {scanError && <p className='text-red-500'>{scanError.message}</p>}

        <button
          onClick={onClose}
          className='py-3 px-6 border-1.25 border-black outline outline-black rounded-full font-inter hover:text-white hover:bg-black text-sm tracking-wide'
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default QRScanner;
