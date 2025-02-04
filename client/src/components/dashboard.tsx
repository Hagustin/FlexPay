import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_USER } from '../graphql/queries';
import AuthService from '../utils/auth';
import bank from '../assets/building-bank.svg';
import coin from '../assets/coin.svg';
import wallet from '../assets/wallet.svg';
import TransactionHistory from './TransactionHistory';
import QRModal from './QrCodeModal';
import QRScanner from './QrCodeScanner';
import WithdrawalModal from './WithdrawalModal';
import PaymentOptionsModal from './PaymentOptionsModal';
import BankDepositModal from './BankDepositModal';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showBankDepositModal, setShowBankDepositModal] = useState(false);
  const [userProfile, setUserProfile] = useState(AuthService.getProfile());

  console.log('🔹 User Profile from AuthService:', userProfile);

  useEffect(() => {
    const handleAuthChange = () => setUserProfile(AuthService.getProfile());
    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, []);

  const userId = userProfile?.id || null;

  if (!userId) {
    const navigate = useNavigate();
    console.error('❌ User is not logged in or ID is missing.');
    return (
      <div className="w-full flex items-center justify-center min-h-screen flex-col text-center gap-3.5 pb-24">
        <p className="font-ivy text-5xl w-2/5 tracking-widest">
          Are You Lost! 😭
        </p>
        <p className="w-72 font-inter text-gray-500 tracking-widest text-sm">
          Please try logging in if you have an account, otherwise signup below
        </p>
        <div className="flex flex-row gap-3.5">
          <button
            className="py-3 px-6 border-1 border-black outline outline-black rounded-full font-inter hover:text-white hover:bg-black text-sm tracking-wide w-auto"
            onClick={() => navigate('/login')}
          >
            Sign In
          </button>
          <button
            className="py-3 px-6 border-1 border-black outline outline-black rounded-full font-inter hover:text-white hover:bg-black text-sm tracking-wide w-auto"
            onClick={() => navigate('/signup')}
          >
            Sign Up
          </button>
        </div>
      </div>
    );
  }

  const { loading, error, data, refetch } = useQuery(GET_USER, {
    skip: !userId,
    variables: userId ? { id: userId } : undefined,
    fetchPolicy: 'network-only',
  });

  if (loading) return <p>Loading...</p>;
  if (error) {
    console.error('❌ Error fetching user data:', error);
    return <p>Error fetching user data: {error.message}</p>;
  }

  const { username, walletBalance } = data.getUser;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center flex-col w-full max-w-4xl mx-auto pt-20">
      <div className="flex flex-row w-full justify-between mb-24 flex-wrap gap-2.5">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-gray-400 tracking-widest">
            Welcome Back
          </p>
          <h1 className="text-3xl sm:text-4xl font-medium text-black font-ivy tracking-widest">
            {username}'s Wallet
          </h1>
        </div>
        <div>
          <button className="py-3 px-6 border-1.25 border-black outline outline-black rounded-full font-inter hover:text-white hover:bg-black text-sm tracking-wide">
            Edit
          </button>
        </div>
      </div>

      {/* 👉 Wallet Contents */}
      <div className="w-full flex flex-col gap-14">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-gray-400 tracking-widest">
            Current Balance
          </p>
          <p className="text-5xl sm:text-8xl font-medium text-black font-ivy tracking-widest">
            ${walletBalance.toFixed(2)}
            <span className="font-inter text-base font-medium tracking-widest">
              {' '}
              AUD
            </span>
          </p>
        </div>
        <div className="flex flex-row gap-2.5 flex-wrap">
          <button
            className="py-5 px-12 bg-purple-500 hover:bg-purple-600 text-white rounded-full font-inter text-base tracking-wide flex flex-row gap-3.5 items-center"
            onClick={() => setShowQRScanner(true)}
          >
            <img src={bank} />
            Transfer
          </button>
          <button
            className="py-5 px-12 bg-sky-500 hover:bg-sky-600 text-white rounded-full font-inter text-base tracking-wide flex flex-row gap-3.5 items-center"
            onClick={() => setShowWithdrawalModal(true)}
          >
            <img src={wallet} />
            Withdraw
          </button>
          <button
            className="py-5 px-12 bg-green-500 hover:bg-green-600 text-white rounded-full font-inter text-base tracking-wide flex flex-row gap-3.5 items-center"
            onClick={() => setShowPaymentOptions(true)}
          >
            <img src={coin} />
            Payments
          </button>
        </div>

        {/* 👉 Transaction History */}
        {userId && <TransactionHistory userId={userId} refetch={refetch} />}

        {/* 👉 Payment Options Modal */}
        {showPaymentOptions && (
          <PaymentOptionsModal
            onClose={() => setShowPaymentOptions(false)}
            onGenerateQR={() => {
              setShowPaymentOptions(false);
              setShowQRModal(true);
            }}
            onBankDeposit={() => {
              setShowPaymentOptions(false);
              setShowBankDepositModal(true);
            }}
          />
        )}

        {/* 👉 QR Code Modal */}
        {userId && showQRModal && (
          <QRModal userId={userId} onClose={() => setShowQRModal(false)} />
        )}
        {userId && showQRScanner && (
          <QRScanner userId={userId} onClose={() => setShowQRScanner(false)} />
        )}

        {/* 👉 Withdrawal Modal */}
        {showWithdrawalModal && (
          <WithdrawalModal
            onClose={() => setShowWithdrawalModal(false)}
            isOpen={showWithdrawalModal}
            children={undefined}
            userId={userId}
          />
        )}

        {/* 👉 Bank Deposit Modal */}
        {showBankDepositModal && (
          <BankDepositModal onClose={() => setShowBankDepositModal(false)} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
