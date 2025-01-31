import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_USER } from '../graphql/queries';
import AuthService from '../utils/auth';
import bank from '../assets/building-bank.svg';
import coin from '../assets/coin.svg';
import wallet from '../assets/wallet.svg';
import TransactionHistory from './TransactionHistory';

const Dashboard: React.FC = () => {
  const userProfile = AuthService.getProfile();

  console.log('🔹 User Profile from AuthService:', userProfile); // Debugging

  if (!userProfile || !userProfile.id) {
    console.error('❌ User is not logged in or ID is missing.');
    return <p>Please log in to view this page.</p>;
  }

  const { loading, error, data } = useQuery(GET_USER, {
    variables: { id: userProfile.id }, // ✅ Ensure ID is passed correctly
  });

  if (loading) return <p>Loading...</p>;
  if (error) {
    console.error('❌ Error fetching user data:', error);
    return <p>Error fetching user data: {error.message}</p>;
  }

  const { username, walletBalance } = data.getUser;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center flex-col w-full max-w-4xl mx-auto pt-20">
      <div className="flex flex-row w-full justify-between mb-24">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-gray-400 tracking-widest ">
            Welcome Back
          </p>
          <h1 className="text-4xl font-medium text-black font-ivy tracking-widest ">
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
          <p className="text-sm font-medium text-gray-400 tracking-widest ">
            Current Balance
          </p>
          <p className="text-8xl font-medium text-black font-ivy tracking-widest">
            ${walletBalance.toFixed(2)}
            <span className="font-inter text-base font-medium tracking-widest">
              AUD
            </span>
          </p>
        </div>
        <div className="flex flex-row gap-2.5">
          <button className="py-5 px-12 bg-purple-500 hover:bg-purple-600 text-white rounded-full font-intertext-base tracking-wide flex flex-row gap-3.5 items-center">
            <img src={bank} />
            Deposit
          </button>
          <button className="py-5 px-12 bg-sky-500 hover:bg-sky-600 text-white rounded-full font-intertext-base tracking-wide flex flex-row gap-3.5 items-center">
            <img src={wallet} />
            Withdraw
          </button>
          <button className="py-5 px-12  bg-green-500 hover:bg-green-600 text-white rounded-full font-intertext-base tracking-wide flex flex-row gap-3.5 items-center">
            <img src={coin} />
            Payments
          </button>
        </div>
        {/* 👉 Divider Line */}
        <div className="w-full border-t-2 border-gray-200"></div>
        <div>
          <TransactionHistory userId={userProfile.id} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
