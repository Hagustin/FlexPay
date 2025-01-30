import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_USER } from '../graphql/queries';
import AuthService from '../utils/auth';

const Dashboard: React.FC = () => {
  const userProfile = AuthService.getProfile();
  
  console.log("🔹 User Profile from AuthService:", userProfile); // Debugging

  if (!userProfile || !userProfile.id) {
    console.error("❌ User is not logged in or ID is missing.");
    return <p>Please log in to view this page.</p>;
  }

  const { loading, error, data } = useQuery(GET_USER, {
    variables: { id: userProfile.id }, // ✅ Ensure ID is passed correctly
  });

  if (loading) return <p>Loading...</p>;
  if (error) {
    console.error("❌ Error fetching user data:", error);
    return <p>Error fetching user data: {error.message}</p>;
  }

  const { username, email, walletBalance } = data.getUser;

  return (
    <div className="min-h-screen bg-gray-100">
      <h1>Dashboard</h1>
      <div>
        <p><strong>Username:</strong> {username}</p>
        <p><strong>Email:</strong> {email}</p>
        <p><strong>Wallet Balance:</strong> ${walletBalance.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default Dashboard;
